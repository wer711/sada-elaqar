import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rating, category, feedback, visitorId, leadId, contactConsent } = body;

    // ── Validate ──
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'التقييم مطلوب (من ١ إلى ٥ نجوم)' }, { status: 400 });
    }
    if (!feedback || typeof feedback !== 'string' || feedback.trim().length < 5) {
      return NextResponse.json({ error: 'الرجاء كتابة ملاحظتك (٥ أحرف على الأقل)' }, { status: 400 });
    }

    const validCategories = ['feature_request', 'demo_improvement', 'bug', 'pricing_suggestion', 'general'];
    const resolvedCategory = validCategories.includes(category) ? category : 'general';

    // Cap feedback length to prevent abuse
    const cleanFeedback = feedback.trim().slice(0, 2000);

    // ── Is this visitor a paying founder? ──
    // If they have an active Subscription with their visitorId, mark their
    // feedback as priority (shows up first in the CRM sheet + gets acted on first).
    let isPaid = false;
    let priority = false;
    if (visitorId && typeof visitorId === 'string' && visitorId.length > 0) {
      try {
        const sub = await db.subscription.findFirst({
          where: {
            visitorId,
            status: 'active',
            plan: 'founder',
          },
          select: { id: true, founderNumber: true },
        });
        if (sub) {
          isPaid = true;
          priority = true; // founders always get priority
        }
      } catch {
        // DB unavailable — continue without paid flag
      }
    }

    // ── Save to DB ──
    const record = await db.feedback.create({
      data: {
        visitorId: visitorId || null,
        leadId: leadId || null,
        rating,
        category: resolvedCategory,
        feedback: cleanFeedback,
        isPaid,
        priority,
        contactConsent: !!contactConsent,
        source: 'landing',
      },
    });

    // ── Sync to Google Sheets (non-blocking) ──
    // Founders → Feedback_Founder sheet (priority), free users → Feedback_Free.
    try {
      const GOOGLE_SHEETS_WEBHOOK = process.env.GOOGLE_SHEETS_WEBHOOK_URL
        || 'https://script.google.com/macros/s/AKfycbwTA4CjikJ39iQSrjFG7gQzpbwr_2kud1JVhJvVamIhp-z7d2F5C8Cl4qTCqtuCoTsk9g/exec';
      if (GOOGLE_SHEETS_WEBHOOK) {
        const now = new Date().toISOString();
        await fetch(GOOGLE_SHEETS_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          redirect: 'follow',
          body: JSON.stringify({
            sheet: isPaid ? 'Feedback_Founder' : 'Feedback_Free',
            timestamp: now,
            visitorId: visitorId || '',
            leadId: leadId || '',
            rating,
            category: resolvedCategory,
            feedback: cleanFeedback,
            priority,
            contactConsent: !!contactConsent,
            source: 'landing',
          }),
        });
      }
    } catch {
      // Don't fail if Sheets sync fails
    }

    return NextResponse.json({
      success: true,
      id: record.id,
      priority,
      message: priority
        ? 'شكراً يا داعم! ملاحظتك في أعلى قائمتنا — سنطلع عليها أولاً.'
        : 'شكراً لملاحظتك! نقرأ كل ملاحظة ونأخذها بعين الاعتبار.',
    });
  } catch (error) {
    console.error('Feedback error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء إرسال الملاحظة' }, { status: 500 });
  }
}
