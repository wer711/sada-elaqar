import ZAI from 'z-ai-web-dev-sdk';
import { z } from 'zod';
import {
  type PropertyInput,
  type Platform,
  type ResolvedProperty,
  type GeneratedContent,
  type PersonalizationInput,
  type VariationAngle,
  type TargetAudience,
  type OptionalDetails,
  type PostMode,
  type PropertyFamily,
  type Purpose,
  VARIATION_ANGLES,
  HOOKS_POOL,
  CTA_POOL,
  pickFromPool,
  pickVariationAngle,
  extractLikedVocab,
  COUNTRY_DIALECT,
  COUNTRY_DIALECT_FALLBACK,
  COUNTRY_MARKET_CONTEXT,
  COUNTRY_MARKET_CONTEXT_FALLBACK,
  PLATFORM_INSTRUCTIONS,
  AUDIENCE_PROFILES,
  PROPERTY_AUDIENCE_MAP,
  PROPERTY_FAMILY_MAP,
  FAMILY_LABELS,
  PURPOSE_OPTIONS,
  PURPOSE_GUIDANCE,
  getPurposeOption,
} from './ai-types';

/* ═══ Zod schema for LLM output validation ═══
 * The LLM is told to return a JSON object with this exact shape.
 * We validate every response with this schema before using it.
 * If validation fails, we fall back to the deterministic generator —
 * never trust raw LLM output blindly.
 */
const LlmOutputSchema = z.object({
  content: z.string().min(20, 'content too short — likely a truncation'),
  hashtags: z.string(),
  headline: z.string().max(200, 'headline too long'),
  resolvedProperty: z.object({
    type: z.string().min(1),
    location: z.string().min(1),
    area: z.string().optional(),
    rooms: z.string().optional(),
    price: z.string().optional(),
    features: z.array(z.string()),
  }),
});

type LlmOutput = z.infer<typeof LlmOutputSchema>;

// Re-export everything that other modules (API routes) need from one place.
export {
  type PropertyInput,
  type Platform,
  type ResolvedProperty,
  type GeneratedContent,
  type PersonalizationInput,
  type VariationAngle,
  type OptionalDetails,
  type PostMode,
  type PropertyFamily,
  type Purpose,
  VARIATION_ANGLES,
  HOOKS_POOL,
  CTA_POOL,
  pickFromPool,
  pickVariationAngle,
  extractLikedVocab,
};
export {
  COUNTRY_DIALECT,
  COUNTRY_MARKET_CONTEXT,
  PLATFORM_INSTRUCTIONS,
  AUDIENCE_PROFILES,
  PROPERTY_AUDIENCE_MAP,
  PROPERTY_FAMILY_MAP,
  FAMILY_LABELS,
  PURPOSE_OPTIONS,
  PURPOSE_GUIDANCE,
  getPurposeOption,
} from './ai-types';

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export interface GenerateOptions {
  personalization?: PersonalizationInput | null;
  variationSeed?: number;
  /** Force a specific angle key (used by "regenerate" to pick a different one) */
  variationAngle?: string;
}

/* ════════════════════════════════════════════════════════════════════════
 * buildOptionalDetailsText — turns the OptionalDetails object into a clean,
 * grouped text block the LLM can consume. Only non-empty fields are emitted,
 * so the prompt never carries dead weight. Returns { lines, checklist }:
 *   - lines: human-readable block to show in the user prompt
 *   - checklist: required-mention items appended to the data checklist
 * ════════════════════════════════════════════════════════════════════════ */
function buildOptionalDetailsText(od: OptionalDetails | undefined): {
  lines: string;
  checklist: string[];
} {
  if (!od) return { lines: '', checklist: [] };

  const sections: string[] = [];
  const checklist: string[] = [];

  // ── Financial ──
  const fin: string[] = [];
  if (od.installmentAvailable === 'yes') {
    fin.push('يقبل التقسيط');
    checklist.push('✓ قابل للتقسيط: نعم');
    if (od.downPayment) { fin.push(`الدفعة المقدمة: ${od.downPayment}`); checklist.push(`✓ الدفعة المقدمة: ${od.downPayment}`); }
    if (od.installmentMonths) { fin.push(`المدة: ${od.installmentMonths} شهراً`); checklist.push(`✓ مدة التقسيط: ${od.installmentMonths} شهر`); }
  } else if (od.installmentAvailable === 'no') {
    fin.push('لا يقبل التقسيط (كاش فقط)');
  }
  if (od.bankFinancing === 'yes') { fin.push('مقبول بنكياً / يقبل التمويل العقاري'); checklist.push('✓ التمويل البنكي: مقبول'); }
  if (od.cashDiscount) { fin.push(`خصم الدفع الكاش: ${od.cashDiscount}`); checklist.push(`✓ خصم الكاش: ${od.cashDiscount}`); }
  if (od.pricePerMeter) { fin.push(`سعر المتر: ${od.pricePerMeter}`); checklist.push(`✓ سعر المتر: ${od.pricePerMeter}`); }
  if (fin.length > 0) sections.push(`💰 التسهيلات المالية:\n${fin.map(f => `  • ${f}`).join('\n')}`);

  // ── Ownership & docs ──
  const own: string[] = [];
  if (od.ownershipType) { own.push(`نوع الملكية: ${od.ownershipType}`); checklist.push(`✓ نوع الملكية: ${od.ownershipType}`); }
  if (od.ownershipStatus) { own.push(`حالة الملكية: ${od.ownershipStatus}`); checklist.push(`✓ حالة الملكية: ${od.ownershipStatus}`); }
  if (od.completeDocs === 'yes') { own.push('بكامل الوثائق'); checklist.push('✓ اكتمال الوثائق: نعم'); }
  if (od.registered === 'yes') { own.push('مسجّل في السجل العقاري'); checklist.push('✓ السجل العقاري: مسجّل'); }
  if (od.brokerType === 'owner') { own.push('مباشر من المالك بدون عمولة'); checklist.push('✓ مباشر من المالك'); }
  else if (od.brokerType === 'broker') { own.push('عبر مكتب عقاري مرخّص'); checklist.push('✓ عبر مكتب مرخّص'); }
  if (own.length > 0) sections.push(`📜 الملكية والوثائق:\n${own.map(f => `  • ${f}`).join('\n')}`);

  // ── Construction ──
  const con: string[] = [];
  if (od.bathrooms) { con.push(`عدد الحمامات: ${od.bathrooms}`); checklist.push(`✓ الحمامات: ${od.bathrooms}`); }
  if (od.floor) { con.push(`الطابق: ${od.floor}`); checklist.push(`✓ الطابق: ${od.floor}`); }
  if (od.totalFloors) { con.push(`إجمالي الطوابق: ${od.totalFloors}`); }
  if (od.yearBuilt) { con.push(`سنة البناء: ${od.yearBuilt}`); checklist.push(`✓ سنة البناء: ${od.yearBuilt}`); }
  if (od.finishType) { con.push(`نوع التشطيب: ${od.finishType}`); checklist.push(`✓ التشطيب: ${od.finishType}`); }
  if (od.majlisCount) { con.push(`عدد المجالس: ${od.majlisCount}`); checklist.push(`✓ المجالس: ${od.majlisCount}`); }
  if (od.ceilingHeight) { con.push(`ارتفاع الأسقف: ${od.ceilingHeight}`); }
  if (od.facadeType) { con.push(`نوع الواجهة: ${od.facadeType}`); }
  if (con.length > 0) sections.push(`🏗️ التفاصيل الإنشائية:\n${con.map(f => `  • ${f}`).join('\n')}`);

  // ── Proximity ──
  const prox: string[] = [];
  if (od.nearSchool) { prox.push(`القرب من المدارس: ${od.nearSchool}`); checklist.push(`✓ القرب من المدارس: ${od.nearSchool}`); }
  if (od.nearHospital) { prox.push(`القرب من المستشفى: ${od.nearHospital}`); checklist.push(`✓ القرب من المستشفى: ${od.nearHospital}`); }
  if (od.nearMosque === 'yes') { prox.push('مواجه/قريب من المسجد'); checklist.push('✓ القرب من المسجد: نعم'); }
  if (od.nearMall) { prox.push(`القرب من المول/المركز التجاري: ${od.nearMall}`); checklist.push(`✓ القرب من المول: ${od.nearMall}`); }
  if (od.nearHighway) { prox.push(`القرب من الطريق السريع: ${od.nearHighway}`); }
  if (od.nearMetro) { prox.push(`القرب من المترو/النقل العام: ${od.nearMetro}`); }
  if (od.streetType === 'main') { prox.push('على شارع رئيسي'); }
  else if (od.streetType === 'quiet') { prox.push('داخل حي هادئ'); }
  if (prox.length > 0) sections.push(`📍 القرب من المرافق:\n${prox.map(f => `  • ${f}`).join('\n')}`);

  // ── Sub-areas ──
  const sub: string[] = [];
  if (od.gardenArea) { sub.push(`مساحة الحديقة/الفناء: ${od.gardenArea} م²`); checklist.push(`✓ مساحة الحديقة: ${od.gardenArea} م²`); }
  if (od.roofArea) { sub.push(`مساحة السطح: ${od.roofArea} م²`); }
  if (od.parkingCount) { sub.push(`مواقف السيارات: ${od.parkingCount}`); checklist.push(`✓ المواقف: ${od.parkingCount}`); }
  if (od.maidRoom === 'yes') { sub.push('غرفة خادمة / ملحق'); checklist.push('✓ غرفة خادمة: نعم'); }
  if (od.independentEntrance === 'yes') { sub.push('مدخل مستقل'); checklist.push('✓ مدخل مستقل: نعم'); }
  if (sub.length > 0) sections.push(`📐 المساحات الفرعية:\n${sub.map(f => `  • ${f}`).join('\n')}`);

  // ── Usage ──
  const use: string[] = [];
  if (od.occupancyStatus) { use.push(`حالة السكن: ${od.occupancyStatus}`); checklist.push(`✓ حالة السكن: ${od.occupancyStatus}`); }
  if (od.suitableFor && od.suitableFor.length > 0) { use.push(`مناسب لـ: ${od.suitableFor.join('، ')}`); checklist.push(`✓ مناسب لـ: ${od.suitableFor.join('، ')}`); }
  if (od.reasonForSale) { use.push(`سبب البيع: ${od.reasonForSale}`); }
  if (use.length > 0) sections.push(`🏠 حالة الاستخدام:\n${use.map(f => `  • ${f}`).join('\n')}`);

  // ── Investment ──
  const inv: string[] = [];
  if (od.expectedROI) { inv.push(`العائد المتوقع على الاستثمار: ${od.expectedROI}`); checklist.push(`✓ العائد المتوقع: ${od.expectedROI}`); }
  if (od.expectedRent) { inv.push(`القيمة الإيجارية المتوقعة: ${od.expectedRent}`); checklist.push(`✓ الإيجار المتوقع: ${od.expectedRent}`); }
  if (od.surroundingProjects) { inv.push(`مشاريع تنموية محيطة: ${od.surroundingProjects}`); checklist.push(`✓ مشاريع محيطة: ${od.surroundingProjects}`); }
  if (inv.length > 0) sections.push(`📈 الاستثمار:\n${inv.map(f => `  • ${f}`).join('\n')}`);

  // ── Contact ──
  const ct: string[] = [];
  if (od.contactPhone) { ct.push(`رقم التواصل: ${od.contactPhone}`); checklist.push(`✓ التواصل: ${od.contactPhone}`); }
  if (od.viewingAvailable === 'yes') { ct.push('متاح للمعاينة الميدانية'); checklist.push('✓ المعاينة: متاحة'); }
  if (od.virtualTourLink) { ct.push(`جولة افتراضية: ${od.virtualTourLink}`); }
  if (ct.length > 0) sections.push(`📞 التواصل والمعاينة:\n${ct.map(f => `  • ${f}`).join('\n')}`);

  // ── Land-specific (family === 'land') ──
  const land: string[] = [];
  if (od.landType) { land.push(`نوع الأرض: ${od.landType}`); checklist.push(`✓ نوع الأرض: ${od.landType}`); }
  if (od.landContents) { land.push(`محتوى الأرض: ${od.landContents}`); checklist.push(`✓ محتوى الأرض: ${od.landContents}`); }
  if (od.planningStatus) { land.push(`حالة التخطيط: ${od.planningStatus}`); checklist.push(`✓ التخطيط: ${od.planningStatus}`); }
  if (od.streetWidth) { land.push(`عرض الشارع: ${od.streetWidth} م`); checklist.push(`✓ عرض الشارع: ${od.streetWidth} م`); }
  if (od.hasUtilities === 'yes') { land.push('المرافق موصلة (ماء/كهرباء)'); checklist.push('✓ المرافق: موصلة'); }
  if (od.isCorner === 'yes') { land.push('أرض زاوية'); checklist.push('✓ زاوية: نعم'); }
  if (od.frontageWidth) { land.push(`طول الواجهة: ${od.frontageWidth} م`); checklist.push(`✓ طول الواجهة: ${od.frontageWidth} م`); }
  if (land.length > 0) sections.push(`🌳 تفاصيل الأرض:\n${land.map(f => `  • ${f}`).join('\n')}`);

  // ── Building-specific (family === 'building') ──
  const bldg: string[] = [];
  if (od.buildingFloors) { bldg.push(`عدد الأدوار: ${od.buildingFloors}`); checklist.push(`✓ الأدوار: ${od.buildingFloors}`); }
  if (od.apartmentsPerFloor) { bldg.push(`الشقق في كل دور: ${od.apartmentsPerFloor}`); checklist.push(`✓ شقق/دور: ${od.apartmentsPerFloor}`); }
  if (od.totalUnits) { bldg.push(`إجمالي الوحدات: ${od.totalUnits}`); checklist.push(`✓ إجمالي الوحدات: ${od.totalUnits}`); }
  if (od.hasElevator === 'yes') { bldg.push('يوجد مصعد'); checklist.push('✓ مصعد: نعم'); }
  if (od.hasBasement === 'yes') { bldg.push('يوجد قبو/سرداب'); checklist.push('✓ قبو: نعم'); }
  if (bldg.length > 0) sections.push(`🏢 تفاصيل العمارة:\n${bldg.map(f => `  • ${f}`).join('\n')}`);

  // ── Commercial-specific (family === 'commercial') ──
  const comm: string[] = [];
  if (od.locationType) { comm.push(`نوع الموقع: ${od.locationType}`); checklist.push(`✓ نوع الموقع: ${od.locationType}`); }
  if (od.commercialSuitability) { comm.push(`صلاحية الاستخدام: ${od.commercialSuitability}`); checklist.push(`✓ صلاحية: ${od.commercialSuitability}`); }
  if (comm.length > 0) sections.push(`🏬 تفاصيل تجارية:\n${comm.map(f => `  • ${f}`).join('\n')}`);

  // ── Rent-specific (purpose === 'rent') — tenant priorities ──
  const rent: string[] = [];
  if (od.rentPeriod === 'monthly') { rent.push('دورية الإيجار: شهري'); checklist.push('✓ إيجار شهري'); }
  else if (od.rentPeriod === 'annual') { rent.push('دورية الإيجار: سنوي'); checklist.push('✓ إيجار سنوي'); }
  else if (od.rentPeriod === 'weekly') { rent.push('دورية الإيجار: أسبوعي'); checklist.push('✓ إيجار أسبوعي'); }
  else if (od.rentPeriod === 'daily') { rent.push('دورية الإيجار: يومي (إقامة قصيرة)'); checklist.push('✓ إيجار يومي'); }
  if (od.rentFurnished === 'yes') { rent.push('التأثيث: مفروش بالكامل — جاهز للسكن فوراً'); checklist.push('✓ مفروش بالكامل'); }
  else if (od.rentFurnished === 'partial') { rent.push('التأثيث: نصف مفروش'); checklist.push('✓ نصف مفروش'); }
  else if (od.rentFurnished === 'no') { rent.push('التأثيث: فارغ (بدون أثاث)'); checklist.push('✓ فارغ'); }
  if (od.rentContractDuration) { rent.push(`مدة العقد: ${od.rentContractDuration} شهراً (قابل للتجديد)`); checklist.push(`✓ مدة العقد: ${od.rentContractDuration} شهر`); }
  if (od.rentDeposit) { rent.push(`مبلغ التأمين: ${od.rentDeposit}`); checklist.push(`✓ التأمين: ${od.rentDeposit}`); }
  if (od.rentIncludesUtilities === 'yes') { rent.push('المرافق: مشمولة في الإيجار (ماء/كهرباء/إنترنت)'); checklist.push('✓ المرافق مشمولة'); }
  else if (od.rentIncludesUtilities === 'no') { rent.push('المرافق: غير مشمولة (تُدفع بشكل منفصل)'); }
  if (od.rentImmediateMoveIn === 'yes') { rent.push('الجاهزية: متاح للسكن فوراً'); checklist.push('✓ جاهز للسكن فوراً'); }
  if (od.rentPaymentFrequency === 'monthly') { rent.push('طريقة الدفع: شهري'); }
  else if (od.rentPaymentFrequency === 'quarterly') { rent.push('طريقة الدفع: ربعي (كل 3 أشهر)'); }
  else if (od.rentPaymentFrequency === 'biannual') { rent.push('طريقة الدفع: نصف سنوي (كل 6 أشهر)'); }
  else if (od.rentPaymentFrequency === 'annual') { rent.push('طريقة الدفع: سنوي مسبق'); }
  if (rent.length > 0) sections.push(`🔑 تفاصيل الإيجار (للمستأجر):\n${rent.map(f => `  • ${f}`).join('\n')}`);

  // ── Evaluate-specific (purpose === 'evaluate') — advisory mode ──
  const evalBlock: string[] = [];
  if (od.evaluateGoal === 'estimate_value') { evalBlock.push('الهدف من التقييم: تقدير القيمة السوقية الحالية للعقار'); checklist.push('✓ هدف التقييم: تقدير القيمة'); }
  else if (od.evaluateGoal === 'sell_or_rent_decision') { evalBlock.push('الهدف من التقييم: توصية بالأفضل (بيع أم تأجير)'); checklist.push('✓ هدف التقييم: بيع أم إيجار'); }
  else if (od.evaluateGoal === 'investment_feasibility') { evalBlock.push('الهدف من التقييم: دراسة جدوى استثمارية'); checklist.push('✓ هدف التقييم: جدوى استثمارية'); }
  if (evalBlock.length > 0) sections.push(`📊 هدف التقييم:\n${evalBlock.map(f => `  • ${f}`).join('\n')}`);

  return { lines: sections.join('\n\n'), checklist };
}

/* ════════════════════════════════════════════════════════════════════════
 * buildPostModeRules — produces the length/style/section rules that the
 * system prompt consumes. Three modes:
 *   short  : tight, essentials-only, 4-6 lines, minimal sections
 *   full   : maximum depth, every section, market context, emotional, investment
 *   custom : only the sections the user picked (customSections[])
 * ════════════════════════════════════════════════════════════════════════ */
function buildPostModeRules(
  mode: PostMode | undefined,
  customSections: string[] | undefined,
): { rulesText: string; lengthText: string; sectionDirective: string } {
  // Default to 'full' when unspecified (preserves prior behavior)
  const effectiveMode = mode || 'full';

  if (effectiveMode === 'short') {
    return {
      rulesText: `═══ نمط البوست: مختصر ومباشر ═══
- اكتب بوستاً مركّزاً قصيراً (4-6 أسطر كحد أقصى للمنصات الطويلة، تغريدة واحدة للتويتر، 3 أسطر لسناب)
- ذكر فقط البيانات الأساسية: نوع العقار + الموقع + السعر + أبرز ميزة + دعوة قصيرة للتواصل
- لا تذكر سياق السوق ولا التحليل الاستثماري ولا اللمسة العاطفية المفصّلة
- إذا وُجدت تفاصيل اختيارية، اذكر فقط أبرزها في سطر واحد (مثل: "بكامل الوثائق" أو "يقبل التقسيط")
- اجعل دعوة العمل جملة واحدة قوية في النهاية`,
      lengthText: `الطول المطلوب: قصير ومركّز
    - واتساب: 5-7 أسطر
    - إنستغرام: 4-6 أسطر
    - فيسبوك: 5-7 أسطر
    - لينكدين: 5-7 أسطر
    - تويتر: تغريدة واحدة فقط — إجمالي النص + الهاشتاغات ≤ ٢٧٠ حرفاً (حد تويتر ٢٨٠)
    - سناب شات: 3-4 أسطر`,
      sectionDirective: 'الأقسام المطلوبة فقط: الافتتاحية + البيانات الأساسية + دعوة العمل. تجنّب أي فقرة إضافية.',
    };
  }

  if (effectiveMode === 'custom') {
    const wanted = customSections && customSections.length > 0 ? customSections : ['feature_breakdown', 'urgency_cta'];
    const sectionMap: Record<string, string> = {
      market_context: 'سياق السوق المحلي: اربط العقار بنقطة قوّة السوق (نمو المنطقة، خطط التنمية) في فقرة قصيرة',
      emotional_appeal: 'لمسة عاطفية: جملة واحدة تخاطب الجمهور المستهدف وتُشعره أن العقار صُمّم له',
      investment_analysis: 'تحليل استثماري: اذكر العائد المتوقع والقيمة الإيجارية وفرصة النمو في فقرة موجزة',
      urgency_cta: 'إحساس بالإلحاح ودعوة قوية للتواصل في الخاتمة',
      feature_breakdown: 'سرد كامل للمميزات: كل ميزة في سطر مستقل يُبرز فائدتها للمشتري',
      proximity: 'القرب من المرافق: اذكر المدارس/المستشفى/المسجد/المول/الطرق القريبة (إن وُجدت في التفاصيل الاختيارية)',
      financing: 'خيارات التمويل والتقسيط: اذكر التسهيلات المالية المتاحة (إن وُجدت في التفاصيل الاختيارية)',
      trust_signals: 'إشارات الثقة: اذكر نوع الملكية واكتمال الوثائق (إن وُجدت في التفاصيل الاختيارية)',
      lifestyle_scene: 'مشهد أسلوب الحياة: جملة تصف يوماً في العقار تضع القارئ داخله',
      hashtags_block: 'هاشتاقات استراتيجية للوصول الأوسع حسب المنصة',
    };
    const picked = wanted
      .map(id => `  ✓ ${sectionMap[id] || id}`)
      .join('\n');
    const omitted = Object.keys(sectionMap)
      .filter(k => !wanted.includes(k))
      .map(k => `  ✗ تجنّب: ${sectionMap[k].split(':')[0]}`)
      .join('\n');
    return {
      rulesText: `═══ نمط البوست: مخصّص (الأقسام التي اختارها المستخدم) ═══
- اكتب البوست بحيث يشمل ONLY الأقسام التالية ولا غيرها:
${picked}
${omitted ? `\n- الأقسام التالية يجب ألا تظهر في البوست:\n${omitted}` : ''}
- حافظ على ذكر البيانات الأساسية للعقار (نوع، موقع، مساحة، غرف، سعر، مميزات) بصرف النظر عن الأقسام المختارة`,
      lengthText: `الطول: متوسط — يُحدّده عدد الأقسام المختارة. لا تطل لأكثر من 12 سطراً، ولا تختصر تحت 6 أسطر.`,
      sectionDirective: `الأقسام المطلوبة حصراً: ${wanted.join('، ')}`,
    };
  }

  // full
  return {
    rulesText: `═══ نمط البوست: كامل ومعمّق ═══
- اكتب بوستاً شاملاً معمّقاً يغطي كل التفاصيل المتاحة بأسلوب إقناعي راقٍ
- اجعل البوست طويلاً ومُفصّلاً (لا تقبل بالحد الأدنى — اكتب كل ما يُقنع المشتري الجاد)
- اذكر كل البيانات الأساسية + كل التفاصيل الاختيارية المتاحة في مواضعها الطبيعية
- اربط العقار بسياق السوق المحلي في فقرة واضحة
- أضف لمسة عاطفية تخاطب الجمهور المستهدف
- إذا وُجدت تفاصيل استثمارية، اذكرها كفرصة وليس كأرقام جافة
- اختم بدعوة قوية وحازمة للتواصل`,
    lengthText: `الطول المطلوب: طويل وشامل
    - واتساب: لا يقل عن 15 سطراً
    - إنستغرام: لا يقل عن 12 سطراً
    - فيسبوك: لا يقل عن 14 سطراً
    - لينكدين: لا يقل عن 12 سطراً
    - تويتر: تغريدة واحدة مركّزة — إجمالي النص + الهاشتاغات ≤ ٢٧٠ حرفاً (حد تويتر ٢٨٠ حرفاً للتغريدة الواحدة، والمشاركة تفتح تغريدة واحدة فقط)
    - سناب شات: لا يقل عن 5 أسطر`,
    sectionDirective: 'الأقسام المطلوبة: افتتاحية + بيانات كاملة + مميزات + سياق السوق + لمسة عاطفية + تفاصيل اختيارية + دعوة عمل.',
  };
}

export async function generateMarketingContent(
  input: PropertyInput,
  options: GenerateOptions = {},
): Promise<GeneratedContent> {
  const zai = await getZAI();

  // ── Resolve variation ──
  const seed = options.variationSeed ?? Math.floor(Math.random() * 1_000_000);
  let angle: VariationAngle;
  if (options.variationAngle) {
    angle = VARIATION_ANGLES.find(a => a.key === options.variationAngle)
      || pickVariationAngle(options.personalization || null, seed);
  } else {
    angle = pickVariationAngle(options.personalization || null, seed);
  }

  const hook = pickFromPool(HOOKS_POOL, seed, 1);
  const cta = pickFromPool(CTA_POOL, seed, 2);

  // ── Build complete data summary ──
  const cityName = input.customCity || input.city;
  const family: PropertyFamily = input.family || PROPERTY_FAMILY_MAP[input.propertyType] || 'residential';
  const familyLabel = FAMILY_LABELS[family];
  const isLand = family === 'land';
  const isBuilding = family === 'building';
  const isCommercial = family === 'commercial';
  const featuresList = input.features.length > 0
    ? input.features.map((f, i) => `${i + 1}. ${f}`).join('\n')
    : 'لم يتم تحديد مميزات';
  const areaText = input.customArea ? `المنطقة/الحي: ${input.customArea}` : '';
  const formattedPrice = input.price ? Number(input.price).toLocaleString('ar-SA') : '';
  // ── Purpose-aware labels (study-based) ──
  // The "purpose" drives the entire marketing angle:
  //   sale     → "للبيع" + price = total asking price
  //   rent     → "للإيجار" + price = monthly/annual rent (per rentPeriod)
  //   evaluate → "تقييم" + price = merchant's asking price (compared to estimated market value)
  const purpose: Purpose = input.purpose || 'sale';
  const purposeOption = getPurposeOption(purpose);
  const purposeLabel = purposeOption?.label || 'للبيع';
  const purposeGuidance = PURPOSE_GUIDANCE[purpose];
  const rentPeriodLabel = input.optionalDetails?.rentPeriod === 'annual' ? 'سنوياً'
    : input.optionalDetails?.rentPeriod === 'weekly' ? 'أسبوعياً'
    : input.optionalDetails?.rentPeriod === 'daily' ? 'يومياً'
    : 'شهرياً'; // default monthly
  let purposeText: string;
  let priceText: string;
  if (purpose === 'rent') {
    purposeText = 'للإيجار';
    priceText = input.price
      ? `الإيجار: ${formattedPrice} ${input.currency} (${rentPeriodLabel})`
      : `الإيجار: غير محدد`;
  } else if (purpose === 'evaluate') {
    purposeText = 'تقييم واستشارة';
    priceText = input.price
      ? `سعر التاجر المُقترح: ${formattedPrice} ${input.currency} (للمقارنة بالقيمة التقديرية)`
      : `سعر التاجر: غير محدد (سيتولّى المساعد تقدير القيمة)`;
  } else {
    purposeText = 'للبيع';
    priceText = input.price
      ? `السعر: ${formattedPrice} ${input.currency} (للبيع)`
      : `السعر: غير محدد (للبيع)`;
  }
  const dialectInstruction = COUNTRY_DIALECT[input.country] || COUNTRY_DIALECT_FALLBACK;
  const marketContext = COUNTRY_MARKET_CONTEXT[input.country] || COUNTRY_MARKET_CONTEXT_FALLBACK;
  const platformInstruction = PLATFORM_INSTRUCTIONS[input.platform];

  // ── Family-specific data guidance for the LLM ──
  // This tells the model which fields are meaningful for THIS property family,
  // so it never mentions "غرف" for land or "مسبح" for an office.
  const familyGuidance: Record<PropertyFamily, string> = {
    residential: `هذه وحدة سكنية (شقة/استوديو/بنتهاوس/دوبلكس). اذكر عدد الغرف والحمامات والطابق والتشطيب إن وُجدت. لا تذكر «مجالس» أو «مطبخ» كعدد (المطبخ افتراضي). لا تذكر «حديقة خاصة» ما لم تكن في المميزات.`,
    villa: `هذه فيلا أو منزل مستقل. اذكر عدد الغرف والحمامات والمطابخ والمجالس والأدوار ومساحة البناء إن وُجدت. يمكنك ذكر مسبح وحديقة وغرفة خادمة إن كانت في المميزات.`,
    land: `هذه أرض. ⚠️ ممنوع ذكر «غرف» أو «حمامات» أو «مطابخ» أو «مجالس» إطلاقاً — الأرض لا تحتوي عليها. ركّز على: نوع الأرض (بيضاء/سكنية/تجارية/زراعية)، محتوى الأرض (خالية/بها مباني)، حالة التخطيط، عرض الشارع، المرافق، الزاوية، طول الواجهة، المساحة الإجمالية. صِغ المحتوى كلغة استثمار أو فرصة بناء/تطوير.`,
    building: `هذه عمارة سكنية. اذكر عدد الأدوار، الشقق في كل دور، إجمالي الوحدات، المصعد، القبو، المواقف. لا تذكر «مسبح» أو «تراس». ركّز على العائد الاستثماري والإجمالي للوحدات.`,
    commercial: `هذا عقار تجاري (محل/مكتب). اذكر المساحة، عرض الواجهة، نوع الموقع (شارع رئيسي/مول/مجمع)، صلاحية الاستخدام (مكتب/عيادة/مطعم/معرض). لا تذكر «مسبح» أو «حديقة» أو «مجالس». ركّز على الرؤية والعملاء والقيمة التجارية.`,
  };

  // ── Optional details + post-mode rules (NEW) ──
  const { lines: optionalDetailsText, checklist: optionalChecklist } =
    buildOptionalDetailsText(input.optionalDetails);
  const { rulesText: postModeRules, lengthText: postModeLength, sectionDirective: postModeSections } =
    buildPostModeRules(input.postMode, input.customSections);

  // ── Audience targeting (auto-inferred from property type) ──
  const primaryAudienceKey: TargetAudience = PROPERTY_AUDIENCE_MAP[input.propertyType] || 'family';
  const primaryAudience = AUDIENCE_PROFILES[primaryAudienceKey];
  // Pick a secondary audience that complements the primary
  const secondaryAudienceKey: TargetAudience = primaryAudienceKey === 'family'
    ? 'investor'
    : primaryAudienceKey === 'investor'
    ? 'family'
    : primaryAudienceKey === 'luxury_seeker'
    ? 'investor'
    : primaryAudienceKey === 'business_owner'
    ? 'investor'
    : 'family';
  const secondaryAudience = AUDIENCE_PROFILES[secondaryAudienceKey];

  // Checklist of ALL data that MUST appear in the content
  // NOTE: for land/building, "rooms" is meaningless — we drop it from the
  // checklist so the LLM doesn't fabricate room counts.
  const dataChecklist: string[] = [
    `✓ نوع العقار: ${input.propertyType}`,
    `✓ عائلة العقار: ${familyLabel} (${family})`,
    `✓ الغرض: ${purposeText}`,
    `✓ المدينة: ${cityName}`,
    input.customArea ? `✓ الحي/المنطقة: ${input.customArea}` : '',
    `✓ الدولة: ${input.country}`,
    input.area ? `✓ المساحة: ${input.area} م²` : '',
    (!isLand && input.rooms) ? `✓ عدد الغرف: ${input.rooms}` : '',
    input.price ? `✓ السعر: ${formattedPrice} ${input.currency}` : '',
    input.features.length > 0 ? `✓ المميزات: ${input.features.join('، ')}` : '',
    input.notes ? `✓ ملاحظات إضافية من البائع: ${input.notes}` : '',
    // ── Optional details (only enforced in 'full' mode; in 'short' they're
    //    optional, in 'custom' they appear only if their section is picked) ──
    ...optionalChecklist,
  ].filter(Boolean);

  // ── Personalization hint (background training) ──
  const personalization = options.personalization;
  const personalizationHint = personalization && personalization.generationCount > 0
    ? `
═══ معلومات عن هذا العميل (للتخصيص الذكي، وليس للقالبة) ═══
- عدد المرات التي استخدم فيها المساعد: ${personalization.generationCount}
- تقييمات إيجابية سابقة له: ${personalization.upvoteCount}
- درجة الثقة المتراكمة: ${personalization.trustScore}/100
${personalization.preferredAngles.length > 0 ? `- أساليب يُفضّلها هذا العميل (يميل إليها): ${personalization.preferredAngles.map(a => VARIATION_ANGLES.find(v => v.key === a)?.name || a).join('، ')}` : ''}
${personalization.avoidedAngles.length > 0 ? `- أساليب لم تُعجبه سابقاً (تجنّبها تماماً): ${personalization.avoidedAngles.map(a => VARIATION_ANGLES.find(v => v.key === a)?.name || a).join('، ')}` : ''}
${personalization.likedVocab.length > 0 ? `- مفردات أحبها في محتوى سابق (استخدم بعضها بذكاء إن ناسب السياق): ${personalization.likedVocab.slice(0, 8).join('، ')}` : ''}
${personalization.preferredTypes.length > 0 ? `- أنواع عقارات يُسوّق لها كثيراً: ${personalization.preferredTypes.join('، ')}` : ''}
⚠️ استخدم هذه المعلومات للتخصيص الذكي والتنوع، لكن لا تكتب بنفس الأسلوب حرفياً — كل محتوى يجب أن يكون فريداً وغير متكرر.`
    : '';

  const emojiRule = angle.emojiDensity === 'minimal'
    ? 'استخدم إيموجي واحدة على الأكثر في كل النص'
    : angle.emojiDensity === 'moderate'
    ? 'استخدم 2-4 إيموجي مناسبة موزّعة على النص'
    : 'استخدم 5-7 إيموجي مناسبة بحيث يبدأ كل سطر تقريباً بإيموجي';

  const systemPrompt = `أنت "صدى العقار" — مساعد تسويق عقاري محترف في أسواق الخليج العربي والشرق الأوسط. تكتب محتوى تسويقياً عقارياً يحقق تفاعلاً عالياً ويُقنع المشترين الجادين. لكل عميل أسلوبك الخاص الذي يتطور مع كل تجربة.

═══ شخصية الكتابة لهذا المنشور: ${angle.name} ═══
- الافتتاح: ${angle.openingStyle}
- النبرة: ${angle.toneRules}
- الخاتمة: ${angle.ctaStyle}
- الإيموجي: ${emojiRule}

═══ قواعد صارمة لا تُخالف ═══

1. نوع العقار ثابت لا يُغيَّر أبداً (القاعدة الأهم على الإطلاق):
   - نوع العقار الذي يجب أن تكتب عنه هو حصراً: "${input.propertyType}"
   - ممنوع منعاً باتاً كتابة أي نوع عقار آخر مثل: فيلا، شقة، بنتهاوس، دوبلكس، أرض، مكتب، محل، عمارة، استوديو، شاليه — باستثناء "${input.propertyType}" فقط
   - إذا كان النوع "${input.propertyType}" هو "فيلا" فاكتب "فيلا" ولا تكتب "شقة" أو "بنتهاوس"
   - إذا كان النوع "شقة" فاكتب "شقة" ولا تكتب "فيلا" أو غيرها
   - resolvedProperty.type في JSON النهائي يجب أن يكون حرفياً: "${input.propertyType}" — لا تغيّره إطلاقاً
   - هذه قاعدة وجودية: خرقها يُفسد المنشور بالكامل

2. إدراج البيانات (قاعدة صارمة لا تُخالف): يجب أن يُذكر كل حقل من البيانات الأساسية للعقار صراحةً في المحتوى — لا تختصر ولا تهمل أي حقل مهما كان:
${dataChecklist.join('\n')}
⚠️ البيانات الأساسية (نوع العقار، المدينة، الحي، الدولة، المساحة، الغرف، السعر، المميزات) إلزامية في كل الأنماط — حتى لو كانت المنصة قصيرة (تويتر/سناب)، استخدم thread أو عدة أسطر إن لزم.
⚠️ التفاصيل الاختيارية الإضافية (المالية، الوثائق، الإنشائية، القرب، إلخ) يختلف ذكرها حسب نمط البوست:
   • في وضع «كامل»: اذكر كل تفصيل اختياري متاح في موضعه الطبيعي ضمن النص.
   • في وضع «مختصر»: لخّص التفاصيل الاختيارية في سطر واحد مدمج (مثل «بكامل الوثائق، يقبل التقسيط، مباشر من المالك») — لا تخصّص لكل تفصيل سطراً.
   • في وضع «مخصّص»: اذكر التفاصيل الاختيارية فقط ضمن الأقسام التي اختارها المستخدم (انظر القاعدة 12).
⚠️ كل ميزة في features يجب أن تظهر في سطر مستقل يُبرز فائدتها — لا تدمج ميزتين في سطر واحد ولا تختصرها (ما لم يكن نمط البوست «مختصر» فاذكرها مدمجة في سطر واحد).

3. الاتساق بين البيانات المعروضة والمحتوى:
   - resolvedProperty يجب أن تطابق تماماً بيانات النموذج:
     • type = "${input.propertyType}" (حرفياً، لا تغيّر)
     • location = "${[input.customArea, cityName, input.country].filter(Boolean).join('، ')}"
     ${input.area ? `• area = "${input.area} م²"` : '• area = "" (إن لم تُذكر المساحة)'}
     ${input.rooms ? `• rooms = "${input.rooms} غرف"` : '• rooms = "" (إن لم تُذكر الغرف)'}
     ${input.price ? `• price = "${formattedPrice} ${input.currency}"` : '• price = "" (إن لم يُذكر السعر)'}
     • features = نفس المميزات المختارة بالضبط
   - النص التسويقي يجب أن يذكر النوع والموقع والمساحة والغرف والسعر والمميزات بنفس القيم

4. سياق السوق المحلي (لاستخداماته في إقناع المشتري):
   ${marketContext}
   استخدم هذا السياق بذكاء — اربط العقار بنقطة قوّة السوق المحلي. مثلاً: اذكر خطط التنمية، نمو المنطقة، الطلب المتزايد. لا تذكره كإحصائية جافة بل كحجة إقناعية تُبرز قيمة العقار.

5. الجمهور المستهدف (لزيادة الإقناع):
   - الجمهور الأساسي لهذا العقار: ${primaryAudience.name}
     • اهتماماته: ${primaryAudience.concerns}
     • محفّزاته النفسية: ${primaryAudience.triggers}
     • النبرة المطلوبة: ${primaryAudience.tone}
   - الجمهور الثانوي: ${secondaryAudience.name}
     • اهتماماته: ${secondaryAudience.concerns}
     • محفّزاته: ${secondaryAudience.triggers}
   - اكتب المحتوى بحيث يُقنع الجمهور الأساسي أولاً ثم يلمس الجمهور الثانوي بجملة أو فكرة واحدة. لا تكتب فقرة كاملة للجمهورين — ادمج الإقناع بسلاسة.

6. اللهجة المحلية:
   ${dialectInstruction}
   ⚠️ تنبيه حاسم: يجب أن تكون اللهجة المحلية واضحة في كل فقرة وجملة — ليس فقط في الخاتمة أو دعوة العمل! ابدأ باللهجة، أكمل باللهجة، واختم باللهجة. لا تكتب بالفصحى ثم تضيف كلمة محلية في النهاية — هذا غير مقبول. يجب أن يكون ٧٠٪ على الأقل من النص باللهجة المحلية المطلوبة.
   (استثناء: منصة لينكدين تستخدم الفصحى المهنية الراقية)

7. الأسلوب الاحترافي والإقناعي:
   - ابدأ بجملة افتتاحية قوية تُمسك الانتباه من أول كلمة — استخدم بداية مبتكرة من هذا النوع: "${hook}"
   - استخدم بنية إقناعية واضحة: خطّاف → مشكلة/فرصة → الحل (العقار) → الفائدة → دعوة للعمل
   - استخدم مفردات تسويق عقاري احترافية: "فرصة استثمارية"، "موقع استراتيجي"، "عائد مجزٍ"، "قيمة راقية"
   - أضف عناصر إقناع: الندرة ("فرصة لا تتكرر")، الاستعجال ("سارع")، الجدارة ("أرقى المواقع")
   - صِغ المميزات كفوائد وليس كمواصفات — مثلاً: بدل "يوجد مسبح" اكتب "استمتع بمسبح خاص يمنحك استرخاءً لا مثيل له"
   - اربط العقار بأسلوب حياة المشتري: "تخيّل صباحك..."، "عشاء عائلي في..."، "استرخِ في..."
   - لا تستخدم كلمات مبالغة مبتذلة مثل "أرخص"، "مجاناً"، "حصري حصري حصري" — اترك انطباع الفخامة حتى في المحتوى العائلي

8. الدقة الإملائية:
   - راجع الإملاء بدقة متناهية — لا تقع في أخطاء مثل: "مصيع" بدل "مصعد"، أو "شقق" بدل "شقة"
   - تأكد من صحة كل كلمة قبل كتابتها — إذا شككت في كلمة، استخدم مرادفاً أكثر شيوعاً
   - لا تخلط بين التاء المربوطة والهاء
   - "اتصال" بلا همزة تحتية — وليس "إتصال"
   - "إعلام" بهمزة فوقية — وليس "أعلام"

9. الأرقام: اذكر الأرقام بالضبط كما وردت دون إضافة أصفار — استخدم أرقاماً عربية (١، ٢، ٣) مع فواصل آلاف

9.5. وعي عائلة العقار (قاعدة جديدة وحاسمة): هذا العقار ينتمي لعائلة «${familyLabel}». ${familyGuidance[family]}
   ⚠️ احترم طبيعة العقار: لا تذكر حقولاً لا معنى لها (مثل «غرف» لأرض، أو «مسبح» لمكتب). البيانات الديناميكية في التفاصيل الاختيارية مصمّمة لهذه العائلة تحديداً — استخدمها بذكاء.

10. الطول حسب نمط البوست (قاعدة صارمة): احرِم على الطول المطلوب لكل نمط بدقة — النمط «المختصر» يجب أن يكون قصيراً ومركّزاً، والنمط «الكامل» يجب أن يكون طويلاً وشاملاً.
${postModeLength}

11. نمط البوست وتوزيع الأقسام (قاعدة صارمة): التزم بدقة بنمط البوست الذي طلبه المستخدم ولا تخرج عنه:
${postModeRules}
    توجيه الأقسام: ${postModeSections}

12. مراجعة ذاتية إلزامية قبل إرسال JSON: قبل أن تكتب الـ JSON النهائي، راجع النص وتأكد أن كل عنصر من القائمة التالية ظهر فيه فعلاً:
    ☐ نوع العقار مذكور صراحةً
    ☐ المدينة مذكورة صراحةً
    ☐ الحي/المنطقة مذكور (إن وُجد في المدخلات)
    ☐ الدولة مذكورة صراحةً
    ☐ المساحة مذكورة صراحةً (إن وُجدت)
    ☐ عدد الغرف مذكور صراحةً (إن وُجد، وللأرض لا تُذكر)
    ☐ السعر مذكور صراحةً (إن وُجد، بصيغة الغرض: للبيع/شهرياً/للتقييم)
    ☐ كل ميزة في قائمة المميزات مذكورة (في سطر مستقل إن كان النمط كاملاً أو مخصّصاً وفقاً للأقسام)
    ☐ دعوة للعمل (CTA) في الخاتمة (في وضع البيع/الإيجار)
    ☐ الالتزام بنمط البوست المطلوب (مختصر/كامل/مخصّص)
    ☐ الالتزام بالغرض المحدد (${purposeLabel}) — تحقّق من أن المحتوى يخاطب الجمهور الصحيح
    إذا نقص أي عنصر، أعد كتابة المحتوى وأضفه قبل الإرسال.

13. وعي الغرض من الطرح (قاعدة جديدة وحاسمة — الأهم بعد قاعدة نوع العقار): الغرض المختار هو "${purposeLabel}". هذا يحدّد جمهورك وزاوية إقناعك بالكامل:
${purposeGuidance}

   ⚠️ قائمة أولويات الغرض (يجب أن يلمس المحتوى كل بند فيها إن كان متاحاً):
${purposeOption?.priorities.map(p => `   • ${p}`).join('\n')}

   ⚠️ ملاحظة حرجة: لا تخلط بين أولويات الأغراض —
   • في وضع «الإيجار» لا تذكر «النمو الرأسمالي» أو «فرصة إعادة البيع» أو «القيمة الاستثمارية» — المستأجر لا يهتم بها.
   • في وضع «البيع» لا تذكر «الإيجار الشهري» أو «التأمين» أو «طريقة الدفع» — المشتري يفكّر بملكية دائمة.
   • في وضع «التقييم» لا تبيع ولا تسوّق — كن مستشاراً محايداً يقدّم تحليلاً وتوصية.${personalizationHint}`;

  const userPrompt = `بيانات العقار المطلوب تسويقه:
═══════════════════
نوع العقار: ${input.propertyType}  ← اكتب عن هذا النوع حصراً، لا تغيّره
عائلة العقار: ${familyLabel} (${family}) ← تحكّم في الحقول المناسبة لهذه العائلة
الغرض: ${purposeText}
المدينة: ${cityName}
${areaText}
الدولة: ${input.country}
المساحة: ${input.area ? input.area + ' م²' : 'غير محددة'}
${isLand ? 'ملاحظة: هذا عقار أرضي — لا تذكر غرف/حمامات/مطابخ.' : ''}${!isLand && input.rooms ? `عدد الغرف: ${input.rooms}` : ''}
${priceText}
المميزات المختارة:
${featuresList}
${input.notes ? `\nملاحظات إضافية من البائع (استخدمها بذكاء في السياق المناسب):\n${input.notes}\n` : ''}
═══════════════════
${optionalDetailsText ? `
التفاصيل الاختيارية الإضافية (استخدمها وفق نمط البوست المطلوب):
═══════════════════
${optionalDetailsText}
═══════════════════
` : ''}
سياق السوق في ${input.country}:
${marketContext}

الجمهور الأساسي: ${primaryAudience.name} — اهتماماته: ${primaryAudience.concerns}
الجمهور الثانوي: ${secondaryAudience.name} — ادمج لمسة عنه بسلاسة

نمط البوست المطلوب: ${input.postMode === 'short' ? 'مختصر' : input.postMode === 'custom' ? 'مخصّص' : 'كامل ومعمّق'}${input.postMode === 'custom' && input.customSections && input.customSections.length > 0 ? `\nالأقسام المختارة: ${input.customSections.join('، ')}` : ''}

تعليمات المنصة:
${platformInstruction}

تعليمات اللهجة: ${dialectInstruction}

⚠️ تذكير حاسم: نوع العقار هو "${input.propertyType}" حصراً — لا تكتب أي نوع آخر.
⚠️ تذكير إدراج البيانات: يجب أن يظهر كل حقل من بيانات العقار الأساسية أعلاه في المحتوى — لا تختصر أي معلومة.
⚠️ تذكير الاتساق: resolvedProperty.type يجب أن يكون حرفياً "${input.propertyType}" — لا تغيّره أبداً.
⚠️ تذكير نمط البوست: التزم تماماً بنمط «${input.postMode === 'short' ? 'مختصر' : input.postMode === 'custom' ? 'مخصّص' : 'كامل ومعمّق'}» كما هو موضح في القواعد 10 و 11.

اكتب رداً بصيغة JSON فقط بدون أي نص إضافي أو علامات markdown:
{
  "content": "المحتوى الرئيسي المنسق حسب المنصة وشخصية ${angle.name}، مُقنع للجمهور الأساسي (${primaryAudience.name}) مع لمسة للجمهور الثانوي",
  "hashtags": "الهاشتاقات مفصولة بمسافات (أو 'لا يوجد' لواتساب)",
  "headline": "عنوان قصير 6-10 كلمات جذاب يصلح كعنوان رئيسي",
  "resolvedProperty": {
    "type": "${input.propertyType}",
    "location": "${[input.customArea, cityName, input.country].filter(Boolean).join('، ')}",
    "area": "${input.area ? input.area + ' م²' : ''}",
    "rooms": "${isLand ? '' : (input.rooms ? input.rooms + ' غرف' : '')}",
    "price": "${input.price ? formattedPrice + ' ' + input.currency : ''}",
    "features": [${input.features.map(f => `"${f}"`).join(', ')}]
  }
}`;

  const FALLBACK = buildFallback(input, angle, seed, primaryAudience, secondaryAudience);

  try {
    const completion = await zai.chat.completions.create({
      messages: [
        // CRITICAL: system prompt MUST use role: 'system' so the LLM treats the
        // rules as binding instructions. Using 'assistant' makes the model treat
        // them as a prior message it can ignore — which forced the previous code
        // to add 130+ lines of enforceConsistency post-processing.
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      thinking: { type: 'disabled' },
    });

    const text = completion.choices[0]?.message?.content || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    // ═══ ZOD VALIDATION ═══
    // Validate the LLM output shape before trusting it.
    // If the LLM returned malformed/incomplete JSON (missing fields, wrong types,
    // truncated content), we fall back to the deterministic generator instead
    // of feeding garbage into enforceConsistency.
    const validationResult = LlmOutputSchema.safeParse(parsed);
    if (!validationResult.success) {
      // Log the issue for debugging (no PII — just the Zod error tree)
      console.warn('[ai] LLM output failed zod validation, using fallback:', validationResult.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; '));
      return FALLBACK;
    }
    const validated: LlmOutput = validationResult.data;

    // ═══ POST-GENERATION ENFORCEMENT (the critical fix) ═══
    // The LLM may have hallucinated a different property type or invented
    // numbers. We ENFORCE that the resolved property matches the form input
    // exactly, and we scrub any wrong property-type words from the content.
    return enforceConsistency(validated, input, angle, seed, formattedPrice);
  } catch {
    return FALLBACK;
  }
}

/* ════════════════════════════════════════════════════════════════════════
 * enforceConsistency — the heart of the property-data-adaptation fix.
 *
 * This runs AFTER the LLM responds. It GUARANTEES:
 *  1. resolvedProperty.type === input.propertyType (form is source of truth)
 *  2. resolvedProperty.location/area/rooms/price === form values
 *  3. Any wrong property-type word in `content` is replaced with the correct one
 *  4. If content doesn't mention the property type at all, we prepend a line
 *  5. Common LLM spelling mistakes are auto-corrected (مصيع → مصعد, etc.)
 *  6. Wrong property-type words are scrubbed from hashtags
 *
 * This is what makes the displayed property data bar ALWAYS match the
 * marketing copy below it — because both now come from the same source
 * (the form), and we scrub any drift the LLM introduced.
 * ════════════════════════════════════════════════════════════════════════ */

/* Common spelling mistakes the LLM makes, despite prompt warnings.
 * Each entry: [wrong, correct]. Applied as global string replacements. */
const SPELLING_FIXES: Array<[string, string]> = [
  ['المصيع', 'المصعد'],
  ['مصيع', 'مصعد'],
  ['استقباح', 'استرخاء'],
  ['تتطبّق', 'تُطبّق'],
  ['إتصال', 'اتصال'],
  ['إستثمار', 'استثمار'],
  ['إستراتيجي', 'استراتيجي'],
  ['إستثمارية', 'استثمارية'],
  ['إستراحة', 'استراحة'],
  ['أعلام', 'إعلام'],
  ['أنترنت', 'إنترنت'],
  ['كوش', 'خوش'],
  ['تطل', 'تُطل'],
  ['تتكرر', 'تتكرر'],
  ['فرصه', 'فرصة'],
  ['شقه', 'شقة'],
  ['فيلا ', 'فيلا '],  // no-op, placeholder
  ['يتميز بـ', 'يتميّز بـ'],
  ['مميزات', 'مميزات'],  // no-op
  [' رايقة', ' راقية'],
  ['أسركك', 'أسرتك'],
  ['أسرك', 'أسرتك'],
  ['تتأكد', 'تتأكد'],  // no-op
  ['بستوى', 'بمستوى'],
  ['تحدّيث', 'تحديث'],
  ['ألارض', 'الأرض'],
  ['الارض', 'الأرض'],
  ['الشاطئ', 'الشاطئ'],  // no-op
  ['مسابح', 'مسابح'],  // no-op
  ['تنسّق', 'تنسيق'],
  ['شقّة', 'شقة'],
  ['فيلاّ', 'فيلا'],
  ['مميّزات', 'مميزات'],
  ['ميزه', 'ميزة'],
  ['مساحة ', 'مساحة '],  // no-op
  ['المساحه', 'المساحة'],
  ['الغرف', 'الغرف'],  // no-op
  ['السعر ', 'السعر '],  // no-op
  ['سعر ', 'سعر '],  // no-op
  ['اللأسرة', 'للأسرة'],
  ['الأسرة ', 'الأسرة '],  // no-op
  ['أسرة ', 'أسرة '],  // no-op
];

function fixSpelling(text: string): string {
  let result = text;
  for (const [wrong, correct] of SPELLING_FIXES) {
    if (wrong === correct) continue;
    // Use split/join to avoid regex special character issues
    result = result.split(wrong).join(correct);
  }
  return result;
}

/* ════════════════════════════════════════════════════════════════════════
 * enforceTwitterLimit — guarantees the tweet fits Twitter's 280-char cap.
 *
 * Twitter counts characters using the Unicode "default grapheme cluster" rule:
 *  - Most Arabic characters = 1 char each
 *  - Emoji = 2 chars each
 *  - Hashtags include the # and any following spaces up to the next break
 *
 * The share URL (twitter.com/intent/tweet?text=) opens ONE tweet compose box.
 * If the text exceeds 280 chars, Twitter silently truncates it — losing the
 * CTA and hashtags. This function prevents that by:
 *  1. Computing the combined length (content + '\n\n' + hashtags)
 *  2. If ≤ 280, return as-is
 *  3. If > 280, try trimming hashtags first (keep only the top 2)
 *  4. If still > 280, truncate the content at the last word boundary that fits,
 *     append "…" so the reader knows there's more, then re-add 1 hashtag
 *
 * The result is always ≤ 280 chars and always ends with a CTA-like word
 * (not cut mid-word).
 * ════════════════════════════════════════════════════════════════════════ */
const TWITTER_CHAR_LIMIT = 280;

/** Counts the "weight" of a string the way Twitter does (emoji ≈ 2 chars). */
function countTwitterChars(text: string): number {
  // Emoji and astral-plane characters count as 2; everything else as 1.
  // Using Array.from to correctly handle surrogate pairs.
  let count = 0;
  for (const ch of Array.from(text)) {
    const code = ch.codePointAt(0) || 0;
    // Astral plane (emoji, rare symbols) = code > 0xFFFF → weight 2
    count += code > 0xFFFF ? 2 : 1;
  }
  return count;
}

function enforceTwitterLimit(content: string, hashtags: string): { content: string; hashtags: string } {
  const separator = '\n\n';
  const fullText = hashtags && hashtags !== 'لا يوجد'
    ? content + separator + hashtags
    : content;

  if (countTwitterChars(fullText) <= TWITTER_CHAR_LIMIT) {
    return { content, hashtags };
  }

  // Step 1: trim hashtags to just 2 (the most important ones)
  const hashtagList = hashtags
    .split(/\s+/)
    .filter(t => t.startsWith('#'))
    .slice(0, 2);
  const trimmedHashtags = hashtagList.join(' ');

  const withTrimmedTags = trimmedHashtags
    ? content + separator + trimmedHashtags
    : content;

  if (countTwitterChars(withTrimmedTags) <= TWITTER_CHAR_LIMIT) {
    return { content, hashtags: trimmedHashtags };
  }

  // Step 2: truncate content at a word boundary, leaving room for "…" + tags
  const ellipsis = '…';
  // Reserve space: separator + tags + ellipsis
  const reserve = (trimmedHashtags ? separator.length + countTwitterChars(trimmedHashtags) : 0) + countTwitterChars(ellipsis);
  const budget = TWITTER_CHAR_LIMIT - reserve;

  if (budget < 50) {
    // Edge case: tags alone eat most of the budget — just keep content ultra-short with no tags
    const ultraShort = truncateAtWord(content, 270);
    return { content: ultraShort + ellipsis, hashtags: '' };
  }

  const truncated = truncateAtWord(content, budget);
  return {
    content: truncated + ellipsis,
    hashtags: trimmedHashtags,
  };
}

/** Truncates `text` to at most `maxChars` (by Twitter counting), breaking at
 *  the last whitespace so we never cut mid-word. */
function truncateAtWord(text: string, maxChars: number): string {
  const chars = Array.from(text);
  if (countTwitterChars(text) <= maxChars) return text;

  let running = 0;
  let lastSpaceIdx = -1;
  let result: string[] = [];
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const code = ch.codePointAt(0) || 0;
    const weight = code > 0xFFFF ? 2 : 1;
    if (running + weight > maxChars) break;
    result.push(ch);
    running += weight;
    if (/\s/.test(ch)) lastSpaceIdx = result.length - 1;
  }
  // If we found a space near the end, break there for a clean cut
  if (lastSpaceIdx > result.length * 0.7 && lastSpaceIdx > 0) {
    result = result.slice(0, lastSpaceIdx);
  }
  return result.join('').trimEnd();
}

function enforceConsistency(
  parsed: { content?: string; hashtags?: string; headline?: string; resolvedProperty?: Record<string, unknown> },
  input: PropertyInput,
  angle: VariationAngle,
  seed: number,
  formattedPrice: string,
): GeneratedContent {
  const cityName = input.customCity || input.city;
  const correctType = input.propertyType;
  const correctLocation = [input.customArea, cityName, input.country].filter(Boolean).join('، ');
  const family: PropertyFamily = input.family || PROPERTY_FAMILY_MAP[input.propertyType] || 'residential';
  const isLand = family === 'land';
  const purposeWord = input.purpose === 'rent' ? 'للإيجار'
    : input.purpose === 'evaluate' ? 'للتقييم'
    : 'للبيع';

  // Known property-type words — anything here that ISN'T the correct type
  // is a hallucination that must be replaced.
  const ALL_TYPES = ['فيلا', 'فلل', 'شقة', 'شقق', 'بنتهاوس', 'دوبلكس', 'أرض', 'أراضٍ', 'مكتب تجاري', 'مكاتب تجارية', 'محل تجاري', 'محلات تجارية', 'عمارة سكنية', 'عمائر سكنية', 'استوديو', 'استوديوهات', 'شاليه', 'شاليهات'];

  let content = String(parsed.content || '');
  let headline = String(parsed.headline || '');
  let hashtags = String(parsed.hashtags || '');

  // 0. Fix common spelling mistakes (مصيع → مصعد, etc.)
  content = fixSpelling(content);
  headline = fixSpelling(headline);
  hashtags = fixSpelling(hashtags);

  // 1. Replace wrong property-type words in content with the correct type
  for (const wrongType of ALL_TYPES) {
    if (wrongType === correctType) continue;
    // Don't replace plurals of the correct type
    if (correctType === 'شقة' && wrongType === 'شقق') continue;
    if (correctType === 'فيلا' && wrongType === 'فلل') continue;
    if (correctType === 'أرض' && wrongType === 'أراضٍ') continue;
    if (correctType === 'استوديو' && wrongType === 'استوديوهات') continue;
    if (correctType === 'شاليه' && wrongType === 'شاليهات') continue;

    // Replace this wrong type with the correct type
    const regex = new RegExp(wrongType, 'g');
    content = content.replace(regex, correctType);
    headline = headline.replace(regex, correctType);
  }

  // 1b. Sanitize hashtags — remove wrong property-type hashtags (e.g. "#فيلا" when type is "شقة")
  // Each hashtag is a token starting with #
  hashtags = hashtags
    .split(/\s+/)
    .filter(tag => {
      if (!tag.startsWith('#')) return true;
      // Strip the # and any underscores
      const clean = tag.replace(/^#/, '').replace(/_/g, ' ').trim();
      // Check if any wrong type appears as a word in this hashtag
      for (const wrongType of ALL_TYPES) {
        if (wrongType === correctType) continue;
        if (correctType === 'شقة' && wrongType === 'شقق') continue;
        if (correctType === 'فيلا' && wrongType === 'فلل') continue;
        if (correctType === 'أرض' && wrongType === 'أراضٍ') continue;
        if (correctType === 'استوديو' && wrongType === 'استوديوهات') continue;
        if (correctType === 'شاليه' && wrongType === 'شاليهات') continue;
        // If the hashtag contains the wrong type as a whole word, drop it
        if (clean === wrongType || clean.includes(' ' + wrongType) || clean.includes(wrongType + ' ')) {
          return false;
        }
        // Also catch exact matches like "فيلا" or "فلل" alone
        if (clean === wrongType) return false;
      }
      return true;
    })
    .join(' ');

  // 2. Ensure the property type appears in the content at least once
  if (!content.includes(correctType)) {
    content = `${correctType} ${purposeWord} في ${cityName}!\n\n${content}`;
  }

  // 2b. COMPLETENESS ENFORCEMENT — if any required field is missing from the
  // content, append a structured "تفاصيل العقار" block at the end so the user
  // ALWAYS sees all property data covered. This is the safety net behind the
  // prompt-level instruction: even if the LLM forgets a field, we add it.
  const missingLines: string[] = [];
  if (input.area && !content.includes(String(input.area))) {
    missingLines.push(`📐 المساحة: ${input.area} م²`);
  }
  // Only enforce rooms for non-land properties
  if (!isLand && input.rooms && !content.includes(String(input.rooms))) {
    missingLines.push(`🛏️ عدد الغرف: ${input.rooms}`);
  }
  if (formattedPrice && !content.includes(formattedPrice)) {
    missingLines.push(`💰 السعر: ${formattedPrice} ${input.currency}`);
  }
  if (input.customArea && !content.includes(input.customArea)) {
    missingLines.push(`📍 الحي: ${input.customArea}`);
  }
  if (input.country && !content.includes(input.country)) {
    missingLines.push(`🌍 الدولة: ${input.country}`);
  }
  // Missing features (each must appear individually)
  const missingFeatures = input.features.filter(f => f && !content.includes(f));
  if (missingFeatures.length > 0) {
    missingLines.push('✨ مميزات إضافية:');
    for (const f of missingFeatures) {
      missingLines.push(`   • ${f}`);
    }
  }
  if (missingLines.length > 0) {
    content = `${content}\n\n━━━ تفاصيل العقار ━━━\n${missingLines.join('\n')}`;
  }

  // 3. Build resolvedProperty STRICTLY from form values (LLM is NOT trusted)
  const resolvedProperty: ResolvedProperty = {
    type: correctType,
    location: correctLocation,
    area: input.area ? input.area + ' م²' : undefined,
    rooms: (!isLand && input.rooms) ? input.rooms + ' غرف' : undefined,
    price: formattedPrice ? formattedPrice + ' ' + input.currency : undefined,
    features: input.features.length > 0
      ? [...input.features]
      : (Array.isArray(parsed.resolvedProperty?.features)
        ? (parsed.resolvedProperty.features as unknown[]).map(f => String(f)).filter(Boolean)
        : []),
  };

  // ── Twitter-specific: enforce the 280-char limit ──
  // The intent/tweet share URL opens ONE tweet compose box. If the content
  // + hashtags exceed 280 chars, Twitter silently truncates — losing the CTA.
  // We proactively trim here so the shared tweet is always complete.
  if (input.platform === 'twitter') {
    const trimmed = enforceTwitterLimit(content, hashtags);
    content = trimmed.content;
    hashtags = trimmed.hashtags;
  }

  return {
    content: content || '',
    hashtags: hashtags || '',
    headline: headline || '',
    resolvedProperty,
    variationAngle: angle.key,
    variationSeed: seed,
  };
}

/* ─── Smart fallback that uses all property data ─── */

function buildFallback(
  input: PropertyInput,
  angle: VariationAngle,
  seed: number,
  primaryAudience: { name: string; concerns: string; triggers: string; tone: string },
  secondaryAudience: { name: string; concerns: string; triggers: string },
): GeneratedContent {
  const cityName = input.customCity || input.city;
  const featuresBullets = input.features.length > 0
    ? input.features.map(f => `• ${f}`).join('\n')
    : '';
  const locationParts = [input.customArea, cityName, input.country].filter(Boolean).join('، ');
  const formattedPrice = input.price ? Number(input.price).toLocaleString('ar-SA') : '';
  const family: PropertyFamily = input.family || PROPERTY_FAMILY_MAP[input.propertyType] || 'residential';
  const isLand = family === 'land';
  const purposeWord = input.purpose === 'rent' ? 'للإيجار'
    : input.purpose === 'evaluate' ? 'للتقييم'
    : 'للبيع';

  // For land, skip the rooms line entirely — lands don't have rooms
  const roomsDisplay = isLand ? '' : (input.rooms || '-');
  const roomsLabel = isLand ? '' : `🛏️ عدد الغرف: ${roomsDisplay}\n`;

  const resolvedProperty: ResolvedProperty = {
    type: input.propertyType,
    location: locationParts,
    area: input.area ? input.area + ' م²' : undefined,
    rooms: (!isLand && input.rooms) ? input.rooms + ' غرف' : undefined,
    price: formattedPrice ? formattedPrice + ' ' + input.currency : undefined,
    features: [...input.features],
  };

  const cta = pickFromPool(CTA_POOL, seed, 5);

  // Audience-aware openings for the fallback
  const audienceHook: Record<string, string> = {
    'المستثمر': `📊 فرصة استثمارية حقيقية في ${cityName} — عائد متوقع مجزٍّ،`,
    'العائلة': `🏡 بيت العمر ينتظر عائلتك في ${cityName} —`,
    'المشتري لأول مرة': `✨ أول عقار لك؟ ابدأها صح في ${cityName} —`,
    'الباحث عن الفخامة': `💎 للمتميّزين فقط — ${input.propertyType} فاخر في ${cityName}،`,
    'صاحب الأعمال': `🏢 موقع يُعزّز أعمالك في ${cityName} —`,
  };
  const opening = audienceHook[primaryAudience.name] || `${input.propertyType} في ${cityName}،`;

  const audienceLine: Record<string, string> = {
    'المستثمر': `\n\n📈 ${secondaryAudience.name === 'العائلة' ? 'كما يُناسب العائلة الباحثة عن الاستقرار.' : 'مع فرصة نمو رأسمالي واضحة.'}`,
    'العائلة': `\n\n👨‍👩‍👧‍👦 ${secondaryAudience.name === 'المستثمر' ? 'استثمار آمن لمستقبلكم ومستقبل عائلتكم.' : 'كما يُمثّل فرصة استثمارية ذكية.'}`,
    'المشتري لأول مرة': `\n\n💼 ${'فرصة لا تُعوّض — سواء للسكن أو الاستثمار.'}`,
    'الباحث عن الفخامة': `\n\n✨ ${'لمسة فاخرة تُكمل أسلوب حياتك الراقي.'}`,
    'صاحب الأعمال': `\n\n💡 ${'استثمار يجمع بين الموقع المتميّز والقيمة الراقية.'}`,
  };
  const audienceTouch = audienceLine[primaryAudience.name] || '';

  const platformDefaults: Record<Platform, Omit<GeneratedContent, 'resolvedProperty' | 'variationAngle' | 'variationSeed'>> = {
    whatsapp: {
      content: `${opening} ${input.propertyType} ${purposeWord}!\n\n📍 الموقع: ${locationParts}\n📐 المساحة: ${input.area || '-'} م²\n${roomsLabel}💰 السعر: ${formattedPrice ? formattedPrice + ' ' + input.currency : 'عند الاتفاق'}\n\n✨ المميزات:\n${featuresBullets}\n${audienceTouch}\n\n📞 ${cta}! لا تفوّت الفرصة`,
      hashtags: 'لا يوجد',
      headline: `${input.propertyType} مميز في ${cityName} — فرصة لا تُعوّض!`,
    },
    twitter: {
      content: `🔥 ${opening} ${input.propertyType} في ${locationParts}${formattedPrice ? ' | ' + formattedPrice + ' ' + input.currency : ''}${input.features.length > 0 ? ' | يتميز بـ' + input.features.slice(0, 2).join(' و') : ''} — فرصة لا تتكرر لـ${primaryAudience.name}! ${cta} 👇`,
      hashtags: `#عقارات_${cityName.replace(/\s/g, '_')} #عقارات #${purposeWord.replace(/\s/g, '_')} #${input.propertyType.replace(/\s/g, '_')}`,
      headline: `${input.propertyType} في ${cityName} — فرصة ذهبية 🔥`,
    },
    snapchat: {
      content: `✨ ${input.propertyType} فاخر في ${cityName}${input.customArea ? '، ' + input.customArea : ''}! ${input.features[0] || 'فرصة لا تتكرر'} 🔥 ${cta}!`,
      hashtags: `#عقارات #${input.propertyType.replace(/\s/g, '_')} #${purposeWord.replace(/\s/g, '_')}`,
      headline: `${input.propertyType} ${input.features[0] || 'مميز'} في ${cityName}! 🔥`,
    },
    instagram: {
      content: `${opening}\n\n🏠 ${input.propertyType} في ${locationParts} — ينتظرك!\n\n✨ يتميز بـ:\n${featuresBullets}\n\n📐 المساحة: ${input.area || '-'} م²${!isLand ? ` | 🛏️ ${roomsDisplay} غرف` : ''}${formattedPrice ? '\n💰 ابتداءً من ' + formattedPrice + ' ' + input.currency : ''}\n\n📍 موقع استراتيجي يضمن لك الراحة والاستثمار الذكي.${audienceTouch}\n\n📞 ${cta}!`,
      hashtags: `#عقارات_${cityName.replace(/\s/g, '_')} #عقارات #${purposeWord.replace(/\s/g, '_')} #استثمار_عقاري #${input.propertyType.replace(/\s/g, '_')} #عقار_مميز ${input.features.map(f => '#' + f.replace(/\s/g, '_')).join(' ')} #تسويق_عقاري`,
      headline: `${input.propertyType} أحلامك في ${cityName} — فرصة لا تُعوّض! ✨`,
    },
    linkedin: {
      content: `فرصة استثمارية مميزة في ${locationParts}\n\n${opening.replace(/[📊💎🏡✨🏢]/g, '').trim()}\n\nنُقدّم لكم ${input.propertyType} يجمع بين الموقع الاستراتيجي والقيمة الراقية:\n• المساحة: ${input.area || 'حسب الطلب'} م²${!isLand ? `\n• التصميم: ${input.rooms || 'مرن'} غرف` : ''}${formattedPrice ? '\n• السعر التنافسي: ' + formattedPrice + ' ' + input.currency : ''}\n\nأبرز ما يميّز هذا العقار:\n${featuresBullets}\n\nموقع استراتيجي يضمن عائداً مجزياً على الاستثمار وقيمة سوقية متنامية. مناسب لـ${primaryAudience.name} الباحث عن فرص حقيقية في سوق عقاري واعد.${audienceTouch}\n\nيسعدني تواصلكم للتفاصيل الكاملة والمعاينة.`,
      hashtags: `#العقارات #الاستثمار_العقاري #الفرص_الاستثمارية #سوق_العقار #${input.propertyType.replace(/\s/g, '_')} #عقارات_${cityName.replace(/\s/g, '_')}`,
      headline: `فرصة استثمارية: ${input.propertyType} في ${cityName}`,
    },
    facebook: {
      content: `🏠 تبحث عن ${input.propertyType} في ${locationParts}؟\n\n${opening}\n\n📋 التفاصيل:\n🔹 النوع: ${input.propertyType}\n🔹 الموقع: ${locationParts}\n🔹 المساحة: ${input.area || '-'} م²${!isLand ? `\n🔹 الغرف: ${input.rooms || '-'}` : ''}${formattedPrice ? '\n🔹 السعر: ' + formattedPrice + ' ' + input.currency : ''}\n\n⭐ أبرز المميزات:\n${featuresBullets}\n\n📍 موقع متميّز وبيئة مثالية.${audienceTouch}\n\n💬 شو رأيك؟ تعالزرنا نشوفه على الطبيعة!\n📞 ${cta}`,
      hashtags: `#عقارات_${cityName.replace(/\s/g, '_')} #عقارات #${purposeWord.replace(/\s/g, '_')} #${input.propertyType.replace(/\s/g, '_')} #بيت_العمر #عقارات_الخليج ${input.features.slice(0, 2).map(f => '#' + f.replace(/\s/g, '_')).join(' ')}`,
      headline: `${input.propertyType} في ${cityName} — بيت العمر ينتظرك! 🏡`,
    },
  };

  const fallbackResult = {
    ...platformDefaults[input.platform],
    resolvedProperty,
    variationAngle: angle.key,
    variationSeed: seed,
  };

  // Apply the Twitter 280-char limit to the fallback too (consistent with LLM path)
  if (input.platform === 'twitter') {
    const trimmed = enforceTwitterLimit(fallbackResult.content, fallbackResult.hashtags);
    fallbackResult.content = trimmed.content;
    fallbackResult.hashtags = trimmed.hashtags;
  }

  return fallbackResult;
}
