import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

/**
 * POST /api/demo/improve
 *
 * Takes an old real estate ad + audit result, and generates a fully improved
 * professional version that addresses all weaknesses and reaches 10/10 quality.
 *
 * Flow:
 *   1. User pastes old ad → /api/demo/audit gives score + weaknesses
 *   2. User clicks "حسّن إعلانك" → this endpoint rewrites the ad
 *   3. First 2-3 improvements are free (tracked client-side via localStorage)
 *   4. After 2-3 → paywall (founder subscription)
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adText, platform, city, country, weaknesses, score } = body;

    if (!adText || typeof adText !== 'string' || adText.trim().length < 10) {
      return NextResponse.json(
        { error: 'نص الإعلان مطلوب (١٠ أحرف على الأقل)' },
        { status: 400 }
      );
    }

    const cleanAdText = adText.trim().slice(0, 3000);

    // Sanitize weaknesses (prevent injection)
    const cleanWeaknesses = Array.isArray(weaknesses)
      ? weaknesses.slice(0, 5).map((w: unknown) => String(w).replace(/<[^>]*>/g, '').slice(0, 200))
      : [];

    const platformName = platform === 'whatsapp' ? 'واتساب'
      : platform === 'twitter' ? 'إكس (تويتر)'
      : platform === 'instagram' ? 'إنستغرام'
      : platform === 'snapchat' ? 'سناب شات'
      : platform === 'linkedin' ? 'لينكدين'
      : platform === 'facebook' ? 'فيسبوك'
      : 'عام';

    const systemPrompt = `أنت كاتب محتوى تسويقي عقاري محترف. مهمتك: إعادة كتابة إعلان عقاري ضعيف وتحويله إلى إعلان احترافي يصل إلى درجة ١٠/١٠.

قواعد الكتابة:
- اكتب إعلاناً كاملاً جاهزاً للنشر (ليس مجرد اقتراحات)
- عالج كل نقاط الضعف المذكورة
- استخدم اللهجة المناسبة للسوق المحلي
- ابدأ بجملة افتتاحية قوية تجذب الانتباه
- اذكر السعر والمساحة والموقع والمميزات بوضوح
- اختم بدعوة واضحة للتواصل
- استخدم إيموجي مناسب (٢-٤ كحد أقصى)
- اجعل النص منظّماً ومقروءاً

أعد النص المحسّن فقط (بدون مقدمات أو شرح).`;

    const userPrompt = `أعد كتابة هذا الإعلان العقاري ليصبح احترافياً (١٠/١٠):

المنصة: ${platformName}
المدينة: ${city || 'غير محددة'}
الدولة: ${country || 'غير محددة'}
الدرجة الحالية: ${score || '?'}/١٠

نقاط الضعف التي يجب معالجتها:
${cleanWeaknesses.map((w: string, i: number) => `${i + 1}. ${w}`).join('\n')}

الإعلان الأصلي:
${cleanAdText}

اكتب النسخة المحسّنة الكاملة:`;

    // ── Call Z.AI ──
    let zai: Awaited<ReturnType<typeof ZAI.create>>;
    try {
      zai = await ZAI.create();
    } catch {
      const baseUrl = process.env.Z_AI_BASE_URL;
      const apiKey = process.env.Z_AI_API_KEY;
      const token = process.env.Z_AI_TOKEN;
      const userId = process.env.Z_AI_USER_ID;
      if (!baseUrl || !apiKey) {
        throw new Error('Z.AI configuration missing');
      }
      const config: Record<string, string> = { baseUrl, apiKey };
      if (token) config.token = token;
      if (userId) config.userId = userId;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      zai = new (ZAI as any)(config);
    }

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      thinking: { type: 'disabled' },
    });

    const improvedText = completion.choices[0]?.message?.content || '';

    if (!improvedText || improvedText.trim().length < 20) {
      return NextResponse.json(
        { error: 'تعذّر تحسين الإعلان. حاول مرة أخرى.' },
        { status: 500 }
      );
    }

    // Clean up: remove markdown code fences if present
    const cleanImproved = improvedText.replace(/```[\s\S]*?```/g, '').trim();

    return NextResponse.json({
      success: true,
      improvedAd: cleanImproved,
      originalScore: score || 0,
      improvedScore: 10, // The improved version targets 10/10
    });
  } catch (error) {
    console.error('Improve error:', error);
    return NextResponse.json(
      { error: 'تعذّر تحسين الإعلان. حاول مرة أخرى.' },
      { status: 500 }
    );
  }
}
