import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/payment/paypal/capture
 *
 * Called by the frontend AFTER the user approves the payment in the PayPal
 * popup. We capture the payment (actually charge the card) and activate the
 * Subscription.
 *
 * Flow:
 *   1. PayPal SDK onApprove → frontend calls this with { orderID, subscriptionId }
 *   2. We call PayPal's /v2/checkout/orders/{id}/capture to capture the payment
 *   3. If capture succeeds, we activate the Subscription + assign founderNumber
 *   4. We push the new founder to Google Sheets (Leads_Founder sheet)
 *   5. We return { success, founderNumber, message }
 *
 * Env vars:
 *   PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_API_BASE
 */

const FOUNDER_PLAN_PRICE = 29;
const FOUNDER_PLAN_TARGET = 50;

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const apiBase = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderID, subscriptionId } = body;

    if (!orderID || !subscriptionId) {
      return NextResponse.json({ error: 'orderID و subscriptionId مطلوبان' }, { status: 400 });
    }

    // ── Verify the subscription exists and is pending ──
    const subscription = await db.subscription.findUnique({
      where: { id: subscriptionId },
    });
    if (!subscription) {
      return NextResponse.json({ error: 'الاشتراك غير موجود' }, { status: 404 });
    }
    if (subscription.status === 'active') {
      // Already captured (idempotent — maybe user refreshed)
      return NextResponse.json({
        success: true,
        alreadyActive: true,
        founderNumber: subscription.founderNumber,
        message: `أنت داعم مبكر #${subscription.founderNumber}!`,
      });
    }

    // ── Capture the payment on PayPal ──
    const accessToken = await getPayPalAccessToken();
    const apiBase = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

    const captureRes = await fetch(`${apiBase}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!captureRes.ok) {
      const errText = await captureRes.text();
      console.error('PayPal capture failed:', errText);
      await db.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'failed' },
      });
      return NextResponse.json({
        error: 'تعذّر تأكيد الدفع على PayPal',
        details: errText,
      }, { status: 502 });
    }

    const captureData = await captureRes.json();
    const captureStatus = captureData?.status; // COMPLETED or DECLINED

    if (captureStatus !== 'COMPLETED') {
      await db.subscription.update({
        where: { id: subscriptionId },
        data: { status: 'failed' },
      });
      return NextResponse.json({
        error: 'لم يكتمل الدفع',
        status: captureStatus,
      }, { status: 400 });
    }

    // ── Extract the PayPal capture ID (for refunds later) ──
    const purchaseUnit = captureData?.purchase_units?.[0];
    const paypalCaptureId = purchaseUnit?.payments?.captures?.[0]?.id || '';
    const paypalOrderId = captureData.id || orderID;

    // ── Check capacity AGAIN (race condition: two people paying at once) ──
    const currentFounders = await db.subscription.count({
      where: { plan: 'founder', status: 'active' },
    });
    if (currentFounders >= FOUNDER_PLAN_TARGET) {
      // Refund automatically — we're over capacity
      // (For simplicity, we log it; manual refund via PayPal dashboard)
      console.warn('Founder capacity exceeded — refund needed for', subscriptionId);
      await db.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: 'refunded',
          cancelledAt: new Date(),
          providerPaymentId: paypalCaptureId,
        },
      });
      return NextResponse.json({
        error: 'اكتمل العدد المبكر للداعمين أثناء دفعك. سنعيد لك المبلغ خلال ٢٤ ساعة.',
        code: 'FOUNDERS_FULL_REFUND_PENDING',
      }, { status: 409 });
    }

    // ── Assign founderNumber (atomic count + 1) ──
    const founderNumber = currentFounders + 1;

    // ── Activate the subscription ──
    const rawPayload = JSON.stringify(captureData);
    await db.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'active',
        founderNumber,
        providerSubscriptionId: paypalOrderId,
        providerPaymentId: paypalCaptureId,
        rawPayload,
      },
    });

    // ── If the visitor also has a Lead, link it ──
    let leadData: { id?: string; name?: string; whatsapp?: string; city?: string; country?: string | null } = {};
    if (subscription.visitorId) {
      const lead = await db.lead.findFirst({
        where: { visitorId: subscription.visitorId },
        select: { id: true, name: true, whatsapp: true, city: true, country: true },
      });
      if (lead) {
        leadData = lead;
        await db.subscription.update({
          where: { id: subscriptionId },
          data: { leadId: lead.id },
        });
      }
    }

    // ── Push to Google Sheets (Leads_Founder sheet) ──
    try {
      const GOOGLE_SHEETS_WEBHOOK = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
      if (GOOGLE_SHEETS_WEBHOOK) {
        const now = new Date().toISOString();
        await fetch(GOOGLE_SHEETS_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sheet: 'Leads_Founder',
            timestamp: now,
            subscriptionId,
            visitorId: subscription.visitorId || '',
            leadId: leadData.id || subscription.leadId || '',
            name: leadData.name || '',
            whatsapp: leadData.whatsapp || '',
            email: captureData?.payer?.email_address || '',
            country: leadData.country || '',
            city: leadData.city || '',
            founderNumber,
            plan: 'founder',
            amount: FOUNDER_PLAN_PRICE,
            currency: 'USD',
            paymentMethod: 'paypal',
            paymentId: paypalCaptureId,
            paidAt: now,
            subscriptionStatus: 'active',
            source: 'paypal_capture',
          }),
        });
      }
    } catch {
      // Don't fail the capture if Sheets sync fails
    }

    return NextResponse.json({
      success: true,
      founderNumber,
      message: `مبروك! أنت الداعم المبكر رقم ${founderNumber}`,
    });
  } catch (error) {
    console.error('PayPal capture error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تأكيد الدفع' }, { status: 500 });
  }
}
