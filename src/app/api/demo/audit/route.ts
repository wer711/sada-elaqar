import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/demo/audit
 *
 * Smart Auditor — analyzes an old real estate ad and gives:
 * - Score (1-10) based on FIXED criteria (each criterion gives specific points)
 * - Strengths (what's good)
 * - Weaknesses (what's missing/wrong)
 * - Suggestions (how to fix each weakness)
 *
 * Uses rule-based scoring for consistency + tries Z.AI LLM for richer analysis.
 * Falls back to rule-based analysis if Z.AI is unavailable (e.g., on Vercel).
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

    // ── Rule-based scoring (deterministic, always works) ──
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
    ruleScore = Math.min(9, Math.round(ruleScore));

    // ── Build rule-based analysis (always available) ──
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const suggestions: string[] = [];

    if (hasPrice) strengths.push('تم ذكر السعر بوضوح');
    if (hasArea) strengths.push('تم ذكر المساحة');
    if (hasRooms) strengths.push('تم ذكر عدد الغرف');
    if (hasLocation) strengths.push('تم تحديد الموقع');
    if (hasCTA) strengths.push('توجد دعوة للتواصل');
    if (hasEmoji) strengths.push('استخدام إيموجي مناسبة');
    if (hasHook) strengths.push('جملة افتتاحية جذابة');
    if (isStructured) strengths.push('النص منظّم في أسطر واضحة');
    if (hasFeatures) strengths.push('تم ذكر مميزات العقار');

    if (!hasHook) { weaknesses.push('لا توجد جملة افتتاحية جذابة'); suggestions.push('ابدأ بجملة قوية مثل: "🔥 فرصة لا تتكرر في..."'); }
    if (!hasCTA) { weaknesses.push('لا توجد دعوة واضحة للتواصل'); suggestions.push('أضف في النهاية: "للجادين، تواصل عبر واتساب"'); }
    if (!hasPrice) { weaknesses.push('لم يتم ذكر السعر'); suggestions.push('أضف السعر بوضوح: "السعر: ٨٥٠٬٠٠٠ ريال"'); }
    if (!hasArea) { weaknesses.push('لم يتم ذكر المساحة'); suggestions.push('أضف المساحة: "المساحة: ١٥٠ م²"'); }
    if (!isStructured) { weaknesses.push('النص غير منظّم — كتلة واحدة صعبة القراءة'); suggestions.push('قسّم النص لأسطر: نوع العقار / الموقع / السعر / المميزات'); }
    if (!hasFeatures) { weaknesses.push('لم يتم ذكر أي مميزات خاصة'); suggestions.push('أضف مميزات: مصعد، موقف سيارات، تشطيب فاخر...'); }
    if (!hasEmoji) { weaknesses.push('لا توجد إيموجي — النص يبدو جافاً'); suggestions.push('أضف ٢-٣ إيموجي مناسبة: 🏠 📍 💰'); }

    // Ensure we have at least 2 of each
    while (strengths.length < 2) strengths.push('تم ذكر نوع العقار');
    while (weaknesses.length < 2) weaknesses.push('النص يحتاج تحسينات إضافية');
    while (suggestions.length < 2) suggestions.push('أعد قراءة الإعلان وتأكد من وضوح جميع المعلومات');

    const result: AuditResult = {
      score: ruleScore,
      strengths: strengths.slice(0, 4),
      weaknesses: weaknesses.slice(0, 4),
      suggestions: suggestions.slice(0, 4),
    };

    // ── Try Z.AI for richer analysis (optional, non-blocking) ──
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

      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: `أنت مدقق محتوى تسويقي عقاري. الدرجة المبدئية: ${ruleScore}/١٠. أكد الدرجة ±١ واذكر ٢-٣ نقاط قوة وضعف محددة. أعد JSON: {"score":N,"strengths":[],"weaknesses":[],"suggestions":[]}` },
          { role: 'user', content: `حلّل: ${cleanAdText}` },
        ],
        thinking: { type: 'disabled' },
      });

      const text = completion.choices[0]?.message?.content || '';
      const clean = text.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(clean);

      // Use LLM results if valid, but clamp score to ±1 of rule-based
      let llmScore = Number(parsed.score) || ruleScore;
      llmScore = Math.max(ruleScore - 1, Math.min(ruleScore + 1, llmScore));
      llmScore = Math.min(10, Math.max(1, llmScore));

      return NextResponse.json({
        success: true,
        score: llmScore,
        strengths: Array.isArray(parsed.strengths) ? parsed.strengths.slice(0, 4).map((s: unknown) => String(s).replace(/<[^>]*>/g, '').slice(0, 200)) : result.strengths,
        weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses.slice(0, 4).map((w: unknown) => String(w).replace(/<[^>]*>/g, '').slice(0, 200)) : result.weaknesses,
        suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.slice(0, 4).map((s: unknown) => String(s).replace(/<[^>]*>/g, '').slice(0, 200)) : result.suggestions,
      });
    } catch {
      // Z.AI unavailable (e.g., on Vercel) — return rule-based analysis
      return NextResponse.json({
        success: true,
        ...result,
      });
    }
  } catch (error) {
    console.error('Audit error:', error);
    return NextResponse.json(
      { error: 'تعذّر تحليل الإعلان. حاول مرة أخرى.' },
      { status: 500 }
    );
  }
}
