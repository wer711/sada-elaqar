import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

/**
 * POST /api/demo/audit
 *
 * Smart Auditor — analyzes an old real estate ad and gives:
 * - Score (1-10) based on FIXED criteria (each criterion gives specific points)
 * - Strengths (what's good)
 * - Weaknesses (what's missing/wrong)
 * - Suggestions (how to fix each weakness)
 *
 * The scoring is rule-based to ensure consistency: the same ad always gets
 * approximately the same score (±1), unlike free-form LLM scoring.
 */

interface AuditResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { adText, platform, city, country } = body;

    if (!adText || typeof adText !== 'string' || adText.trim().length < 10) {
      return NextResponse.json(
        { error: 'الرجاء لصق نص الإعلان (١٠ أحرف على الأقل)' },
        { status: 400 }
      );
    }

    const cleanAdText = adText.trim().slice(0, 3000);

    const platformName = platform === 'whatsapp' ? 'واتساب'
      : platform === 'twitter' ? 'إكس (تويتر)'
      : platform === 'instagram' ? 'إنستغرام'
      : platform === 'snapchat' ? 'سناب شات'
      : platform === 'linkedin' ? 'لينكدين'
      : platform === 'facebook' ? 'فيسبوك'
      : 'عام';

    // ── Rule-based pre-scoring (deterministic) ──
    // We check for presence of key elements before calling the LLM,
    // so the score is anchored to objective criteria, not just LLM opinion.
    const lowerAd = cleanAdText.toLowerCase();
    const hasPrice = /ريال|درهم|دينار|جنيه|دولار|\$\s?\d|سعر|للبيع بـ|بسعر/i.test(cleanAdText);
    const hasArea = /\d+\s*م²|متر|مساحة/i.test(cleanAdText);
    const hasRooms = /غرف|غرفة|حمام|مطبخ|مجالس|صالة/i.test(cleanAdText);
    const hasLocation = city ? cleanAdText.includes(city) : /حي|منطقة|شارع|قرب|موقع/i.test(cleanAdText);
    const hasCTA = /تواصل|اتصل|راسل|للجادين|للمعاينة|whatsapp|واتساب|اضغط|اتصال/i.test(cleanAdText);
    const hasEmoji = /[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]/u.test(cleanAdText);
    const hasHook = /^(🔥|🌟|✨|💎|🏡|🏠|🏢|⚡|فرصة|للجدّين|مطلوب|عرض|فرصة لا|لا تُعوّض|حصري)/i.test(cleanAdText.trim());
    const isStructured = cleanAdText.includes('\n') && cleanAdText.split('\n').length >= 3;
    const hasFeatures = /مصعد|موقف|مسبح|حديقة|تشطيب|تكييف|أمان|مفروش|مرافق|إطلالة|شرفة/i.test(cleanAdText);

    // Calculate base score (0-10) from rules
    let ruleScore = 0;
    if (hasPrice) ruleScore += 1.5;
    if (hasArea) ruleScore += 1;
    if (hasRooms) ruleScore += 1;
    if (hasLocation) ruleScore += 1;
    if (hasCTA) ruleScore += 1.5;
    if (hasEmoji) ruleScore += 0.5;
    if (hasHook) ruleScore += 1;
    if (isStructured) ruleScore += 1;
    if (hasFeatures) ruleScore += 1;
    // Cap at 9 — 10 is reserved for LLM-verified excellence
    ruleScore = Math.min(9, Math.round(ruleScore));

    // ── Build audit prompt ──
    // The LLM's job is now: (1) confirm/adjust the rule-based score ±1,
    // (2) identify specific strengths/weaknesses, (3) give actionable suggestions.
    // This makes scoring consistent because it's anchored to rules.
    const systemPrompt = `أنت مدقق محتوى تسويقي عقاري محترف. تحلل الإعلانات العقارية وتعطي تقييماً دقيقاً ومتسقاً.

قمتُ بتقييم مبدئي للإعلان بناءً على معايير موضوعية. درجتي المبدئية: ${ruleScore}/١٠.

مهمتك:
1. راجع درجتي المبدئية — يمكنك رفعها أو خفضها بمقدار ١ فقط (إذا رأيت جودة استثنائية أو أخطاء فادحة).
2. اذكر ٢-٣ نقاط قوة فعلية في النص.
3. اذكر ٢-٣ نقاط ضعف فعلية تحتاج تحسين.
4. لكل نقطة ضعف، اكتب اقتراحاً محدداً وقابلاً للتنفيذ (ليس عاماً).

⚠️ قواعد صارمة:
- التقييم يجب أن يكون متسقاً: نفس النص = نفس الدرجة (±١).
- لا ترفع الدرجة فوق ٩ إلا إذا كان الإعلان احترافياً فعلاً بكل المعايير.
- نقاط الضعف يجب أن تكون محددة (مثال: "لم تذكر طريقة الدفع" وليس "النص يحتاج تحسين").
- الاقتراحات يجب أن تكون قابلة للتنفيذ مباشرة (مثال: "أضف جملة: يقبل التقسيط" وليس "حسّن العرض").

أعد النتيجة بصيغة JSON فقط:
{
  "score": رقم من 1 إلى 10,
  "strengths": ["نقطة قوة 1", "نقطة قوة 2"],
  "weaknesses": ["نقطة ضعف 1 محددة", "نقطة ضعف 2 محددة"],
  "suggestions": ["اقتراح 1 قابل للتنفيذ", "اقتراح 2 قابل للتنفيذ"]
}`;

    const userPrompt = `حلّل هذا الإعلان العقاري:

المنصة: ${platformName}
المدينة: ${city || 'غير محددة'}
الدولة: ${country || 'غير محددة'}

الدرجة المبدئية (من معايير موضوعية): ${ruleScore}/١٠
- ذكر السعر: ${hasPrice ? '✓' : '✗'}
- ذكر المساحة: ${hasArea ? '✓' : '✗'}
- ذكر الغرف/المرافق: ${hasRooms ? '✓' : '✗'}
- ذكر الموقع: ${hasLocation ? '✓' : '✗'}
- دعوة للتواصل: ${hasCTA ? '✓' : '✗'}
- إيموجي: ${hasEmoji ? '✓' : '✗'}
- جملة افتتاحية جذابة: ${hasHook ? '✓' : '✗'}
- نص منظّم (أسطر متعددة): ${isStructured ? '✓' : '✗'}
- ذكر مميزات: ${hasFeatures ? '✓' : '✗'}

نص الإعلان:
${cleanAdText}

أعطِ التقييم النهائي بصيغة JSON.`;

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
      // Try .create() first (works locally with .z-ai-config)
      zai = await ZAI.create();
    } catch {
      // Production: construct directly from hardcoded config
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

    const text = completion.choices[0]?.message?.content || '';
    const clean = text.replace(/```json|```/g, '').trim();

    let parsed: AuditResult;
    try {
      parsed = JSON.parse(clean);
    } catch {
      // Fallback: use rule-based score only
      parsed = {
        score: ruleScore,
        strengths: hasPrice ? ['تم ذكر السعر'] : ['تم ذكر نوع العقار'],
        weaknesses: [
          ...(hasCTA ? [] : ['لا توجد دعوة واضحة للتواصل']),
          ...(hasHook ? [] : ['الجملة الافتتاحية ضعيفة']),
          ...(isStructured ? [] : ['النص غير منظّم']),
        ].slice(0, 3),
        suggestions: [
          ...(hasCTA ? [] : ['أضف في النهاية: "للجادين، تواصل عبر واتساب"']),
          ...(hasHook ? [] : ['ابدأ بجملة جذابة: "🔥 فرصة لا تتكرر في..."']),
          ...(isStructured ? [] : ['قسّم النص لأسطر: نوع العقار / الموقع / السعر / المميزات']),
        ].slice(0, 3),
      };
    }

    // ── Validate + clamp score ──
    // The LLM score must be within ±1 of the rule-based score for consistency.
    let finalScore = Number(parsed.score) || ruleScore;
    finalScore = Math.max(ruleScore - 1, Math.min(ruleScore + 1, finalScore));
    finalScore = Math.min(10, Math.max(1, finalScore));

    const strengths = Array.isArray(parsed.strengths)
      ? parsed.strengths.slice(0, 5).map((s: unknown) => String(s).replace(/<[^>]*>/g, '').slice(0, 200))
      : [];
    const weaknesses = Array.isArray(parsed.weaknesses)
      ? parsed.weaknesses.slice(0, 5).map((w: unknown) => String(w).replace(/<[^>]*>/g, '').slice(0, 200))
      : [];
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions.slice(0, 5).map((s: unknown) => String(s).replace(/<[^>]*>/g, '').slice(0, 200))
      : [];

    return NextResponse.json({
      success: true,
      score: finalScore,
      strengths,
      weaknesses,
      suggestions,
    });
  } catch (error) {
    console.error('Audit error:', error);
    return NextResponse.json(
      { error: 'تعذّر تحليل الإعلان. حاول مرة أخرى.' },
      { status: 500 }
    );
  }
}
