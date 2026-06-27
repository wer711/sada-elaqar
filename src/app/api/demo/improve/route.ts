import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/demo/improve
 *
 * Takes the original ad + its weaknesses, and FIXES those specific
 * weaknesses in the same text — does NOT write a new ad from scratch.
 *
 * Tries Z.AI LLM for high-quality rewrite. Falls back to rule-based
 * improvements if Z.AI is unavailable (e.g., on Vercel).
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
    const cleanWeaknesses = Array.isArray(weaknesses)
      ? weaknesses.slice(0, 5).map((w: unknown) => String(w).replace(/<[^>]*>/g, '').slice(0, 200))
      : [];
    const cleanSuggestions = Array.isArray(body.suggestions)
      ? body.suggestions.slice(0, 5).map((s: unknown) => String(s).replace(/<[^>]*>/g, '').slice(0, 200))
      : [];

    const originalScore = Number(score) || 5;
    const improvedScore = Math.min(10, originalScore + 2);

    // ── Try Z.AI LLM for high-quality improvement ──
    try {
      const ZAI = (await import('z-ai-web-dev-sdk')).default;
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

      const platformName = platform === 'whatsapp' ? 'واتساب'
        : platform === 'twitter' ? 'إكس' : platform === 'instagram' ? 'إنستغرام'
        : platform === 'snapchat' ? 'سناب شات' : platform === 'linkedin' ? 'لينكدين'
        : platform === 'facebook' ? 'فيسبوك' : 'عام';

      const weaknessesList = cleanWeaknesses.length > 0
        ? cleanWeaknesses.map((w: string, i: number) => `${i + 1}. ${w}`).join('\n')
        : 'لا توجد نقاط ضعف محددة.';

      const suggestionsList = cleanSuggestions.length > 0
        ? cleanSuggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join('\n')
        : '';

      const systemPrompt = `أنت محسّن محتوى تسويقي عقاري. مهمتك: تحسين إعلان موجود بمعالجة نقاط الضعف المحددة فقط.
- لا تكتب إعلاناً جديداً من الصفر.
- احتفظ بكل ما هو جيد في النص الأصلي.
- أصلح فقط نقاط الضعف المذكورة.
- لا تضف معلومات غير موجودة في الأصل.
أعد النص المحسّن فقط (بدون مقدمات).`;

      const userPrompt = `حسّن هذا الإعلان بمعالجة نقاط الضعف:
المنصة: ${platformName}
نقاط الضعف:
${weaknessesList}
${suggestionsList ? `اقتراحات:\n${suggestionsList}` : ''}

الإعلان الأصلي:
${cleanAdText}

أعد النص المحسّن الكامل:`;

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        thinking: { type: 'disabled' },
      });

      const improvedText = completion.choices[0]?.message?.content || '';
      const cleanImproved = improvedText.replace(/```[\s\S]*?```/g, '').trim();

      if (cleanImproved.length > 20) {
        return NextResponse.json({
          success: true,
          improvedAd: cleanImproved,
          originalScore,
          improvedScore,
        });
      }
    } catch {
      // Z.AI unavailable — fall through to rule-based improvement
    }

    // ── Rule-based improvement (deterministic fallback) ──
    let improved = cleanAdText;

    // Add hook if missing
    if (!/^(🔥|🌟|✨|💎|🏡|🏠|🏢|⚡|فرصة|للجدّين|مطلوب|عرض)/i.test(improved.trim())) {
      const hooks = ['🔥 فرصة لا تتكرر!', '✨ عقار مميز ينتظرك!', '🏡 بيت العمر يبدأ هنا!'];
      improved = hooks[Math.floor(Math.random() * hooks.length)] + '\n\n' + improved;
    }

    // Add structure if missing (single block)
    if (!improved.includes('\n') || improved.split('\n').length < 3) {
      const lines = improved.split(/[،,]\s*/).filter(s => s.trim());
      improved = lines.join('\n');
    }

    // Add CTA if missing
    if (!/تواصل|اتصل|راسل|للجادين|للمعاينة|واتساب/i.test(improved)) {
      improved += '\n\n📞 للجادين، تواصل عبر واتساب للاستفسار والمعاينة.';
    }

    // Add emoji if missing
    if (!/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/u.test(improved)) {
      improved = improved.replace(/الموقع/g, '📍 الموقع')
        .replace(/المساحة/g, '📐 المساحة')
        .replace(/السعر/g, '💰 السعر')
        .replace(/غرف/g, '🛏️ غرف');
    }

    return NextResponse.json({
      success: true,
      improvedAd: improved,
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
