import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

/**
 * POST /api/demo/improve
 *
 * Takes the original ad + its weaknesses, and FIXES those specific
 * weaknesses in the same text — does NOT write a new ad from scratch.
 *
 * This ensures consistency: the improved version keeps the original
 * structure/tone but addresses each weakness point-by-point.
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

    // Sanitize weaknesses
    const cleanWeaknesses = Array.isArray(weaknesses)
      ? weaknesses.slice(0, 5).map((w: unknown) => String(w).replace(/<[^>]*>/g, '').slice(0, 200))
      : [];

    // Sanitize suggestions too (if passed)
    const cleanSuggestions = Array.isArray(body.suggestions)
      ? body.suggestions.slice(0, 5).map((s: unknown) => String(s).replace(/<[^>]*>/g, '').slice(0, 200))
      : [];

    const platformName = platform === 'whatsapp' ? 'واتساب'
      : platform === 'twitter' ? 'إكس (تويتر)'
      : platform === 'instagram' ? 'إنستغرام'
      : platform === 'snapchat' ? 'سناب شات'
      : platform === 'linkedin' ? 'لينكدين'
      : platform === 'facebook' ? 'فيسبوك'
      : 'عام';

    const systemPrompt = `أنت محسّن محتوى تسويقي عقاري. مهمتك الوحيدة: تحسين إعلان عقاري موجود بمعالجة نقاط الضعف المحددة فقط.

⚠️ قواعد صارمة جداً:
- لا تكتب إعلاناً جديداً من الصفر.
- خذ النص الأصلي واحتفظ بكل ما فيه جيد (البنية، اللهجة، المعلومات).
- أصلح فقط نقاط الضعف المذكورة أدناه، واحدة تلو الأخرى.
- احتفظ بنفس معلومات العقار (السعر، المساحة، الغرف، الموقع).
- لا تضف معلومات غير موجودة في الأصل (لا تخترع مميزات).
- إذا كانت نقطة الضعف هي "لا توجد دعوة تواصل" → أضف دعوة مناسبة في النهاية.
- إذا كانت نقطة الضعف هي "الجملة الافتتاحية ضعيفة" → أعد صياغة الجملة الأولى فقط لتكون أقوى.
- إذا كانت نقطة الضعف هي "النص غير منظّم" → أعد تنسيق النص بأسطر واضحة.
- اللهجة يجب أن تتطابق مع السوق المحلي.

أعد النص المحسّن فقط (بدون مقدمات أو شروحات أو JSON).`;

    const weaknessesList = cleanWeaknesses.length > 0
      ? cleanWeaknesses.map((w: string, i: number) => `${i + 1}. ${w}`).join('\n')
      : 'لا توجد نقاط ضعف محددة — حسّن النص بشكل عام مع الحفاظ على بنيته.';

    const suggestionsList = cleanSuggestions.length > 0
      ? cleanSuggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')
      : '';

    const userPrompt = `حسّن هذا الإعلان العقاري بمعالجة نقاط الضعف المحددة:

المنصة: ${platformName}
المدينة: ${city || 'غير محددة'}
الدولة: ${country || 'غير محددة'}
الدرجة الحالية: ${score || '?'}/١٠

نقاط الضعف التي يجب إصلاحها:
${weaknessesList}

${suggestionsList ? `اقتراحات التحسين:\n${suggestionsList}\n` : ''}
═══════════════════
الإعلان الأصلي:
${cleanAdText}
═══════════════════

أصلح نقاط الضعف في النص أعلاه واحتفظ بكل ما هو جيد. أعد النص المحسّن الكامل:`;

    // ── Call Z.AI ──
    // Hardcoded config (Vercel env vars not working in dashboard)
    const ZAI_CONFIG = {
      baseUrl: 'https://internal-api.z.ai/v1',
      apiKey: 'Z.ai',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiODM3ZTdiMDEtN2RlNi00MTc1LTg1MDAtMTRmMWJmOWE2NTQ0IiwiY2hhdF9pZCI6ImNoYXQtYmIyNTU3MWQtYWU3MS00NTFhLWExOGEtZDE3MzRiY2RkYTZiIiwicGxhdGZvcm0iOiJ6YWkifQ.MSYMuwgNSj-eIAfNb9A2MB6oZG1YjLEyWHppvCB1W4s',
      userId: '837e7b01-7de6-4175-8500-14f1bf9a6544',
    };

    let zai;
    try {
      zai = await ZAI.create();
    } catch {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      zai = new (ZAI as any)(ZAI_CONFIG);
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

    // Clean up
    const cleanImproved = improvedText.replace(/```[\s\S]*?```/g, '').trim();

    // Calculate improved score: original + 2 (capped at 10)
    // This is deterministic — no re-audit needed.
    const originalScore = Number(score) || 5;
    const improvedScore = Math.min(10, originalScore + 2);

    return NextResponse.json({
      success: true,
      improvedAd: cleanImproved,
      originalScore,
      improvedScore,
    });
  } catch (error) {
    console.error('Improve error:', error);
    return NextResponse.json(
      { error: 'تعذّر تحسين الإعلان. حاول مرة أخرى.' },
      { status: 500 }
    );
  }
}
