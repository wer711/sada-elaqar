import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * POST /api/payment/paypal/create-order
 *
 * Creates a PayPal order on the server side and returns the order ID.
 * The frontend PayPal SDK uses this ID to render the payment button.
 *
 * Flow:
 *   1. Frontend calls this endpoint with { visitorId, leadId }
 *   2. We pre-create a Subscription record (status='pending_payment')
 *   3. We call PayPal's API to create an order for $29 USD
 *   4. We return { orderID, subscriptionId, founderNumberPreview }
 *   5. Frontend passes orderID to the PayPal SDK button
 *   6. User pays in the PayPal popup
 *   7. PayPal calls onApprove → frontend calls /api/payment/paypal/capture
 *
 * PayPal API docs: https://developer.paypal.com/api/orders/v2/
 *
 * Env vars:
 *   PAYPAL_CLIENT_ID     — PayPal REST app client ID
 *   PAYPAL_CLIENT_SECRET — PayPal REST app secret
 *   PAYPAL_API_BASE     — https://api-m.paypal.com (live) or https://api-m.sandbox.paypal.com (sandbox)
 */

const FOUNDER_PLAN_PRICE = 9; // USD/month
const FOUNDER_PLAN_TARGET = 50;

// ─── PayPal access token (cached per request) ───
async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const apiBase = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret) {
    throw new Error('PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET not set');
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PayPal auth failed: ${res.status} ${text}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { visitorId, leadId } = body;

    if (!visitorId) {
      return NextResponse.json({ error: 'معرّف الزائر مطلوب' }, { status: 400 });
    }

    // ── Check PayPal is configured ──
    if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
      return NextResponse.json({
        success: false,
        code: 'PAYPAL_NOT_CONFIGURED',
        message: 'بوابة الدفع غير مُعدّة بعد. أضف PAYPAL_CLIENT_ID و PAYPAL_CLIENT_SECRET في إعدادات الموقع.',
      }, { status: 503 });
    }

    // ── Check if already a founder ──
    const existing = await db.subscription.findFirst({
      where: { visitorId, status: { in: ['active', 'pending_payment'] }, plan: 'founder' },
      select: { id: true, status: true, founderNumber: true },
    });
    if (existing) {
      return NextResponse.json({
        success: true,
        alreadySubscribed: true,
        message: existing.status === 'active'
          ? `أنت داعم مبكر #${existing.founderNumber}! شكراً لك.`
          : 'بدأت عملية الاشتراك — أكمل الدفع',
      });
    }

    // ── Check capacity ──
    const currentCount = await db.subscription.count({
      where: { plan: 'founder', status: 'active' },
    });
    if (currentCount >= FOUNDER_PLAN_TARGET) {
      return NextResponse.json({
        error: 'اكتمل العدد المبكر للداعمين (١٠٠). سجّل في قائمة الانتظار.',
        code: 'FOUNDERS_FULL',
      }, { status: 409 });
    }

    // ── Pre-create the subscription as pending_payment ──
    const subscription = await db.subscription.create({
      data: {
        visitorId,
        leadId: leadId || null,
        plan: 'founder',
        status: 'pending_payment',
        paymentProvider: 'paypal',
        amount: FOUNDER_PLAN_PRICE,
        currency: 'USD',
      },
    });

    // ── Create the PayPal order ──
    const accessToken = await getPayPalAccessToken();
    const apiBase = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

    const orderRes = await fetch(`${apiBase}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          reference_id: subscription.id,
          description: 'صدى العقار — داعم مبكر',
          amount: {
            currency_code: 'USD',
            value: FOUNDER_PLAN_PRICE.toFixed(2),
          },
        }],
        // Pass subscriptionId + visitorId so the webhook can link back
        custom_id: subscription.id,
      }),
    });

    if (!orderRes.ok) {
      const errText = await orderRes.text();
      console.error('PayPal create-order failed:', errText);
      // Mark subscription as failed so it doesn't block re-tries
      await db.subscription.update({
        where: { id: subscription.id },
        data: { status: 'failed' },
      });
      return NextResponse.json({
        error: 'تعذّر إنشاء طلب الدفع على PayPal',
        details: errText,
      }, { status: 502 });
    }

    const order = await orderRes.json();

    return NextResponse.json({
      success: true,
      orderID: order.id,
      subscriptionId: subscription.id,
      previewFounderNumber: currentCount + 1,
      amount: FOUNDER_PLAN_PRICE,
      currency: 'USD',
    });
  } catch (error) {
    console.error('PayPal create-order error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء طلب الدفع' }, { status: 500 });
  }
}
