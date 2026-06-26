/**
 * Client-safe types, constants, and helpers for the AI marketing engine.
 *
 * This file is intentionally SDK-free so it can be imported from client
 * components. The actual LLM call lives in `./ai.ts` (server-only).
 */

export type Platform = 'instagram' | 'twitter' | 'snapchat' | 'whatsapp' | 'linkedin' | 'facebook';

export interface PropertyInput {
  propertyType: string;
  /** The property family — drives which dynamic fields & features apply. */
  family?: PropertyFamily;
  /** Sale purpose — drives the entire marketing angle.
   *  'sale'     → buyer/investor angle (ownership, ROI, future appreciation, complete docs)
   *  'rent'     → tenant angle (monthly rent, deposit, contract, immediate move-in, furnished, utilities)
   *  'evaluate' → advisory mode for the merchant (market value, readiness for sale/rent/investment)
   */
  purpose?: 'sale' | 'rent' | 'evaluate';
  city: string;
  country: string;
  area: string;
  rooms: string;
  price: string;
  currency: string;
  features: string[];
  customArea: string;
  customCity: string;
  platform: Platform;
  /** Free-text notes from the seller (for extra context the pro wants to add). */
  notes?: string;
  /** Optional, enriching details the seller may add to boost sale odds. */
  optionalDetails?: OptionalDetails;
  /** Which post length/style the user requested. */
  postMode?: PostMode;
  /** When postMode === 'custom', the section IDs the user wants included. */
  customSections?: string[];
}

/* ════════════════════════════════════════════════════════════════════════
 * PropertyFamily — groups the 10 property types into 5 families that share
 * the same data structure. This is the heart of the "smart wizard":
 *   • land          → never asks for rooms/bathrooms/kitchens
 *   • residential   → asks for rooms, bathrooms, floor, finishing
 *   • villa         → asks for rooms, bathrooms, kitchens, majlis, floors
 *   • building      → asks for floors, units per floor, elevator, basement
 *   • commercial    → asks for frontage, location type, suitability
 * ════════════════════════════════════════════════════════════════════════ */
export type PropertyFamily = 'residential' | 'villa' | 'land' | 'building' | 'commercial';

export const PROPERTY_FAMILY_MAP: Record<string, PropertyFamily> = {
  'شقة': 'residential',
  'استوديو': 'residential',
  'بنتهاوس': 'residential',
  'دوبلكس': 'residential',
  'فيلا': 'villa',
  'شاليه': 'villa',
  'أرض': 'land',
  'عمارة سكنية': 'building',
  'محل تجاري': 'commercial',
  'مكتب تجاري': 'commercial',
};

export const FAMILY_LABELS: Record<PropertyFamily, string> = {
  residential: 'وحدات سكنية',
  villa: 'فلل ومنازل',
  land: 'أراضٍ',
  building: 'عمائر سكنية',
  commercial: 'تجاري',
};

/* ─── Smart feature lists per family ───
 * Each family shows ONLY features relevant to it. No "pool" for land,
 * no "elevator" for a shop, no "majlis" for an apartment. */
export const FAMILY_FEATURES: Record<PropertyFamily, string[]> = {
  residential: [
    'مصعد', 'موقف سيارات', 'شرفة', 'تكييف', 'مفروش', 'تشطيب فاخر',
    'إطلالة', 'حراسة أمنية', 'قرب المترو', 'مدخل مستقل',
  ],
  villa: [
    'مسبح', 'حديقة خاصة', 'غرفة خادمة', 'جراج', 'مجلس', 'تراس',
    'تشطيب فاخر', 'حراسة أمنية', 'إطلالة بحرية', 'مدخل مستقل',
  ],
  land: [
    'مرافق موصلة', 'أرض زاوية', 'على شارعين', 'مخططة', 'مسوّرة',
    'قرب طريق سريع', 'إطلالة', 'أرض مستوية',
  ],
  building: [
    'مصعد', 'قبو', 'مواقف', 'حراسة أمنية', 'سولار مركزي', 'خزانات',
    'تشطيب فاخر', 'مدخل مستقل',
  ],
  commercial: [
    'واجهة زجاجية', 'مدخل مستقل', 'موقف سيارات', 'مصعد', 'حراسة أمنية',
    'عدّاد مستقل', 'تشطيب فاخر', 'إطلالة',
  ],
};

/* ════════════════════════════════════════════════════════════════════════
 * PURPOSE_OPTIONS — the three purposes the wizard supports.
 *
 * This is the heart of the "sell vs rent vs evaluate" feature:
 *   • sale     → buyer/investor-focused marketing copy
 *   • rent     → tenant-focused marketing copy (different priorities entirely)
 *   • evaluate → advisory mode where the assistant becomes a consultant,
 *                estimating market value and recommending the best path
 *                (sell / rent / hold / invest) based on the property's data.
 *
 * Each option carries:
 *   - label: short label shown in the UI
 *   - description: one-line hint for the user
 *   - priorities: the buyer/tenant/investor concerns that MUST be addressed
 *     in the marketing copy (these are study-based, drawn from real estate
 *     sales research per Arab market)
 *   - emoji/icon hint for the UI
 * ════════════════════════════════════════════════════════════════════════ */
export type Purpose = 'sale' | 'rent' | 'evaluate';

export interface PurposeOption {
  value: Purpose;
  label: string;          // short UI label
  emoji: string;
  shortDesc: string;      // one-line hint
  /** The buyer/tenant/investor priorities that must drive the marketing copy.
   *  Grounded in real estate sales research per Arab market. */
  priorities: string[];
  /** Hint shown below the option card when selected */
  selectedHint: string;
}

export const PURPOSE_OPTIONS: PurposeOption[] = [
  {
    value: 'sale',
    label: 'للبيع',
    emoji: '🏷️',
    shortDesc: 'محتوى موجّه للمشتري والمستثمر — تركيز على القيمة والملكية والعائد',
    priorities: [
      'الملكية والوثائق (صك، طابو، عقد مسجّل) — المشتري يطمئن لاكتمالها',
      'السعر الإجمالي + سعر المتر المربع — مقارنة بالسوق ليثبت أنه فرصة',
      'القيمة الاستثمارية والنمو الرأسمالي المتوقع (تقدير نسبة التقيّم)',
      'الجاهزية للسكن أو التسليم الفوري (مفهوم "استلام فوري")',
      'خيارات التمويل والتقسيط والقبول البنكي (إن وُجدت)',
      'سبب البيع (إن كان إنسانياً يُعزّز الثقة)',
      'الموقع الاستراتيجي وقرب المرافق التي ترفع القيمة',
    ],
    selectedHint: 'سيركّز المساعد على إقناع المشتري الجاد بالقيمة والملكية والعائد المستقبلي',
  },
  {
    value: 'rent',
    label: 'للإيجار',
    emoji: '🔑',
    shortDesc: 'محتوى موجّه للمستأجر — تركيز على الراحة والجاهزية وسهولة الانتقال',
    priorities: [
      'الإيجار الشهري/السنوي بوضوح — المستأجر يبحث عن رقم واضح لا غموض فيه',
      'مدة العقد (مثال: 12 شهراً قابل للتجديد) — مرونة العقد ميزة تنافسية',
      'التأمين وطريقة الدفع (شهري/ربعي/سنوي) — شفافية كاملة تطمئن المستأجر',
      'مفروش / نصف مفروش / فارغ — المستأجر يقرر بناءً على استعداده للنقل',
      'الجاهزية للسكن فوراً (إشغال فوري) — أهم عامل بعد السعر',
      'المرافق المشمولة (ماء/كهرباء/إنترنت) — توفير قابل للقياس',
      'القرب من العمل/الجامعة/المدرسة — المستأجر يقدّر وقت التنقل يومياً',
      'المرونة في الصيانة والتجديد — طمأنة بأن العقار بحالة جيدة',
    ],
    selectedHint: 'سيركّز المساعد على راحة المستأجر والجاهزية للسكن فوراً وشفافية العقد',
  },
  {
    value: 'evaluate',
    label: 'تقييم واستشارة',
    emoji: '📊',
    shortDesc: 'وضع استشاري للتاجر — يقدّر القيمة السوقية ويوصي بالأفضل (بيع/إيجار/استثمار)',
    priorities: [
      'تقدير القيمة السوقية الحالية للعقار بناءً على بياناته وموقعه',
      'مقارنة السعر المُدخل بالقيمة التقديرية (هل هو أعلى/أدنى/مطابق للسوق؟)',
      'توصية ذكية: هل الأفضل للبيع الآن أم التأجير أم الاحتفاظ للاستثمار؟',
      'تحليل الجاهزية: هل العقار جاهز للبيع/الإيجار فوراً أم يحتاج تحسينات؟',
      'تقدير العائد الإيجاري المتوقع والإيجابيات/السلبيات لكل خيار',
      'إشارات السوق المحلي (نمو المنطقة، الطلب، المشاريع القادمة)',
      'خلاصة عملية في النهاية: توصية واضحة + الخطوات التالية',
    ],
    selectedHint: 'سيتحوّل المساعد لمستشار عقاري: يقدّر القيمة، يحلّل، ويوصي بالأفضل',
  },
];

/* Helper: get a PurposeOption by value */
export function getPurposeOption(value: Purpose | '' | undefined): PurposeOption | undefined {
  if (!value) return undefined;
  return PURPOSE_OPTIONS.find(p => p.value === value);
}

/* ════════════════════════════════════════════════════════════════════════
 * PURPOSE_GUIDANCE — the prompt-level instruction block injected into the
 * system prompt for each purpose. This is the "study" the user asked for:
 * how to write SALE copy vs RENT copy vs EVALUATE advisory — based on
 * real estate marketing research per Arab market dynamics.
 * ════════════════════════════════════════════════════════════════════════ */
export const PURPOSE_GUIDANCE: Record<Purpose, string> = {
  sale: `═══ وضع البيع: محتوى موجّه للمشتري والمستثمر ═══
دراسة تسويق البيع: المشتري العاقل يقارن بين 5-10 عقارات قبل أن يقرر، لذلك يجب أن يبرز إعلانك عوامل القسمة التالية:
- الملكية والوثائق: اذكر بوضوح نوع الوثيقة (صك إفرادي، طابو، عقد مسجّل) واكتمالها — هذا يطمئن المشتري الجاد ويختصر دورة التفاوض.
- السعر الذكي: اذكر السعر الإجمالي + سعر المتر المربع إذا كان مفيداً (مثال: "سعر المتر ٣٥٠٠ ريال — أقل من متوسط المنطقة بـ ١٥٪"). اربطه بفرصة السوق.
- القيمة الاستثمارية: اذكر النمو الرأسمالي المتوقع (مثال: "المنطقة شهدت تقيّماً ٢٠٪ خلال السنتين الماضيتين")، وفرصة إعادة البيع، وقرب المشاريع القادمة التي سترفع القيمة.
- الجاهزية: "جاهز للتسليم فوراً" أو "استلام فوري" عبارات قوية للبيع. وضّح الإشغال الحالي (مأهول/فارغ).
- التمويل: إن وُجد قبول بنكي أو تقسيط، اذكره صراحة — نصف المشترين يبحثون عن تمويل.
- سبب البيع: جملة إنسانية قصيرة (الانتقال، الحاجة للسيولة) تكسر الجليد وتبني الثقة.
- نبرة البيع: ثقة + إلحاح هادئ + ندرة — لا تذكّر "السعر قابل للتفاوض" إلا إذا كان البائع موافقاً.`,

  rent: `═══ وضع الإيجار: محتوى موجّه للمستأجر ═══
دراسة تسويق الإيجار: المستأجر يقرر بسرعة (غالباً خلال ٣ أيام من بدء البحث) لأنه يحتاج السكن عاجلاً. لذلك يجب أن يكون الإعلان:
- واضحاً في الرقم: اذكر الإيجار الشهري أو السنوي صراحة (مثال: "إيجار شهري ٢٥٠٠ ريال"). تجنّب "السعر عند الاتفاق" — المستأجر يفقد الاهتمام فوراً.
- شفافاً في العقد: اذكر مدة العقد (مثال: "عقد سنة قابلة للتجديد")، طريقة الدفع (شهري/ربعي/سنوي)، ومبلغ التأمين (مثال: "تأمين شهرين"). المرونة هنا ميزة تنافسية كبيرة.
- مفصّلاً في التأثيث: "مفروش بالكامل"، "نصف مفروش"، أو "فارغ" — المستأجر يحسب تكلفة الأثاث قبل أن يقرر الانتقال.
- واضحاً في الجاهزية: "جاهز للسكن فوراً" أو "متاح من [التاريخ]" — أهم عامل بعد السعر.
- صريحاً في المرافق: هل الإيجار يشمل ماء/كهرباء/إنترنت؟ اذكر ذلك صراحة — التوفير الشهري يهم المستأجر كثيراً.
- مرتبطاً بالحياة اليومية: قرب العمل، الجامعة، المدرسة، المترو — المستأجر يحسب وقت التنقل يومياً (القرب من المترو يرفع الإيجار ١٥-٢٠٪).
- نبرة الإيجار: ترحيبية + ودودة + عملية — المستأجر يبحث عن راحة وليس عن فخامة استثمارية. استخدم "بيتك الجديد"، "عيش براحة"، "متاح الآن".`,

  evaluate: `═══ وضع التقييم والاستشارة: محتوى استشاري للتاجر ═══
دراسة التقييم: هذا ليس إعلاناً للبيع أو الإيجار — بل تقرير استشاري يقدّم فيه المساعد تحليلاً مهنياً للتاجر. النبرة: مهنية، تحليلية، صادقة (لا مبالغة).
يجب أن يحتوي المحتوى على الأقسام التالية بوضوح:
- تقدير القيمة السوقية: استنتج نطاقاً تقديرياً للقيمة بناءً على المساحة، الموقع، نوع العقار، حالة السوق في الدولة والمدينة (مثال: "القيمة التقديرية: بين ٨٥٠,٠٠٠ و ٩٢٠,٠٠٠ ريال").
- مقارنة بالسعر المُدخل: إن أدخل التاجر سعراً، قارنه بالقيمة التقديرية: "أعلى من السوق بـ X٪" أو "مطابق للسوق" أو "أقل من السوق بـ Y٪ — فرصة للبيع سريعاً".
- توصية ذكية (الأهم): أوصِ بوضوح بأحد المسارات: (أ) البيع الآن إن كان السعر جيداً والطلب قوياً، (ب) التأجير إن كان العائد الإيجاري مغرياً والسوق بطيء، (ج) الاحتفاظ للاستثمار إن كان النمو المتوقع مرتفعاً، (د) التحسين أولاً قبل الطرح إن كان العقار يحتاج تحسينات.
- 💡 نصيحة استثمارية (بوصلة الاستثمار): أضف فقرة بعنوان "💡 نصيحة استثمارية" تقترح فرصة استثمارية محددة لهذا العقار (مثال: "هذا العقار مؤهل للإيجار المفروش — العائد المتوقع ٨٪ سنوياً مقابل ٥٪ فارغ" أو "هذا العقار مناسب للشركات — ننصح باستهداف رجال الأعمال بدلاً من العوائل").
- 🎯 الجمهور المستهدف الأمثل: أضف فقرة بعنوان "🎯 الجمهور المستهدف الأمثل" تحدد نوع المشتري/المستأجر الأنسب لهذا العقار (مثال: "العائلات الباحثة عن الاستقرار" أو "المستثمرون الباحثون عن عائد" أو "الشباب العزاب").
- تحليل الجاهزية: هل العقار جاهز للبيع/الإيجار فوراً؟ ما الذي يحتاجه قبل الطرح (تشطيب، صيانة، وثائق)؟
- تقدير العائد: لو أُجّر، ما العائد السنوي المتوقع؟ لو بيع، ما نسبة التقيّم المتوقعة خلال ٣-٥ سنوات؟
- إشارات السوق المحلي: اربط التوصية بسياق الدولة/المدينة (نمو المنطقة، خطط التنمية، الطلب الحالي).
- خلاصة عملية: في النهاية، اكتب ٣-٥ نقاط واضحة كتوصيات عملية التاجر يمكن تنفيذها.
- نبرة التقييم: مهنية، محايدة، تحليلية — كأنك مستشار عقاري يكتب تقريراً لعميل. لا تبيع ولا تسوّق، بل تنصح. تجنب الإيموجي المبالغ فيها.`,

};

/* ════════════════════════════════════════════════════════════════════════
 * PostMode — lets the user choose how deep the marketing copy goes.
 *   'short'  : concise, essentials-only post (4-6 lines)
 *   'full'   : in-depth, comprehensive post covering every detail + context
 *   'custom' : user picks which sections to include via customSections[]
 * ════════════════════════════════════════════════════════════════════════ */
export type PostMode = 'short' | 'full' | 'custom';

export const POST_MODES: Array<{
  value: PostMode;
  label: string;
  desc: string;
}> = [
  {
    value: 'short',
    label: 'بوست مختصر',
    desc: 'تركيز على الأساسيات فقط — سريع وقوي ومباشر',
  },
  {
    value: 'full',
    label: 'بوست كامل ومعمّق',
    desc: 'تغطية شاملة لكل التفاصيل + سياق السوق + لمسة عاطفية + تحليل',
  },
  {
    value: 'custom',
    label: 'بوست مخصّص',
    desc: 'اختر بنفسك الأقسام التي تريد إدراجها في البوست',
  },
];

/**
 * CUSTOM_SECTIONS — the toggleable content blocks the user can pick when
 * postMode === 'custom'. Each id maps to a prompt instruction in ai.ts.
 */
export const CUSTOM_SECTIONS: Array<{
  id: string;
  label: string;
  desc: string;
}> = [
  { id: 'market_context', label: 'سياق السوق المحلي', desc: 'ربط العقار بنمو المنطقة والمشاريع القادمة' },
  { id: 'emotional_appeal', label: 'لمسة عاطفية للجمهور', desc: 'جملة تخاطب العائلة أو المستثمر' },
  { id: 'investment_analysis', label: 'تحليل استثماري', desc: 'العائد المتوقع والقيمة الإيجارية وفرصة النمو' },
  { id: 'urgency_cta', label: 'إحساس بالإلحاح ودعوة قوية', desc: 'لغة تُسرّع القرار وتدفع للتواصل' },
  { id: 'feature_breakdown', label: 'سرد كامل للمميزات', desc: 'كل ميزة في سطر مستقل يُبرز فائدتها' },
  { id: 'proximity', label: 'القرب من المرافق', desc: 'مدارس، مستشفى، مسجد، مول، طرق' },
  { id: 'financing', label: 'خيارات التمويل والتقسيط', desc: 'تفاصيل مالية وتسهيلات الدفع' },
  { id: 'trust_signals', label: 'إشارات الثقة والوثائق', desc: 'نوع الملكية واكتمال الوثائق' },
  { id: 'lifestyle_scene', label: 'مشهد أسلوب الحياة', desc: 'وصف يومي يضع القارئ داخل العقار' },
  { id: 'hashtags_block', label: 'هاشتاقات للوصول الأوسع', desc: 'هاشتاقات استراتيجية حسب المنصة' },
];

/* ════════════════════════════════════════════════════════════════════════
 * OptionalDetails — every field below is OPTIONAL. The seller fills in only
 * what they know / what boosts the property's appeal. All empty fields are
 * simply omitted from the prompt, so they never clutter the copy.
 *
 * Grouped by theme to match the UI sections in InteractiveDemo Step 5.
 * ════════════════════════════════════════════════════════════════════════ */
export interface OptionalDetails {
  // ── Financial / payment facilitation ──
  installmentAvailable?: 'yes' | 'no';
  downPayment?: string;
  installmentMonths?: string;
  bankFinancing?: 'yes' | 'no';
  cashDiscount?: string;
  pricePerMeter?: string;          // often computed, but seller can override

  // ── Ownership & legal documentation ──
  ownershipType?: string;          // صك إفرادي، طابو، فرمان، حجة، عقد مسجل
  ownershipStatus?: string;        // خالص، مرهون، على ذمة بيع
  completeDocs?: 'yes' | 'no';
  registered?: 'yes' | 'no';
  brokerType?: 'owner' | 'broker'; // مباشر من المالك / عبر مكتب مرخّص

  // ── Construction details ──
  bathrooms?: string;
  floor?: string;
  totalFloors?: string;
  yearBuilt?: string;
  finishType?: string;             // سوبر لوكس، نصف تشطيب، على الطوب
  majlisCount?: string;
  ceilingHeight?: string;
  facadeType?: string;             // حجر طبيعي، كلادينج، زجاجية

  // ── Proximity to facilities ──
  nearSchool?: string;
  nearHospital?: string;
  nearMosque?: 'yes' | 'no';
  nearMall?: string;
  nearHighway?: string;
  nearMetro?: string;
  streetType?: 'main' | 'quiet';

  // ── Sub-areas ──
  gardenArea?: string;
  roofArea?: string;
  parkingCount?: string;
  maidRoom?: 'yes' | 'no';
  independentEntrance?: 'yes' | 'no';

  // ── Usage / occupancy ──
  occupancyStatus?: string;        // مأهول، فارغ، جاهز للسكن فوراً
  suitableFor?: string[];          // سكن عائلي، مكتب، عيادة، استثمار، إيجار
  reasonForSale?: string;

  // ── Investment angle ──
  expectedROI?: string;
  expectedRent?: string;
  surroundingProjects?: string;

  // ── Contact & viewing ──
  contactPhone?: string;
  viewingAvailable?: 'yes' | 'no';
  virtualTourLink?: string;

  // ═══ Dynamic fields per property family ═══

  // ── Land-specific (family === 'land') ──
  landType?: string;             // بيضاء / سكنية / تجارية / زراعية / صناعية
  landContents?: string;         // خالية / بها مباني / بها حديقة
  planningStatus?: string;       // مخططة / غير مخططة / على مخطط معتمد
  streetWidth?: string;          // عرض الشارع بالمتر
  hasUtilities?: 'yes' | 'no';   // مرافق موصلة (ماء/كهرباء)
  isCorner?: 'yes' | 'no';       // أرض زاوية
  frontageWidth?: string;        // طول الواجهة

  // ── Building-specific (family === 'building') ──
  buildingFloors?: string;       // عدد الأدوار
  apartmentsPerFloor?: string;   // عدد الشقق في كل دور
  totalUnits?: string;           // إجمالي الوحدات
  hasElevator?: 'yes' | 'no';
  hasBasement?: 'yes' | 'no';

  // ── Commercial-specific (family === 'commercial') ──
  locationType?: string;         // شارع رئيسي / مول / مجمع / داخل حي
  commercialSuitability?: string; // مكتب / عيادة / مطعم / معرض

  // ═══ Purpose-specific dynamic fields ═══

  // ── Rent-specific (purpose === 'rent') — tenant priorities ──
  rentPeriod?: 'monthly' | 'annual' | 'weekly' | 'daily';  // دورية الإيجار
  rentFurnished?: 'yes' | 'no' | 'partial';                // مفروش / فارغ / نصف مفروش
  rentContractDuration?: string;     // مدة العقد بالأشهر (مثال: 12)
  rentDeposit?: string;              // مبلغ التأمين
  rentIncludesUtilities?: 'yes' | 'no';  // شامل المرافق (ماء/كهرباء/إنترنت)
  rentImmediateMoveIn?: 'yes' | 'no';    // جاهز للسكن فوراً
  rentPaymentFrequency?: 'monthly' | 'quarterly' | 'biannual' | 'annual';  // كيفية سداد الإيجار

  // ── Evaluate-specific (purpose === 'evaluate') — advisory mode ──
  evaluateGoal?: 'estimate_value' | 'sell_or_rent_decision' | 'investment_feasibility';
  // estimate_value          → ما قيمته السوقية؟
  // sell_or_rent_decision   → هل أبيع أم أؤجّر؟
  // investment_feasibility  → هل يصلح للاستثمار؟ وما العائد المتوقع؟
}

/**
 * ResolvedProperty — the property data EXACTLY as it appears in the generated
 * marketing content. The displayed property card uses THIS (not the form input)
 * so the card is always 100% consistent with whatever copy the assistant wrote.
 *
 * This fixes the recurring issue where the card stayed fixed ("شقة 3 غرف") while
 * the marketing copy below it varied between "فيلا" and "شقة".
 */
export interface ResolvedProperty {
  type: string;          // e.g. "فيلا" / "شقة" / "بنتهاوس" — what the copy actually says
  location: string;      // e.g. "جدة، حي الورود"
  area?: string;         // e.g. "350 م²" (with unit)
  rooms?: string;        // e.g. "5 غرف" (with unit)
  price?: string;        // formatted price WITH currency
  features: string[];    // features actually mentioned in the content
}

export interface GeneratedContent {
  content: string;
  hashtags: string;
  headline: string;
  resolvedProperty: ResolvedProperty;
  variationAngle: string;   // which personality was used (for tracking + learning)
  variationSeed: number;    // seed used (so we can avoid repeats / reproduce)
}

/**
 * PersonalizationInput — learned signals from a visitor's past interactions.
 * Passed from the API route (which reads the StyleProfile) into the generator.
 * This is the "background training" memory that makes content evolve per user.
 */
export interface PersonalizationInput {
  visitorId: string;
  generationCount: number;
  upvoteCount: number;
  downvoteCount: number;
  trustScore: number;
  preferredAngles: string[];
  avoidedAngles: string[];
  likedVocab: string[];
  lastAngle: string | null;
  preferredTypes: string[];
}

/* ─── Variation angles (the "personalities" the assistant can write in) ─── */
/* Picking different angles for the same property+platform produces visibly    */
/* different copy every time — so no two visitors get identical results, and  */
/* the same visitor gets fresh content on each "regenerate".                  */

export interface VariationAngle {
  key: string;
  name: string;
  openingStyle: string;
  toneRules: string;
  ctaStyle: string;
  emojiDensity: 'minimal' | 'moderate' | 'rich';
}

export const VARIATION_ANGLES: VariationAngle[] = [
  {
    key: 'enthusiast',
    name: 'المتحمس',
    openingStyle: 'ابدأ بجملة تعبيرية قوية مليئة بالحماس والإعجاب',
    toneRules: 'استخدم مفردات حماسية بذوق: "يا سلام!"، "لا يُفوَّت!"، "فرصة العمر!" — أكثر من علامات التعجب باعتدال',
    ctaStyle: 'دعوة حماسية مباشرة: "تواصل الحين ولا تفوّت الفرصة!"',
    emojiDensity: 'rich',
  },
  {
    key: 'advisor',
    name: 'المستشار الخبير',
    openingStyle: 'ابدأ بجملة تُبرز الخبرة والرؤية التحليلية للسوق',
    toneRules: 'استخدم لغة المستشار العقاري: "بناءً على خبرتنا"، "هذه فرصة استراتيجية"، "القيمة الحقيقية هنا" — تجنب المبالغة',
    ctaStyle: 'دعوة مهنية: "للتفاصيل والاستشارة، يسعدني تواصلكم"',
    emojiDensity: 'minimal',
  },
  {
    key: 'storyteller',
    name: 'الراوي',
    openingStyle: 'ابدأ بوصف لحظة أو مشهد يضع القارئ داخل العقار',
    toneRules: 'اربط العقار بأسلوب الحياة: "تخيّل صباحك..."، "عشاء عائلي في..."، "استرخِ في..." — اجعل القارئ يعيش التجربة',
    ctaStyle: 'دعوة تنقل المشهد: "تعال شوف بنفسك كيف حياتك هتتغير هنا"',
    emojiDensity: 'moderate',
  },
  {
    key: 'luxury',
    name: 'الفخامة الراقية',
    openingStyle: 'ابدأ بجملة تُبرز الحصرية والرقي',
    toneRules: 'استخدم مفردات الفخامة: "حصري"، "نادر"، "مُختار بعناية"، "للمتميزين فقط"، "فئة راقية" — تجنب اللهجة الدارجة المبتذلة',
    ctaStyle: 'دعوة راقية: "للراغبين في التميّز، تواصلوا لمعاينة خاصة"',
    emojiDensity: 'minimal',
  },
  {
    key: 'urgency',
    name: 'الإلحاح الذكي',
    openingStyle: 'ابدأ بجملة تُبرز ندرة الفرصة أو محدوديتها',
    toneRules: 'استخدم مفردات الندرة بحسن ذوق: "قليل ما يجي"، "ما يتكرر بسهولة"، "الفرص مثل هذه نادرة" — تجنب الضغط المبتذل',
    ctaStyle: 'دعوة هادئة مع إلحاح: "إذا كان هذا عقارك القادم، تواصل قبل أن يأخذه غيرك"',
    emojiDensity: 'moderate',
  },
  {
    key: 'conversational',
    name: 'الصديق الناصح',
    openingStyle: 'ابدأ بجملة ودّية كأنك تنصح قريب أو صديق',
    toneRules: 'استخدم أسلوب النصح الودي: "بصراحة"، "والله ما تلقى أحلى من هذا"، "أنصحك فيه" — حافظ على الاحترام',
    ctaStyle: 'دعوة ودية: "تعال نشوفه سوا، وأنت تحكم"',
    emojiDensity: 'moderate',
  },
];

export const HOOKS_POOL = [
  'هل تبحث عن',
  'وصلنا لك',
  'فرصة لن تتكرر:',
  'تخيّل أنك',
  'بصراحة، هذا العقار',
  'في قلب',
  'للمرة الأولى في',
  'نادراً ما يتوفر',
  'إذا كنت تبحث عن التميّز في',
  'السوق العقاري يشهد',
  'لمن يستحق الأفضل،',
  'بين خيارات كثيرة،',
];

export const CTA_POOL = [
  'تواصل الآن',
  'لا تفوّت الفرصة',
  'احجز معاينتك اليوم',
  'للتفاصيل والمعاينة، تواصل معنا',
  'رسالة واحدة تفصلك عن بيت أحلامك',
  'اتصل الآن قبل أن يسبقك غيرك',
  'يسعدنا تواصلكم',
  'تعال شوف العقار بنفسك',
  'لا تؤجل قرارك',
  'الحجز مفتوح الآن',
];

export function pickFromPool<T>(pool: T[], seed: number, salt = 0): T {
  return pool[Math.abs(seed + salt * 2654435761) % pool.length];
}

/**
 * Pick a variation angle, honoring personalization and avoiding immediate repeats.
 * This is the heart of "no two visitors get identical results".
 */
export function pickVariationAngle(
  personalization: PersonalizationInput | null,
  seed: number,
): VariationAngle {
  let candidates = [...VARIATION_ANGLES];

  if (personalization) {
    // Remove avoided angles (learned from downvotes)
    if (personalization.avoidedAngles.length > 0) {
      candidates = candidates.filter(a => !personalization.avoidedAngles.includes(a.key));
    }
    // If we have preferred angles, bias toward them 60% of the time (keep 40% exploration)
    if (personalization.preferredAngles.length > 0 && candidates.length > 1) {
      if (Math.abs(seed) % 10 < 6) {
        const preferred = candidates.filter(a => personalization.preferredAngles.includes(a.key));
        if (preferred.length > 0) candidates = preferred;
      }
    }
    // Avoid repeating the last angle if we have alternatives
    if (personalization.lastAngle && candidates.length > 1) {
      candidates = candidates.filter(a => a.key !== personalization.lastAngle);
    }
  }

  if (candidates.length === 0) candidates = [...VARIATION_ANGLES];
  return candidates[Math.abs(seed) % candidates.length];
}

/* ─── Helper: extract "liked vocab" from a piece of content for the style profile ───
 * Called when a visitor upvotes content — we pull distinctive marketing words
 * so future generations can echo their taste. Keeps the profile lean (capped). */
export function extractLikedVocab(content: string): string[] {
  const MARKETING_VOCAB = [
    'فرصة', 'استثمارية', 'استراتيجي', 'حصري', 'نادر', 'فاخر', 'راقي', 'متميز',
    'لا تتكرر', 'مجزٍ', 'القيمة الحقيقية', 'بيت الأحلام', 'أسلوب حياة',
    'القلب', 'أرقى', 'المثالي', 'الذكي', 'المطمئن', 'الفخامة', 'الراحة',
  ];
  const found = MARKETING_VOCAB.filter(w => content.includes(w));
  return found.slice(0, 12);
}

/* ─── Country market context (used to make content more persuasive + localized) ───
 * Injected into the prompt so the assistant can reference real market dynamics
 * (vision 2030, tourism growth, mega projects) which makes the copy feel
 * researched and credible, not generic. */
export const COUNTRY_MARKET_CONTEXT: Record<string, string> = {
  'السعودية': 'السوق السعودي يعيش نهضة كبرى برؤية 2030 — مشاريع نيوم والقدية والبحر الأحمر، توسّع الرياض وجدة، نمو الطلب على الإسكان العائلي بنسبة 15% سنوياً، اهتمام المشتري السعودي بالخصوصية والمساحة الواسعة وقرب الخدمات والمدارس.',
  'الإمارات': 'السوق الإماراتي الأكثر تنوعاً إقليمياً — دبي كعاصمة عالمية للعقارات الفاخرة، نمو الطلب من المستثمرين الأجانب، أبراج البنتهاوس في المراسي ومارينا، المشتري يقدّر الإطلالة البحرية والخدمات الفندقية وعائد الإيجار القصير.',
  'قطر': 'سوق قطري مستقر بعد كأس العالم 2022 — البنية التحتية الجديدة، لوسيل كعاصمة حديثة، إقبال الخليجيين على الفلل الساحلية، المشتري يبحث عن الجودة والاستدامة وقرب المرافق التعليمية.',
  'الكويت': 'السوق الكويتي مدفوع بالطلب المحلي — مشاريع جنوب الصباحية ومدينة الحرير، تركيز على الإسكان العائلي، المشتري الكويتي يقدّر المساحة الكبيرة والتصميم التقليدي الحديث وقرب العائلة.',
  'البحرين': 'سوق البحرين يجذب المستثمرين الخليجيين — أسعار تنافسية، بيئة استثمارية مرنة، تيسيرات التملك الحر، المشتري يقدّر القيمة مقابل السعر والاستقرار الاقتصادي.',
  'عُمان': 'سوق عُماني هادئ ونامٍ — سياحة مسقط وصلالة، مشاريع سياحية ساحلية، المشتري يبحث عن الهدوء والإطلالة الجبلية أو البحرية والهوية العمانية الأصيلة.',
  'مصر': 'السوق المصري متنوع وحيوي — العاصمة الإدارية الجديدة والعلمين وأكتوبر، أسعار تنافسية للشرائح المتوسطة والراقية، اهتمام المصريين بالخارج بالاستثمار الآمن، المشتري يقدّر التشطيب المتكامل ومرافق الأمن والخدمات.',
  'الأردن': 'السوق الأردني مستقر — عمّان والزرقاء والعقبة، إقبال اللاجئين والمستثمرين الخليجيين، المشتري يقدّر الجودة والاستقرار الأمني وقرب الجامعات.',
  'العراق': 'السوق العراقي في طور التعافي — بغداد والبصرة وأربيل، طلب محلي قوي على الإسكان، المشتري يقدّر السعر التفاعلي والموقع الآمن وقرب الخدمات الأساسية.',
  'المغرب': 'سوق المغرب يجذب الأوروبيين والخليجيين — مراكش والدار البيضاء وطنجة، سياحة الإقامة الطويلة، المشتري يقدّر الهوية المعمارية والحدائق والإطلالات الجبلية.',
  'لبنان': 'السوق اللبناني في مرحلة تعافٍ — بيروت والجبال، إقبال المغتربين، المشتري يقدّر الإطلالة والهوية المعمارية والاستقرار.',
  'تركيا': 'السوق التركي يجذب الخليجيين بقوة — إسطنبول وأنطاليا وطرابزون، الجنسية العقارية، المشتري يقدّر الجنسية التركية والإطلالة البحرية والعائد الإيجاري.',
  'الجزائر': 'السوق الجزائري يتركّز في الجزائر العاصمة ووهران — طلب محلي قوي على الإسكان، اهتمام بالمناطق الساحلية، المشتري يقدّر السعر المعقول والجودة والقرب من العمل.',
  'تونس': 'سوق تونس متنوع — تونس العاصمة وحمامات وسوسة، إقبال الأوروبيين، المشتري يقدّر الساحل والمعمار الأبيض والخدمات السياحية.',
  'ليبيا': 'السوق الليبي في طور التعافي — طرابلس وبنغازي، طلب على الإسكان العملي، المشتري يقدّر السعر والموقع الآمن.',
  'السودان': 'السوق السوداني متأثر بالظروف — الخرطوم وبورتسودان، طلب على الإسكان الأسري، المشتري يقدّر السعر والاستقرار.',
  'فلسطين': 'سوق فلسطين محدود ومتأثر — رام الله وغزة ونابلس، طلب محلي على الإسكان، المشتري يقدّر الثبات والعائلة.',
  'اليمن': 'السوق اليمني محدود — صنعاء وعدن، طلب أسري على الإسكان العملي، المشتري يقدّر السعر المعقول والقرب من العائلة.',
  'سوريا': 'السوق السوري في طور التعافي — دمشق وحلب، طلب على الإعمار، المشتري يقدّر الجودة والموقع الآمن.',
  'موريتانيا': 'سوق ناشئ — نواكشوط، طلب محلي على الإسكان، المشتري يقدّر السعر والجودة الأساسية.',
  'الصومال': 'سوق محدود — مقديشو، طلب على الإسكان العملي، المشتري يقدّر السعر والموقع.',
  'جيبوتي': 'سوق محدود — جيبوتي العاصمة، طلب على الإسكان العملي، المشتري يقدّر الموقع وقرب الموانئ.',
};

export const COUNTRY_MARKET_CONTEXT_FALLBACK = 'استخدم معلومات السوق العقاري المحلية المعروفة عن هذا البلد لإضفاء المصداقية على المحتوى.';

/* ─── Audience targeting (auto-inferred from property type) ───
 * For each property type, we have a primary audience. The assistant should
 * weave in psychological triggers for BOTH the primary audience AND a
 * secondary one, so the copy persuades multiple buyer profiles at once. */
export type TargetAudience = 'investor' | 'family' | 'first_time_buyer' | 'luxury_seeker' | 'business_owner';

export interface AudienceProfile {
  name: string;          // الاسم العربي
  concerns: string;      // what they care about
  triggers: string;      // psychological triggers that work
  tone: string;          // tone hint
}

export const AUDIENCE_PROFILES: Record<TargetAudience, AudienceProfile> = {
  investor: {
    name: 'المستثمر',
    concerns: 'العائد على الاستثمار، السيولة السريعة، إمكانية التأجير، النمو الرأسمالي، المخاطر',
    triggers: 'أرقام العائد المتوقعة (8-12%)، الإحصائيات، مقارنة الفرص، الإشارة لخطط التنمية القادمة',
    tone: 'مهني تحليلي مع لمسة طمأنة',
  },
  family: {
    name: 'العائلة',
    concerns: 'المدارس القريبة، الأمان، المساحة للأطفال، الحدائق، المرافق العائلية، الجيران',
    triggers: 'صورة الحياة العائلية، راحة الأطفال، الاستقرار، مشاهد يومية دافئة',
    tone: 'دافئ عاطفي يحاكي شعور الأم والأب',
  },
  first_time_buyer: {
    name: 'المشتري لأول مرة',
    concerns: 'السعر المعقول، التمويل الميسّر، الموقع العملي، المساحة الكافية، الثقة في البائع',
    triggers: 'تسهيلات التمويل، الدفعات الميسّرة، الدعم الحكومي، خطوات الشرى البسيطة',
    tone: 'مُطمئن ودود يبني الثقة',
  },
  luxury_seeker: {
    name: 'الباحث عن الفخامة',
    concerns: 'التميّز، الندرة، الإطلالة، التشطيب الراقي، الخدمات الفندقية، الجيران من نفس المستوى',
    triggers: 'الحصرية، النُدرة، "للمتميّزين فقط"، التفاصيل الفاخرة، الإطلالة الخلابة',
    tone: 'راقٍ هادئ يبتعد عن الضغط',
  },
  business_owner: {
    name: 'صاحب الأعمال',
    concerns: 'الموقع التجاري، الإطلالة، المساحة للموظفين، قرب العملاء، إمكانية التوسّع',
    triggers: 'الإنتاجية، صورة الشركة، راحة الموظفين، قرب العملاء والشركاء',
    tone: 'مباشر يركّز على القيمة العملية',
  },
};

/* Map: property type → primary audience (used by the prompt) */
export const PROPERTY_AUDIENCE_MAP: Record<string, TargetAudience> = {
  'شقة': 'family',
  'فيلا': 'family',
  'دوبلكس': 'family',
  'بنتهاوس': 'luxury_seeker',
  'أرض': 'investor',
  'مكتب تجاري': 'business_owner',
  'محل تجاري': 'business_owner',
  'عمارة سكنية': 'investor',
  'استوديو': 'first_time_buyer',
  'شاليه': 'luxury_seeker',
};

/* ─── Country dialect map ─── */

export const COUNTRY_DIALECT_FALLBACK = 'استخدم لغة عربية فصحى مبسطة';

export const COUNTRY_DIALECT: Record<string, string> = {
  'السعودية': `السعودي (منصة: بيوت.كوم، عقار، Aqar.fm) — السوق السعودي يدمج الفصحى مع اللهجة النجدية/الحجازية. الإعلانات الاحترافية تستخدم لغة واقعية مباشرة ("نستعرض لكم اليوم هذي الفيلا"، "ببناء شخصي"، "على واجهتين") مع لمسة عاطفية خفيفة.

═══ صيغ افتتاحية شائعة (اختر بتنوع، لا تكرر نفس الصيغة) ═══
- "للجدّين فقط — [نوع العقار] للبيع في [الحي]"
- "فرصة لا تتكرر في [المدينة] — [نوع العقار] بسعر مغري"
- "نستعرض لكم اليوم [نوع العقار] في [الحي]"
- "بأقل من سعر السوق — [نوع العقار] للبيع"
- "مطلوب عاجلاً — [نوع العقار] في [المنطقة]"
- "من المالك مباشرة — [نوع العقار] بدون عمولة"
- "للبيع [نوع العقار] ببناء شخصي على واجهتين"
- "صك إلكتروني — [نوع العقار] جاهز للتسجيل"

═══ مفردات عقارية سعودية أصيلة ═══
- نوع العقار: فيلا، شقة سكني، أرض سكنية، عمارة، دور، بنتهاوس، دوبلكس
- الموقع: حي، مخطط، طريق الملك، كورنيش، واجهة
- التشطيب: ببناء شخصي، تشطيب فاخر، تشطيب سوبر لوكس، على واجهتين، ناصية
- القانوني: صك إلكتروني، رهن، تسجيل، شهادة عدم محاضرة
- السعر: ريال سعودي، "بسعر مغري"، "قابل للتفاوض"، "أقل من سعر السوق"
- الجمهور: العائلة، المستثمر، صاحب القرار

═══ عبارات دارجة سعودية حقيقية من إعلانات ═══
- "نستعرض لكم اليوم هذي الفيلا السكنية"
- "ببناء شخصي ومبنية على أرض مساحتها"
- "على واجهتين شمالي شارع عشرة متر وغربي شارع عشرين متر"
- "هذي فرصة والله ما تتكرر"
- "تخيّل تعيش في أرقى حي وأنت مُرتاح بالك"
- "إن شاء الله تعجبك"

═══ صيغ ختامية (CTA) ═══
- "للجادين فقط، تواصل عبر الواتساب"
- "للمعاينة والتفاصيل، اتصل على..."
- "فرصة لا تتكرر، سارع بالتواصل"
- "للتفاوض الجاد فقط"

═══ ميزات مميزة للسوق السعودي ═══
- الإشارة إلى "صك إلكتروني" أو "صك" (deed) مهمة جداً
- "ببناء شخصي" تعبير سعودي مميز
- "على واجهتين" / "ناصية" لتمييز الفلل المميزة
- "حي" وليس "منطقة" أو "حي سكني"

═══ قواعد اللهجة السعودية ═══
- استخدم: هذي (هذه)، اللي (الذي)، والله، إن شاء الله، يا سلااام، يا حبيبي، الحين، زين، تِشرفنا، يا هلابك، ما شاء الله
- "وش" للسؤال (وش تسوّي؟ وش الموقع؟)
- دمج الفصحى مع اللهجة: المواصفات بالفصحى، الافتتاحية والخاتمة باللهجة
- 50-60٪ من النص باللهجة، الباقي فصحى للمواصفات`,

  'الإمارات': `الإماراتي (منصة: Bayut، Property Finder، dubizzle) — سوق دبي وأبوظبي يدمج الفخامة مع التعدد اللغوي. الإعلانات تستخدم لغة راقية تميل للفصحى المهنية مع مفردات إنجليزية متخصصة (freehold, penthouse, marina, downtown) ولمسة لهجة خفيفة.

═══ صيغ افتتاحية شائعة ═══
- "بنتهاوس للبيع في [المنطقة] — إطلالة بانورامية"
- "تملك حر في [المنطقة] — [نوع العقار] فاخر"
- "فرصة استثمارية في قلب [دبي/أبوظبي]"
- "فيلا فاخرة في [المنطقة] — جاهزة للسكن"
- "استثمر في [المنطقة] — عائد إيجار مضمون"
- "شقة في [البرج] — إطلالة على [البحر/المارينا]"
- "للمتميزين فقط — [نوع العقار] في [المنطقة]"

═══ مفردات عقارية إماراتية ═══
- نوع العقار: فيلا، بنتهاوس، شقة، برج، استوديو، تاون هاوس
- الموقع: مرسى، مارينا، وسط المدينة، نخلة، جميرا، داون تاون، كورنيش
- الإطلالة: إطلالة بانورامية، مطل على البحر، فيو مفتوح، لا يحجب
- القانوني: تملك حر (freehold)، عقد ملكية، إيصال دفعة
- التشطيب: مفروشة، بدون أثاث، تشطيب فاخر، هوم سمارت
- الاستثمار: عائد إيجار، ROI، تأجير قصير/طويل

═══ عبارات حقيقية من إعلانات إماراتية ═══
- "البنتهاوس يجمع بين مميزات البرج والفيلا"
- "إطلالة بانورامية من الأعلى، أمان البرج ومرافقه"
- "الأسعار تبدأ من 2 مليون درهم"
- "تملك حر في نخلة جميرا"
- "مطل لا يحجب على المارينا"

═══ صيغ ختامية ═══
- "للمعاينة والحجز، تواصل مع الوكيل"
- "للتفاصيل والاستفسار، يرجى التواصل"
- "فرصة لا تفوّت — سارع بالحجز"
- "للجادين، تواصل عبر الهاتف أو الواتساب"

═══ ميزات مميزة للسوق الإماراتي ═══
- "تملك حر" (freehold) — كلمة مفتاحية مهمة للمشتري
- "إطلالة" / "فيو" / "مطل" — عامل بيع أساسي
- الأسعار عادة بالملايين (درهم)
- دمج إنجليزي-عربي طبيعي (penthouse, marina, ROI)

═══ قواعد اللهجة الإماراتية ═══
- استخدم: خوش، يعلّم، عساك، فله (تعني فيلا)، نظيف/نظيفة (رائع)، مزين، الحين، طوار، ما شاء الله عليه، ياعلّم
- "خوش موقع" = موقع رائع جداً
- "فله" = فيلا (بلهجة الإمارات)
- اللهجة خفيفة لأن السوق يخاطب مستثمرين دوليين`,

  'قطر': `القطري (منصة: Property Finder Qatar، سمسار قطر، مزاد قطر) — سوق قطري يجمع بين الفخامة في لوسيل والعرضين، واللهجة القطرية الدافئة. الإعلانات تذكر "البوند" (صك الأرض) و"مربع ط" (تصنيف المخطط).

═══ صيغ افتتاحية شائعة ═══
- "فلة فاخرة للبيع في [لوسيل/الخيسة]"
- "للجدّين — فيلا في [المنطقة] بمربّع ط"
- "موجودة حصرياً على عقارات قطر — [نوع العقار]"
- "فرصة في [المنطقة] — خطة دفع مرنة"
- "دفعة أولى 5٪ فقط — [نوع العقار] في [لوسيل]"
- "بيت على كيفك في [المنطقة]"
- "ما شاء الله، فلة مودرن في [المنطقة]"

═══ مفردات عقارية قطرية ═══
- نوع العقار: فلة (فيلا)، بيت، شقة، بنتهاوس، استوديو، فيلا
- الموقع: لوسيل، الخيسة، الدحيل، الواحة، مربّع ط (تصنيف المخطط)
- البناء: دورين (طابقين)، صحنوت (فناء صغير)، أرضي+1، أرضي+2
- القانوني: البوند (صك الأرض)، عقد ملكية، تسجيل
- السعر: ريال قطري (ر.ق)، "تبدأ من"، "دفعة أولى"، "خطة دفع مرنة"
- المميزات: مجلس، صالة، مطبخ، دورات مياه

═══ عبارات حقيقية من إعلانات قطرية ═══
- "تعي يا ابو جاسم نحكي عن الفيلا موجودة حصرياً"
- "فلة للبيع مودرن دورين صحنوت الشمالية مربع ط"
- "تتكون من: 4 غرف نوم 6 دورات مياة مطبخ وصالة ومجلس"
- "خطة دفع مرنة لمدة 7 سنوات، دفعة أولى تبدأ من 5٪ فقط"
- "الفلل حصرية في الخيسة بمخطط 6 سنوات"

═══ صيغ ختامية ═══
- "عساك ما تفوتها، تواصل الحين"
- "للمعاينة، اتصل على..."
- "فرصة شقاوة، لا تفوّتها"
- "للجادين فقط، تواصل عبر الواتساب"

═══ ميزات مميزة للسوق القطري ═══
- "فلة" (وليس "فيلا") — الكلمة القطرية الأصيلة
- "صحنوت" — فناء صغير قطرية
- "مربّع ط" — تصنيف المخطط (plot type)
- "البوند" — صك الأرض
- "مجلس" — غرفة استقبال الرجال (تميّز قطري/خليجي)

═══ قواعد اللهجة القطرية ═══
- استخدم: شِلونك، شقاوة، عساك، والله، ما شاء الله، على كيفك، بيّه، يعلّم
- "فلة" بدل "فيلا"
- اللهجة قطرية دافئة مع لمسة خليجية`,

  'الكويت': `الكويتي (منصة: 4sale، بيوت الكويت) — السوق الكويتي يهتم جداً بـ"القطعة" (رقم القطعة) و"PA" (الوكالة) و"التشطيب سوبر ديلوكس". الإعلانات تذكر تفاصيل البناء بدقة (درجين، مصعد، سرداب، زاوية).

═══ صيغ افتتاحية شائعة ═══
- "للبيع بيت في [المنطقة] مساحة [X] متر"
- "للبيع فيلا راقية في [المنطقة] ق [رقم]"
- "للجدّين — بيت في [المنطقة] تشطيب سوبر ديلوكس"
- "فرصة في [المنطقة] — زاويه 3 أدوار ونص"
- "بنيان جديد في [المنطقة] — تشطيب نظيف جداً"
- "من المالك مباشرة — [نوع العقار] في [المنطقة]"

═══ مفردات عقارية كويتية ═══
- نوع العقار: بيت (يشمل الفيلا)، فيلا، شقة، دوبلكس، بنتهاوس
- الموقع: قطعة (رقم القطعة)، ق 4، زاوية (corner)، حي، ضاحية
- البناء: بنيان (مبنى)، درجين (درجين)، مصعد، سرداب (قبو)، 3 ادوار ونص
- التشطيب: تشطيب سوبر ديلوكس، تشطيب نظيف جداً، تحت التشطيب
- القانوني: PA (الوكالة — power of attorney)، صك، إفراغ
- السعر: دينار كويتي، "بسعر مغري"، "قابل للتفاوض"

═══ عبارات حقيقية من إعلانات كويتية ═══
- "للبيع بيت جديدفي كيفان المساحة 250 متر الموقع شارع واحد تشطيب سوبر ديولكس"
- "للبيع فيلا راقيه بالمسايل ق 4 تشطيب سوبر ديلوكس المساحة 375"
- "للبيع فيلا في جنوب عبدالله المبارك 400 متر زاويه 3 ادوار و نص بنيان جديد تشطيب نظيف جدا فيه درجين و مصعد"
- "الارضي و الاول مفتوحين علي بعض و الدور الثاني مع..."

═══ صيغ ختامية ═══
- "عساك ما تندم، تواصل الحين"
- "للجدّين، اتصل على..."
- "حياك للمعاينة"
- "فرصة ما تتعوض، سارع"

═══ ميزات مميزة للسوق الكويتي ═══
- "بيت" = اللفظ العام لأي منزل مستقل
- "قطعة" أو "ق 4" (رقم القطعة) — مهم جداً في الكويت
- "PA" (الوكالة) — لإثبات right to sell
- "سرداب" (قبو)، "درجين"، "بنيان" — مفردات كويتية خالصة
- "زاويه" = قطعة زاوية (corner) — تزيد القيمة

═══ قواعد اللهجة الكويتية ═══
- استخدم: حياك، زين، حلو، والله، يا سلام، عساك، تفضّل
- "بيت" بدل "فيلا" للمنازل المستقلة
- دمج فصحى (للمواصفات) + كويتية (للجذب والختام)`,

  'البحرين': `البحريني (منصة: Bahrain Property، expatriates.com) — سوق بحريني يجمع بين الأسلوب الخليجي والقيمة التنافسية. الإعلانات تركز على "تملك حر" للمستثمرين الخليجيين والقيمة مقابل السعر.

═══ صيغ افتتاحية شائعة ═══
- "للجدّين — [نوع العقار] في [المنطقة]"
- "فرصة استثمارية في [المنطقة]"
- "تملك حر في [المنطقة] — [نوع العقار]"
- "من المالك مباشرة — [نوع العقار]"
- "بسعر مغري — [نوع العقار] في [المنطقة]"

═══ مفردات عقارية بحرينية ═══
- نوع العقار: بيت، فيلا، شقة، استوديو، بنتهاوس
- الموقع: المنامة، الرفاع، سار، البديع، الجفير
- القانوني: تملك حر، صك، سند ملكية
- التشطيب: تشطيب فاخر، جاهز للسكن
- السعر: دينار بحريني، "تبدأ من"

═══ عبارات شائعة ═══
- "فرصة والله ما تتكرر"
- "في أحسن موقع"
- "عساك تاخذها الحين"

═══ صيغ ختامية ═══
- "حياك للمعاينة، تواصل الحين"
- "عساك ما تندم"
- "للجدّين فقط"

═══ قواعد اللهجة البحرينية ═══
- استخدم: شِلونك، عساك، حياك، والله، يا حبيبي
- لهجة خليجية قريبة من القطرية والكويتية`,

  'عُمان': `العُماني (منصة: JustProperty، Oman Property) — سوق عماني هادئ يركز على السكن العائلي والسياحي الساحلي. اللهجة العمانية رسمية أكثر من بقية الخليج بسبب التأثير الإباضي.

═══ صيغ افتتاحية شائعة ═══
- "إن شاء الله يعجبك — [نوع العقار] في [المنطقة]"
- "بيت في أحسن موقع في [مسقط/صلالة]"
- "فرصة في [المنطقة] — [نوع العقار]"
- "من المالك مباشرة — [نوع العقار]"

═══ مفردات عقارية عُمانية ═══
- نوع العقار: بيت، فيلا، شقة، استوديو، فلل
- الموقع: مسقط، صلالة، صحار، القرم، الخوض
- القانوني: سند ملكية، صك، حوض (plot)
- التشطيب: تشطيب فاخر، جاهز للسكن
- السعر: ريال عُماني، "قابل للتفاوض"

═══ عبارات شائعة ═══
- "إن شاء الله يعجبك"
- "ما شاء الله عليه"
- "كيفك لو تسكن هنا؟"
- "والله راحة بال"

═══ صيغ ختامية ═══
- "إن شاء الله تناسبك، تواصل"
- "للمعاينة، اتصل على..."
- "فرصة لا تفوّت"

═══ قواعد اللهجة العُمانية ═══
- استخدم: إن شاء الله، ما شاء الله، كيفك، والله، عساك
- لهجة رسمية أكثر من الخليج`,

  'مصر': `المصري (منصة: Property Finder Egypt، Aqarmap، OLX Egypt، شوف عقار) — السوق المصري الأكبر عربياً، يركز على "الكمبوند" و"استلام فوري" و"التقسيط". الإعلانات تدمج الفصحى مع اللهجة المصرية الحيوية.

═══ صيغ افتتاحية شائعة ═══
- "شقة للبيع بكمبوند [الاسم] — استلام فوري"
- "استلم فوراً شقة [X] نوم في [المنطقة]"
- "بمقدم [X] وتقسيط على [Y] سنة"
- "فرصة استثمارية في [العاصمة الإدارية/أكتوبر/التجمع]"
- "تشطيب سوبر لوكس — [نوع العقار] في [المنطقة]"
- "من المالك مباشرة — بدون عمولة"
- "أحلى فرصة في [المنطقة] — مت кош"

═══ مفردات عقارية مصرية ═══
- نوع العقار: شقة، فيلا، تاون هاوس، دوبلكس، بنتهاوس، استوديو، روف
- الموقع: كمبوند، العاصمة الإدارية، 6 أكتوبر، التجمع، الشيخ زايد، رمسيس، المعادي
- التشطيب: تشطيب سوبر لوكس، تشطيب فندقي، نص تشطيب، عظم
- التسليم: استلام فوري، تسليم [سنة]، تسليم متأخر
- السعر/التمويل: مقدم، تقسيط، توتال (total)، مدفوع (paid)، باقي
- المميزات: نوم (غرفة نوم)، فيو جاردن (garden view)، فيو بحر، فيو مسبح، حديقة، تراس

═══ عبارات حقيقية من إعلانات مصرية ═══
- "شقة للبيع بكمبوند المقصد العاصمة الادارية R3 134 متر استلام فورى تشطيب سوبر لوكس ٣ نوم و ٢ حمام دور رابع فيو جاردن"
- "شقة 138 متر (3 غرف _ 3 حمام) بمقدم 1.259.000الف وتقسيط على 12 سنه"
- "أستلم فورا شقه 2نوم في R7 بالعاصمه بأقساط علي10س"
- "الصيانه مدفوعه توتال 3.700.000 مدفوع 1.259.000"

═══ صيغ ختامية ═══
- "للجادين بس، اتصل يا باشا"
- "فرصة مش هتتكرر، تواصل بسرعة"
- "للمعاينة والاستفسار، كلم الحين"
- "ماتخسرش الفرصة دي"

═══ ميزات مميزة للسوق المصري ═══
- "كمبوند" (compound/gated community) — كلمة مفتاحية
- "استلام فوري" + "تشطيب سوبر لوكس" — ثنائي أساسي
- "مقدم + تقسيط" — نمط التسعير الأساسي
- "توتال" (total) + "مدفوع" (paid) + "باقي" — نظام الدفع
- "نوم" (بدل غرفة نوم)، "فيو" (view)
- "عظم" (without finishing) vs "تشطيب"

═══ قواعد اللهجة المصرية ═══
- استخدم: يا باشا، والنبي، بجد، حاجة، عظيمة، ماتخسرش، يا سيدي، مش، ده، إيه، كده، خلاص، طيب، يا جدعان
- "مش" بدل "ليس"
- "ده" بدل "هذا"
- دمج فصحى (للمواصفات) + مصرية (للجذب والختام)`,

  'الأردن': `الأردني (منصة: OpenSooq، Mstakwi) — السوق الأردني يستخدم "شقه" (بهاء لا تاء مربوطة) و"تشطيب فندقي" و"تدفئة غاز راكبة". اللهجة الأردنية قريبة من الشام لكن مميزة.

═══ صيغ افتتاحية شائعة ═══
- "للبيع شقه في [المنطقة] — مساحة [X] متر"
- "شقه أرضية للبيع في [المنطقة] قرب [معلم]"
- "من المالك مباشرة — شقه في [عمان]"
- "شقق بالتقسيط أو كاش في [المنطقة]"
- "فرصة في [المنطقة] — شقه بتشطيب فندقي"
- "شقه طابق [X] بتصميم عصري ساحر"

═══ مفردات عقارية أردنية ═══
- نوع العقار: شقه (بهاء)، فيلا، أرض، عمارة، روف
- الموقع: عمان، خلدا، جبل الحسين، شفا بدران، عبدون، دابوق
- الطوابق: طابق اول، طابق ثاني، أرضية (ground floor)
- التشطيب: تشطيب فندقي، تشطيب سوبر لوكس، تشطيب ممتاز
- المميزات: تدفئة غاز راكبة، بلكونة، بلكونتين، شفا (قرب)
- السعر: دينار أردني، "بالتقسيط أو كاش"، "قابل للتفاوض"

═══ عبارات حقيقية من إعلانات أردنية ═══
- "للبيع شقه اقساط 195متر طابق اول شفا بدران ام حجير بتشطيب فندقي تدفئة غاز راكبة بلكونتين لكل شقة"
- "شقة طابق ثاني بتصميم عصري ساحر"
- "شقة ارضية للبيع في خلدا قرب مدارس ساندس 235 متر 4 نوم و حديقة 300 متر"

═══ صيغ ختامية ═══
- "للجادين، تواصل معنا"
- "فرصة ما بتتكرر، اتصل هاد"
- "أكيد بتعجبك، تعال شوفها"
- "والله تستاهل، تواصل"

═══ ميزات مميزة للسوق الأردني ═══
- "شقه" (بهاء) — ليست "شقة" (تاء مربوطة) — تميّز أردني/شامي
- "تشطيب فندقي" — مستوى تشطيب راقٍ
- "تدفئة غاز راكبة" — ميزة شتوية مهمة في الأردن
- "بلكونة" + "بلكونتين" (مثنى)
- "شفا" (قرب) — "شفا بدران" = قرب بدران

═══ قواعد اللهجة الأردنية ═══
- استخدم: كيفك، هاد، هادي، أكيد، والله، ممتاز، يلا، كتير، هيك
- "هاد" (هذا)، "هادي" (هذه)، "هيك" (هكذا)
- "أكيد" (بالتأكيد) — بكثرة`,

  'العراق': `العراقي (منصة: عقارات العراق، السوق المفتوح العراق، Facebook groups) — السوق العراقي يركز على "سند طابو" و"فلكة" و"استقبال". اللهجة العراقية مميزة جداً بقواعدها.

═══ صيغ افتتاحية شائعة ═══
- "بيت للبيع في [بغداد/أربيل] — مساحة [X] متر"
- "سند طابو يتسجل بإسم أي عراقي — [نوع العقار]"
- "للبيع بيت في [المنطقة] — طابقين مربع"
- "شقه دوبلكس في قلب [أربيل] — برفاهية مطلقة"
- "السعر عند الاتصال — [نوع العقار] في [المنطقة]"

═══ مفردات عقارية عراقية ═══
- نوع العقار: بيت، شقه (بهاء)، دوبلكس، عمارة، أرض، صافة (سطح)
- الموقع: بغداد (الرصافة/الكاظمية/الجادرية)، أربيل، البصرة، السليمانية
- البناء: طابقين مربع، طابق وملحق، استقبال (غرفة استقبال)
- القانوني: سند طابو (title deed)، حصة، تسجيل، إفراغ
- الموقع (تفاصيل): فلكة (دوار/تقاطع)، شارع [اسم/رقم]
- السعر: دينار عراقي، دولار أمريكي (شائع)، "السعر عند الاتصال"

═══ عبارات حقيقية من إعلانات عراقية ═══
- "بيت 200متر طابق واحد للبيع (اقساط + نقد) في لانة ستي في اربيل"
- "سند طابو يتسجل بإسم اي عراقي أربيل-بيت للبيع 5حساروك قرب شارع120M"
- "منزل للبيع في بغداد الرصافة الشعب فلكة صباح الخياط قرب صلاح ابو الكبة السعر عند الاتصال"
- "شقه دوبلكس في قلب اربيل . برفاهيه مطلقه و بمقدمة 20‎%‎"

═══ صيغ ختامية ═══
- "عاشت أيدك، تواصل بالتفاصيل"
- "للاستفسار، اتصل على..."
- "فرصة زينه، ما تتعوض"
- "والله زينه، سارع"

═══ ميزات مميزة للسوق العراقي ═══
- "سند طابو" — الوثيقة القانونية العراقية
- "فلكة" — دوار/تقاطع ( Iraqi distinctive)
- "استقبال" — غرفة استقبال الرجال
- "صافة" — السطح (Iraqi pronunciation)
- "مقدمة" — الدفعة الأولى (down payment)
- "السعر عند الاتصال" — شائع في العراق
- "طابقين مربع" — وصف بناء عراقي مميز

═══ قواعد اللهجة العراقية ═══
- استخدم: هاي، شلونك، زين/زينه، عاشت أيدك، حبيبي، والله، يمعود، خوش
- "هاي" (هذه)، "ذاي" (ذلك)
- "عاشت أيدك" — تعبير شكر عراقي مميز
- "خوش" — جيد/رائع
- اللهجة العراقية لها قواعد صرف مميزة (الياء المكسورة، التاء المربوطة بهاء)`,

  'المغرب': `المغربي — اكتب بهالأسلوب: "واش كدير! فرصة بزاف مزيانة! هاد البيت حيت ما تلقاهش بزاف، دابا تواصل!" — استخدم: واش، بزاف، مزيان/مزيانة، حيت، دابا، كدير، هاد`,

  'لبنان': `اللبناني (منصة: OLX Lebanon، Mourjan، Vivadoo، Property Finder Lebanon) — السوق اللبناني يهتم جداً بـ"المطل" (الإطلالة) و"سند أخضر" (الوثيقة القانونية). الإعلانات تدمج الفصحى مع اللهجة اللبنانية الراقية.

═══ صيغ افتتاحية شائعة ═══
- "شقة للبيع في [المنطقة] — مطل لا يحجب"
- "إطلالة على البحر — شقة في [المنطقة]"
- "شقة فخمة جداً للبيع في [المنطقة]"
- "بسعر مغري — شقة في [بيروت/جونية]"
- "سند أخضر — شقة للبيع في [المنطقة]"
- "فرصة استثمارية في [المنطقة]"

═══ مفردات عقارية لبنانية ═══
- نوع العقار: شقة، فيلا، بنتهاوس، دوبلكس، استوديو، روف
- الموقع: بيروت، الأشرفية، جونية، بشامون، قصقص، بعبدا، جبيل
- الإطلالة: مطل (view)، مطل لا يحجب، إطلالة بانورامية، مطل على البحر، مطل على الجبل
- القانوني: سند أخضر (green deed)، سند، تسجيل
- التشطيب: تشطيب فاخر، تشطيب سوبر لوكس، بناء جديد
- المميزات: صالون سفرا (dining salon)، بلاكين (شرفات — جمع بلكونة)، ماستر (master bedroom)، بير ماء ارتوازي، مصعد دوله
- السعر: دولار أمريكي (شائع جداً)، ليرة لبنانية

═══ عبارات حقيقية من إعلانات لبنانية ═══
- "شقة للبيع في بشامون كريدلي طابق ٣ مساحة 150 متر ✔️ مطل لا يحجب بحر ومطار بيروت جبل ٣ نوم (١ماستر) ٢حمام ‼️ صالون وسفرة مطبخ ٤ بلاكين"
- "شقة 185م فخمة جدا للبيع في قصقص مع اطلالة رائعة على الجبل وحديقة السبق في بناء جديد وفخم 3 نوم صالون سفرا بسعر مغري 330000 دولار"
- "شقه للبيع بدوحة الحص اطلاله على البحر لا تحجب - على الشارع العام - بناء ممتاز - مصعد دوله - بير ماء ارتوازي موقف سياره - سند أخضر"

═══ صيغ ختامية ═══
- "فرصة كتير ممتازة، تواصل هيدا"
- "شو رأيك تعال شوف؟"
- "بسعر مغري، سارع"
- "للمعاينة، اتصل على..."

═══ ميزات مميزة للسوق اللبناني ═══
- "مطل" (view) — أهم عنصر بيع في لبنان
- "مطل لا يحجب" — مطلوب جداً
- "سند أخضر" — الوثيقة القانونية المميزة
- "بلاكين" (جمع بلكونة — لبنانية)
- "صالون سفرا" (dining salon) — تميّز لبناني
- "بير ماء ارتوازي" — ميزة قديمة لكن ما زالت تُذكر
- "ماستر" (master bedroom)
- الأسعار عادة بالدولار

═══ قواعد اللهجة اللبنانية ═══
- استخدم: يا أهلين، كتير، شو، هيدا، هيدي، والله، فخم، يلا، لهلقا، هلق
- "هيدا" (هذا)، "هيدي" (هذه)، "هلق" (الآن)
- "كتير" (جداً)
- دمج فصحى + لبنانية راقية`,

  'تركيا': `السوق التركي للمشتري العربي (منصة: Realty Turkey، emlakjet، Property Finder Turkey) — يستهدف المستثمرين الخليجيين والعرب. يدمج العربية الفصحى مع مفردات تركية شائعة ومصطلحات استثمارية.

═══ صيغ افتتاحية شائعة ═══
- "لاكشري في [إسطنبول/أنطاليا] — [نوع العقار] فاخر"
- "فرصة استثمارية في [المنطقة] — بروموميز ممتازة"
- "تملك في [إسطنبول] — [نوع العقار] بإطلالة بحرية"
- "استثمار آمن في [المنطقة] — عائد إيجار مضمون"
- "للمستثمر العربي — [نوع العقار] في [المنطقة]"

═══ مفردات عقارية تركية-عربية ═══
- نوع العقار: شقة، بنتهاوس، فيلا، استوديو، دوبلكس، برج
- الموقع: إسطنبول، أنطاليا، طرابزون، بشيكتاش، تكسيم، مارماريس
- الاستثمار: بروموميز (promesse)، لاكشري (luxury)، عائد إيجار
- القانوني: طابو (tapu — title deed)، إكساء (finishing)
- التشطيب: إكساء فاخر، تشطيب سوبر لوكس، مفروشة
- السعر: ليرة تركية، دولار أمريكي (شائع للعقارات الفاخرة)

═══ عبارات شائعة ═══
- "لاكشري وفخامة ممتازة"
- "بروموميز مرنة"
- "طابو تركي رسمي"
- "إكساء سوبر لوكس"

═══ صيغ ختامية ═══
- "للاستفسار، تواصل معنا"
- "فرصة استثمارية لا تفوّت"
- "للمعاينة، اتصل على..."

══️ ميزات مميزة ═══
- "طابو" (tapu) — الوثيقة التركية
- "إكساء" (إنهاء/تشطيب)
- "بروموميس" (promesse de vente)
- الجنسية التركية كحافز للمستثمرين

═══ قواعد الكتابة ═══
- فصحى مهنية مع دمج مصطلحات تركية-عربية
- لا تخلط مع لهجة عربية محلية (تركيا ليست دولة عربية)`,

  'الجزائر': `الجزائري (منصة: Ouedkniss، Eddaes) — السوق الجزائري يدمج الدارجة مع مفردات فرنسية طبيعية (l'affaire, rater, place) ومصطلحات قانونية جزائرية (عقد ملكية + دفتر عقاري، F3/F4، R+1/R+2). اللهجة متغيرة حسب الولاية (العاصمية، الوهرانية قريبة من المغربية، الشرقية قريبة من التونسية) لكن الإعلانات تستخدم دارجة وسطية مفهومة لكل الجزائريين.

═══ صيغ افتتاحية شائعة في إعلانات العقار الجزائرية (اختر بتنوع) ═══
- "جبنا لكم [نوع العقار] للبيع بكامل الوثائق في ولاية [الولاية] بلدية [البلدية]"
- "للبيع [نوع العقار] في [المنطقة] — بعقد ملكية ودفتر عقاري"
- "كاش فرصة في [المنطقة] — [نوع العقار] مخدوم"
- "من المالك مباشرة — [نوع العقار] في [المنطقة]"
- "للجدّين فقط — [نوع العقار] بثمن معقول"
- "مكانش فرصه خير منها — [نوع العقار] في [المنطقة]"
- "فرصة في [المنطقة] — [نوع العقار] تسكنه من نهارك"

═══ مفردات عقارية جزائرية أصيلة (من إعلانات ouedkniss الحقيقية) ═══
- نوع العقار: شقة، فيلا، بيت، أرض، محل، إقامة (مجمع سكني)، ترقية عقارية (تطوير عقاري)
- الموقع: ولاية (المنطقة الكبرى)، بلدية (المدينة/الحي)، حي، العاصمة (الجزائر العاصمة)
- التشطيب: مخدوم (مشطّب/جاهز)، تسكنه من نهارك (جاهز فوراً)
- القانوني: بكامل الوثائق / بجميع الوثائق، عقد ملكية + دفتر عقاري، تسجيل
- الطوابق: R+1 / R+2 / R+3 (طابق أرضي + 1/2/3)
- الغرف: F3 / F4 / F5 (شقة 3/4/5 غرف — نظام فرنسي)
- الإيجار: كراء (وليس إيجار)
- المميزات: بلاصه (مكان)، إقامة (residence)

═══ عبارات دارجة حقيقية من إعلانات جزائرية ═══
- "جبنا لكم فيلا للبيع بكامل الوثائق. عقد الملكية والدفتر العقاري"
- "مخدومة تسكنها منهار. في بلاصة استراتيجية"
- "فيلا للبيع R+2 متكونة من 4 شقق بجميع الوثائق في ولاية الجزائر العاصمة"
- "كراء شقة 3 غرف الجزائر برج الكيفان: 5 مليون"
- "بيع شقة F4 الجزائر المحمدية"

═══ صيغ ختامية جزائرية شائعة ═══
- "مت راطيش هذه لافار مش كل يوم، تواصل معانا في اقرب وقت"
- "تواصل معانا قبل ما تتباع"
- "للجدّين، اتصل في الحين"
- "مت راطيش الفرصة، راسلنا الحين"
- "علاش تتركني؟ تواصل معانا"

═══ ميزات مميزة للسوق الجزائري ═══
- "كراء" (وليس "إيجار") — تميّز جزائري
- "بكامل الوثائق / بجميع الوثائق" — طمأنة قانونية
- "عقد ملكية + دفتر عقاري" — الوثيقتان القانونيتان
- "ترقية عقارية" — شركة تطوير عقاري
- "إقامة" — مجمع سكني (residence)
- F3/F4/F5 — نظام تسمية الغرف (فرنسي)
- R+1/R+2/R+3 — نظام الطوابق (فرنسي)
- "مخدوم" — تشطيب جاهز
- "تسكنه من نهارك" — جاهز فوراً
- دمج طبيعي مع الفرنسية (راطيش، لافار، بلاصه، F3/F4، R+1)
- الأسعار: دج (دينار جزائري)، مليون، مليار

═══ قواعد اللهجة الجزائرية (إلزامية) ═══
- بادئة المضارع = "ن" فقط (ندير، نروح، نقول) — ❌ ممنوع "كن" المغربية
- النفي: "ما ... ش" (ما نديرش)، "مش" (مش كل يوم)، "مكانش" (لا يوجد)
- الضمائر: راني (أنا)، راك (أنتَ)، راهو (هو)، حنا (نحن)، هوما (هم)، خويا (أخي)
- "الآن" = من نهارك / منهار / في الحين — ❌ ممنوع "دابا" المغربية
- "جيد" = مليح / زين / نيس — ❌ ممنوع "مزيان" المغربية
- "حسناً" = باهي / معليه — ❌ ممنوع "واخا" أو "صافي" المغربية
- "كثيراً/جداً" = ياسر / بزاف
- "شكراً" = صحّا / يعطيك الصحة / بارك الله فيك — ❌ ممنوع "تبارك الله عليك" المغربية
- "لك" = ليك، "معنا" = معانا
- النطج الجزائري يُسقط حروف الفصحى: استراتيجية → استرايجيه، الجودة → الجوده
- دمج مفردات فرنسية طبيعي: راطيش (rater)، لافار (l'affaire)، بلاصه (place)

══️ مفردات مغربية محظورة تماماً ═══
❌ دابا → منهار / من نهارك / في الحين
❌ مزيان/مزيانة → مليح / زين / نيس
❌ واخا → باهي / معليه
❌ صافي → باهي / خلاص
❌ كنبغي → نبغي
❌ كندير → ندير
❌ ماشي → مش / ماهوش
❌ أشنو → واش
❌ تبرك الله عليك → يعطيك الصحة / صحّا
❌ الله يخليك → بارك الله فيك

⚠️ تنوع الإعلانات الجزائرية: لا تستخدم نفس الافتتاحية دائماً — اختر من القائمة أعلاه بتنوع. الدارجة الجزائرية تتغير حسب الولاية لكن الإعلانات الرسمية تستخدم دارجة وسطية مفهومة لكل الجزائريين.`,

  'تونس': `التونسي (منصة: Tayara.tn، OpenSooq Tunisie، Green Acres، Mubawab) — السوق التونسي يستخدم نظام S+1 / S+2 (صالون + غرف نوم) بالفرنسية، ويذكر "د.ت" (دينار تونسي). اللهجة التونسية قريبة من الجزائرية الشرقية لكن لها بصماتها الخاصة.

═══ صيغ افتتاحية شائعة ═══
- "للبيع عقار في [المنطقة] — [نوع العقار]"
- "فرصة في [المنطقة] — S+[X] للبيع"
- "فيلا واسعة في [تونس العاصمة/سوسة/حمامات]"
- "من المالك مباشرة — [نوع العقار]"
- "Bien idéal pour habitation et investissement"
- "استثمار آمن في [المنطقة]"

═══ مفردات عقارية تونسية ═══
- نوع العقار: فيلا، شقة، منزل، عقار، أرض، محل
- نظام الغرف: S+1 / S+2 / S+3 / S+4 (صالون + غرف نوم — نظام فرنسي)
- الموقع: تونس العاصمة، أريانة، سوسة، حمامات، المنستير، صفاقس
- القانوني: سند ملكية، طابو، تسجيل
- المميزات: صالة (salon)، صالتين (salons)، شرفة، حديقة
- السعر: د.ت (دينار تونسي)، TND، "قابل للتفاوض"

═══ عبارات حقيقية من إعلانات تونسية ═══
- "فيلا واسعة تضم صالتين وأربع غرف نوم، بالإضافة إلى شقتين مستقلتين (S+1 وS+2)"
- "Bien idéal pour habitation et investissement"
- "بيع منزل. 3 غرف جميلة. شرفة جميلة وحديقة"
- "للبيع عقار بجعفر"

═══ صيغ ختامية ═══
- "كياس تواصل بالزربة"
- "للجادين، اتصل بسرعة"
- "فرصة برشا حلوة، تواصل"
- "للاستفسار، راسلنا"

═══ ميزات مميزة للسوق التونسي ═══
- نظام S+1 / S+2 (salon + chambres) — فرنسي الأصل
- "د.ت" / TND — الدينار التونسي
- "صالة" / "صالتين" — غرفة الاستقبال
- دمج فرنسي-عربي طبيعي (Bien idéal، S+2)
- الأسعار أحياناً TND/م²

═══ قواعد اللهجة التونسية ═══
- استخدم: برشا (كثيراً)، ياسر (جداً)، كياس (كيف حالك)، بالزربة (بسرعة)، بزاف، توا (الآن)، باش (لكي)، كانفسو (نفعل)، بش (أن)، علاش (لماذا)، قداش (كم)، فما (يوجد)
- "توا" (الآن) — تونسية/ليبية
- "برشا" (كثيراً) — تونسية خالصة
- "كياس" (كيف حالك) — تونسية خالصة
- "بالزربة" (بسرعة) — تونسية خالصة
- ❌ ممنوع دمج مغربية (دابا، مزيان، واخا)`,

  'ليبيا': `الليبي (منصة: OpenSooq Libya، بيت ليبا) — السوق الليبي يستخدم "المسقوف" (built-up area) و"مربوعة" (غرفة صغيرة) و"ملحق". الإعلانات تبدأ غالباً بـ"بسم الله".

═══ صيغ افتتاحية شائعة ═══
- "بسم الله الرزاق — [نوع العقار] للبيع في [طرابلس/بنغازي]"
- "للبيع شقة في [المنطقة] — تشطيب حديث"
- "منزل طابق وملحق للبيع في [المنطقة]"
- "شقة فاخرة بتشطيب جديد — غير مستخدمة"
- "من المالك مباشرة — [نوع العقار]"

═══ مفردات عقارية ليبية ═══
- نوع العقار: شقة، منزل، فيلا، أرض، عمارة
- البناء: المسقوف (built-up area)، مربوعة (غرفة صغيرة)، ملحق (annex)، طابق وملحق
- الموقع: طرابلس، بنغازي، مصراتة، الزاوية، جنزور
- التشطيب: تشطيب حديث، تشطيب ممتاز، غير مستخدمة (جديدة)
- المميزات: سباكة مدفوعة، تكييف مركزي، بلكونة، سقف جبس
- القانوني: سند ملكية، طابو
- السعر: د.ل (دينار ليبي)

═══ عبارات حقيقية من إعلانات ليبية ═══
- "بسم الله الرزاق شقة للبيع جزيرة راس حسن / الجرابة تشطيب حديث الدور الثالث إجمالي المسقوف 180 متر مربع تتـكون مـن : 3 غرف النوم حمامين صالة معيشه مطبخ خدمي"
- "إعلان شقة للبيع واجهتين شقة تشطيب ممتاز الدور الأرضى (2غرف بمساحة ممتازة حمام سباكة مدفونة / مطبخ كامل / مربوعة /بلكونة سقف جبس كامل مع أنارة)"
- "شقة فاخرة بتشطيب جديد غير مستخدمه تكييف مركزي وطابق الاول بعد ارضي"
- "منزل طابق وملحق للبيع في طرابلس، تشطيب حديث"

═══ صيغ ختامية ═══
- "للاستفسار ومعاينة المكان، اتصل على..."
- "فرصة ماشاء الله، سارع"
- "كيفك لو تسكن هنا؟"
- "والله راحة، تواصل"

═══ ميزات مميزة للسوق الليبي ═══
- "المسقوف" — built-up area (ليبية خالصة)
- "مربوعة" — غرفة صغيرة إضافية
- "ملحق" — ملحق المنزل
- "بسم الله" — افتتاحية دينية شائعة
- "سباكة مدفوعة" — plumbing embedded
- "تكييف مركزي" — ميزة مهمة في ليبيا

═══ قواعد اللهجة الليبية ═══
- استخدم: شِحال (كم)، كيفك، ماشاء الله، والله، توا (الآن)، هادي، علاش، كيما (مثل)
- "توا" (الآن) — ليبية/تونسية
- "شِحال" (كم) — ليبية مميزة
- "كيما" (مثل) — ليبية
- ❌ ممنوع دمج مغربية (دابا، مزيان، واخا)`,

  'السودان': `السوداني (منصة: عقارك، سوق السودان) — السوق السوداني يستخدم "مربّع" (block number) كنظام عنونة فريد. الإعلانات تستخدم فصحى مبسطة مع لمسة لهجة سودانية دافئة.

═══ صيغ افتتاحية شائعة ═══
- "للبيع فيلا في [الخرطوم] — مربّع [رقم]"
- "عرض جديد ومميز — [نوع العقار] في [المنطقة]"
- "فرصة في [الخرطوم/بحري/أمدرمان] — [نوع العقار]"
- "من المالك مباشرة — [نوع العقار]"
- "للمغتربين — [نوع العقار] في [المنطقة]"

═══ مفردات عقارية سودانية ═══
- نوع العقار: فيلا، بيت، شقة، عمارة، أرض، مزرعة
- الموقع: الخرطوم، بحري، أمدرمان، مربّع (block number)، مربع 7، مربع 80
- البناء: أرضي وأول وتاني، قابله لطابق أخر (extendable)، ملحق
- القانوني: سند ملكية، تسجيل، حصة
- المميزات: حديقة، ناصية (corner)
- السعر: دولار أمريكي (شائع)، جنيه سوداني

═══ عبارات حقيقية من إعلانات سودانية ═══
- "للبيع فيلا بالحلفايا مربع 7 أرضي وأول وتاني قابله لطابق أخر وملحق"
- "الميزة: ناصيـــة، المساحـــة: 400 متر"
- "فيلا فاخرة للبيع في الخرطوم مربع 80 بقيمة 800 ألف دولار"
- "عرض جديد ومميز"

═══ صيغ ختامية ═══
- "للجادين، تواصل"
- "إن شاء الله تعجبك، اتصل"
- "فرصة جد، ما تتفوّت"
- "للاستفسار، تواصل معنا"

═══ ميزات مميزة للسوق السوداني ═══
- "مربّع" (block) — نظام عنونة فريد سوداني
- "قابله لطابق أخر" — extendable
- "ناصية" — corner plot
- "ملحق" — annex
- الأسعار غالباً بالدولار

═══ قواعد اللهجة السودانية ═══
- استخدم: يا زول (يا أخ)، جد (جداً)، إن شاء الله، والله، كيفك، حلو، عاد، دي (هذه)، دا (هذا)
- "يا زول" — النداء السوداني المميز
- "جد" (جداً) — سودانية خالصة
- "دي" / "دا" — بدل "هذه" / "هذا"
- فصحى مبسطة مع لمسة دافئة`,

  'فلسطين': `الفلسطيني (منصة: شو بدك فلسطين، وينك من زمان، السوق المفتوح) — السوق الفلسطيني قريب من الأردني لكن مع خصوصية. اللهجة الفلسطينية دافئة وقريبة من الشام.

═══ صيغ افتتاحية شائعة ═══
- "شقة للبيع في [رام الله/نابلس/القدس]"
- "فرصة استثمارية مميزة — [نوع العقار] في [المنطقة]"
- "من المالك مباشرة — شقة في [المنطقة]"
- "أرض للبيع في [المنطقة] — موقع مميز"
- "شقة مع حديقة في [المنطقة]"

═══ مفردات عقارية فلسطينية ═══
- نوع العقار: شقه (بهاء)، فيلا، أرض، روف، بيت
- الموقع: رام الله، البيرة، نابلس، القدس، طولكرم، الخليل، غزة
- الطوابق: طابق أرضي، طابق أول، سطح
- القانوني: طابو، سند، تسجيل
- المميزات: حديقة، بلكونة، سطح
- السعر: شيكل (في الضفة)، دولار، دينار أردني

═══ عبارات حقيقية من إعلانات فلسطينية ═══
- "شقه للبيع مع حديقه في البيره في سطح مرحبا مساحه 147م +حديقه 60م"
- "فرصة استثمارية مميزة أرض للبيع في (نابلس)، موقع مميز"

═══ صيغ ختامية ═══
- "للتواصل، اتصل على..."
- "فرصة ما بتتكرر"
- "تعال شوفها، بتستاهل"
- "للجدّين فقط"

══️ ميزات مميزة ═══
- "شقه" (بهاء) — مثل الأردن
- "طابو" — الوثيقة (مثل سوريا)
- تنوع العملات (شيكل/دينار/دولار)

═══ قواعد اللهجة الفلسطينية ═══
- استخدم: كيفك، هاد، كتير، والله، يلا، شو، هيك
- "هاد" (هذا)، "هيك" (هكذا)
- قريبة من الأردنية والشامية`,

  'اليمن': `اليمني (منصة: سوق عدن، عقار اليمن) — السوق اليمني يستخدم فصحى مبسطة مع لمسة لهجة يمنية دافئة. الأسعار بالريال اليمني، والإعلانات بسيطة ومباشرة.

═══ صيغ افتتاحية شائعة ═══
- "منزل للبيع في [صنعاء/عدن] — [السعر]"
- "بيت للبيع بالتقسيط وكاش في [المنطقة]"
- "منزل سكني جميل وأنيق في [المنطقة]"
- "فرصة في [المنطقة] — بيت قريب الخط"
- "من المالك مباشرة — [نوع العقار]"

═══ مفردات عقارية يمنية ═══
- نوع العقار: منزل، بيت، شقة، عمارة، أرض، مزرعة
- الموقع: صنعاء، عدن، تعز، الحديدة، المكلا
- المميزات: قريب الخط (near the main road)، بسعر عرطه (good price)
- القانوني: سند، طابو
- السعر: ريال يمني، "قابل للتفاوض"، "بالتقسيط وكاش"

═══ عبارات حقيقية من إعلانات يمنية ═══
- "منزل للبيع بصنعاء ب 25 مليون قابل للتفاوض"
- "منزل #سكني جميل وأنيق وقريب الخط بسعر عرطه. 22 مليون ريال يمني"
- "بيوت للبيع بالتقسيط وكاش في اليمن"

═══ صيغ ختامية ═══
- "للجدّين، تواصل"
- "فرصة ما تتكرر، اتصل"
- "إن شاء الله يعجبك"
- "للاستفسار، راسلنا"

══️ ميزات مميزة ═══
- "عرطه" (good/cheap) — يمنية خالصة
- "قريب الخط" — ميزة قرب الطريق الرئيسي
- "بالتقسيط وكاش" — خيارا الدفع
- "قابل للتفاوض" — شائع

═══ قواعد اللهجة اليمنية ═══
- استخدم: يا حبيبي، والله، إن شاء الله، كيفك، عرطه، با عليك
- "يا حبيبي" — النداء اليمني المميز
- "عرطه" — جيد/رخص
- فصحى مبسطة مع دفء يمني`,

  'سوريا': `السوري (منصة: دوشيش، عقار كليك، Ikar.sy، Syrian Houses) — السوق السوري يستخدم "إكساء" (وليس تشطيب) و"طابو أخضر" و"الملكة" و"نسق" (طابق). اللهجة السورية قريبة من اللبنانية والأردنية.

═══ صيغ افتتاحية شائعة ═══
- "للبيع شقة في [دمشق/حلب] — طابو أخضر"
- "شقة ملكية فاخرة للبيع في [المنطقة]"
- "شقة للبيع في [المنطقة] — إكساء سوبر ديلوكس"
- "بسعر لقطة — [نوع العقار] في [المنطقة]"
- "فرصة في [المنطقة] — [نوع العقار]"

═══ مفردات عقارية سورية ═══
- نوع العقار: شقة، بيت، فيلا، عمارة، مزرعة
- الموقع: دمشق، حلب، اللاذقية، حمص، طرطوس، إدلب
- الطوابق: نسق (طابق)، نسق تاني (طابق ثاني)، أرضي
- القانوني: طابو أخضر (green deed)، الملكة (deed)، حصة
- التشطيب: إكساء (finishing) — ❌ ليست "تشطيب"، إكساء سوبر ديلوكس
- السعر: دولار أمريكي (شائع)، ليرة سورية
- المميزات: صالون، غرفة، بلكونة

═══ عبارات حقيقية من إعلانات سورية ═══
- "للبيع شقة 70متر نسق تاني في كرسانا ضاحية الجردي الملكة طابو أخضر 2400"
- "شقة ملكية فاخرة في حلب الجديدة للبيع"
- "شقة 115م مع حديقة بسعر 33,000$"
- "شقة فاخرة للبيع في شارع النيل – حلب! راحة وفخامة بأجواء راقية"
- "إكساء سوبر ديلوکس بمدخل انيق وبناء"

═══ صيغ ختامية ═══
- "للجدّين، تواصل معنا"
- "بسعر لقطة، سارع"
- "شو رأيك تعال شوفها؟"
- "فرصة ما بتتكرر"

══️ ميزات مميزة للسوق السوري ═══
- "إكساء" (وليس تشطيب) — تميّز سوري قوي
- "طابو أخضر" — الوثيقة القانونية
- "الملكة" — صك الملكية
- "نسق" (طابق) — بدل "طابق"
- "لقطة" (good deal) — بسعر ممتاز
- الأسعار غالباً بالدولار

═══ قواعد اللهجة السورية ═══
- استخدم: كيفك، هاد، كتير، والله، شو، هيك، يلا، هلق (الآن)
- "هاد" (هذا)، "هيك" (هكذا)، "هلق" (الآن)
- "كتير" (جداً)
- قريبة من اللبنانية والأردنية`,

  'موريتانيا': `الموريتاني — سوق ناشئ، فصحى مبسطة مع لمسة حسانية. الإعلانات بسيطة ومباشرة.

═══ صيغ افتتاحية شائعة ═══
- "فرصة ممتازة في [نواكشوط] — [نوع العقار]"
- "للبيع [نوع العقار] في [المنطقة]"
- "من المالك مباشرة — [نوع العقار]"
- "استثمار آمن في [نواكشوط]"

═══ مفردات عقارية موريتانية ═══
- نوع العقار: بيت، شقة، فيلا، أرض، محل
- الموقع: نواكشوط، نواذيبو، روصو
- القانوني: سند، تسجيل
- السعر: أوقية موريتانية، دولار

═══ عبارات شائعة ═══
- "والله فرصة ممتازة"
- "إن شاء الله تعجبك"
- "بتمن مناسب"

═══ صيغ ختامية ═══
- "تواصل الآن"
- "للاستفسار، اتصل"

═══ قواعد الكتابة ═══
- فصحى مبسطة مع لمسة حسانية خفيفة
- "والله"، "إن شاء الله"، "بتمن" (بثمن)`,

  'الصومال': `الصومالي — سوق محدود، فصحى مبسطة مع لمسة صومالية. الإعلانات بسيطة.

═══ صيغ افتتاحية شائعة ═══
- "فرصة كبيرة في [مقديشو] — [نوع العقار]"
- "للبيع [نوع العقار] في [المنطقة]"
- "استثمار آمن — [نوع العقار]"

═══ مفردات ═══
- نوع العقار: بيت، شقة، أرض، محل
- الموقع: مقديشو، هرجيسا، كيسمايو
- السعر: شلن صومالي، دولار

═══ عبارات شائعة ═══
- "فرصة كبيرة والله"
- "إن شاء الله تناسبك"

═══ قواعد الكتابة ═══
- فصحى مبسطة
- "والله"، "إن شاء الله"`,

  'جيبوتي': `الجيبوتي — سوق محدود، فصحى مبسطة مع لمسة جيبوتية.

═══ صيغ افتتاحية ═══
- "فرصة ممتازة في [جيبوتي العاصمة] — [نوع العقار]"
- "للبيع [نوع العقار] في [المنطقة]"

═══ مفردات ═══
- نوع العقار: بيت، شقة، أرض، محل
- الموقع: جيبوتي العاصمة، علي صبيح
- السعر: فرنك جيبوتي، دولار

═══ عبارات ═══
- "فرصة ممتازة والله"
- "تواصل الآن"

═══ قواعد الكتابة ═══
- فصحى مبسطة
- "والله"، "فرصة ممتازة"`,
};

/* ─── Platform-specific prompt instructions ─── */

export const PLATFORM_INSTRUCTIONS: Record<Platform, string> = {
  instagram: `المنصة: إنستغرام
- اكتب وصفاً احترافياً مُقنعاً وطويلاً (12-18 سطراً) مع إيموجي مناسبة — لا تختصر أبداً
- يجب أن يبدأ النص بجملة افتتاحية قوية تجذب الانتباه فوراً
- يجب أن يظهر كل حقل من بيانات العقار صراحةً في النص دون أي اختصار:
  • نوع العقار (في الافتتاحية وفي موضع آخر على الأقل)
  • المدينة + الحي/المنطقة
  • الدولة
  • المساحة بالمتر المربع
  • عدد الغرف
  • السعر بالعملة المحلية (إن وُجد)
- استخدم فقرتين أو ثلاث على الأقل: الافتتاحية الجذابة، وصف تفصيلي للبيانات، وصف المميزات كفوائد، دعوة للعمل
- اذكر كل ميزة مختارة في سطر مستقل بأسلوب مؤثر يُبرز قيمتها — لا تدمج المميزات في سطر واحد، ولا تهمل أي ميزة
- اربط العقار بسياق السوق المحلي (رؤية 2030، نمو المنطقة، الطلب المتزايد) في فقرة قصيرة
- خاطب الجمهور المستهدف بجملة عاطفية تُشعره بأن العقار صُمّم له
- أضف دعوة للعمل قوية في السطر الأخير (CTA) مثل: "تواصل الآن" أو "لا تفوّت الفرصة"
- الهاشتاقات: 12-15 هاشتاق تشمل: المدينة، الدولة، نوع العقار، كل ميزة، وكلمات تسويقية عقارية شائعة`,

  twitter: `المنصة: تويتر/إكس
═══ قاعدة ذهبية: إجمالي النص + الهاشتاغات يجب ألا يتجاوز ٢٧٠ حرف ═══
السبب: حد تويتر ٢٨٠ حرفاً للتغريدة الواحدة. عند المشاركة عبر رابط intent/tweet
يُفتح صندوق كتابة تغريدة واحدة فقط، فإذا تجاوز النص ٢٨٠ حرفاً قصّته تويتر وفُقد
باقي المحتوى. لذا اكتب تغريدة واحدة مركّزة قوية، وليس thread.

- اكتب تغريدة واحدة فقط (NOT a thread) — مغرية، مركّزة، كاملة في حد ذاتها
- الطول الإجمالي (النص + الهاشتاغات): ٢٢٠–٢٧٠ حرفاً كحد أقصى
- الافتتاحية: جملة صادمة أو مثيرة للفضول تُمسك الانتباه في أول ٣ كلمات
- اذكر في سطر واحد مختصر: نوع العقار + المدينة/الحي + أبرز ميزة + السعر (إن وُجد)
- ذكر ميزة واحدة فقط أو اثنتين كحد أقصى (الأكثر إقناعاً) — لا تسرد كل المميزات
- دعوة للعمل في النهاية: "تواصل" أو "راسلنا" أو "للجادين فقط"
- استخدم ١–٢ إيموجي فقط (المؤثرات تُحسب من الـ٢٨٠ حرفاً)
- الهاشتاقات: ٢–٣ فقط في نهاية التغريدة (الأهم: المدينة + نوع العقار + الغرض)
- احسب الأحرف بدقة: كل حرف عربي = ١، كل إيموجي = ٢، كل هاشتاج = طوله + مسافة
- ❌ ممنوع: thread، رمز 🧵، ترقيم ١/٤ ٢/٤، فقرات متعددة، سرد كل المميزات
- ✅ مطلوب: جملة واحدة مركّزة تُقنع المشتري بالتواصل في أقل من ٢٧٠ حرفاً`,

  snapchat: `المنصة: سناب شات
- headline: اكتب عنواناً قصيراً ومثيراً (6-10 كلمات) يُعرض كنص على الصورة — يجب أن يكون مُغرياً جداً
- content: وصف متوسط (5-7 أسطر) يُظهر أسفل الصورة يغطي كل بيانات العقار:
  • نوع العقار والمدينة والحي
  • المساحة وعدد الغرف
  • السعر (إن وُجد)
  • كل المميزات المختارة بصياغة سريعة وجذابة
  • دعوة قصيرة للتواصل
- استخدم 2-3 إيموجي مناسبين
- الهاشتاقات: 3-4 فقط
- أسلوب سريع وحماسي يُناسب سناب شات لكنه لا يهمل أي معلومة مهمة`,

  whatsapp: `المنصة: واتساب
- اكتب رسالة منسّقة احترافياً طويلة وشاملة جاهزة للإرسال المباشر للعملاء المحتملين (15-25 سطراً)
- افتتح بجملة ترحيبية جذابة وقوية تُمسك الانتباه
- اذكر كل بيانات العقار بتنسيق واضح في سطور مستقلة مع إيموجي:
  🏠 النوع
  📍 الموقع (المدينة + الحي + الدولة)
  📐 المساحة
  🛏️ عدد الغرف
  💰 السعر (إن وُجد)
- بعد البيانات، اكتب فقرة قصيرة تربط العقار بسياق السوق المحلي (نمو المنطقة، الفرصة الاستثمارية)
- ثم سرد كل ميزة مختارة في سطر مستقل مع إيموجي مناسب وبأسلوب يُبرز فائدتها للمشتري — لا تدمج ولا تختصر
- أضف جملة عاطفية تخاطب الجمهور المستهدف (العائلة/المستثمر/الباحث عن الفخامة)
- اختم بدعوة واضحة وحازمة للتواصل + رقم أو طريقة تواصل
- الهاشتاقات: اكتب "لا يوجد" فقط`,

  linkedin: `المنصة: لينكدين
- اكتب منشوراً احترافياً موجهاً لرواد الأعمال والمستثمرين وصنّاع القرار (12-18 سطراً)
- افتتح بجملة قوية تُبرز الفرصة الاستثمارية أو القيمة المضافة
- ركّز على الجوانب الاستثمارية في فقرة: الموقع الاستراتيجي، عائد الاستثمار المتوقع، القيمة السوقية، فرص النمو
- اذكر بيانات العقار الأساسية كاملة بأسلوب رسمي ومهني — لا تختصر أي حقل:
  • نوع العقار
  • الموقع الكامل (المدينة + الحي + الدولة)
  • المساحة
  • عدد الغرف
  • السعر
- اذكر كل المميزات المختارة بأسلوب يُبرز قيمتها للمستثمر (موقع، تشطيب، مرافق) — لا تهمل أي ميزة
- اربط العقار بسياق اقتصادي محلي (خطط التنمية، نمو المنطقة، الطلب) لزيادة المصداقية
- استخدم لغة الأعمال الرسمية مع لمسة إقناعية احترافية
- أضف دعوة للعمل مهنية في النهاية مثل: "للتفاصيل والاستفسار، يسعدني تواصلكم"
- الهاشتاقات: 5-7 هاشتاق مهنية مثل: #العقارات #الاستثمار_العقاري #الفرص_الاستثمارية #سوق_العقار
- تجنب اللهجة المحلية الصريحة — استخدم العربية الفصحى المهنية الراقية`,

  facebook: `المنصة: فيسبوك
- اكتب منشوراً اجتماعياً تفاعلياً طويلاً وشاملاً يجمع بين الاحترافية والقرب من الجمهور (14-20 سطراً)
- افتتح بسؤال أو جملة تُثير التفاعل مثل: "تبحث عن بيت أحلامك؟" أو "هل تعلم أن..."
- اذكر كل بيانات العقار بأسلوب واضح ومنظّم في سطور مستقلة — لا تختصر أي حقل:
  • النوع
  • المدينة + الحي + الدولة
  • المساحة
  • عدد الغرف
  • السعر (إن وُجد)
- اذكر كل ميزة مختارة بأسلوب يُبرز فائدتها للمشتري وعائلته في سطر مستقل — لا تدمج ولا تهمل
- اكتب فقرة قصيرة تربط العقار بسياق السوق المحلي (نمو المنطقة، الفرصة، الاستقرار)
- استخدم 4-6 إيموجي مناسبة لتعزيز القراءة وتوزيعها على كامل النص
- أضف جملة عاطفية تخاطب الجمهور المستهدف
- أضف سؤالاً تفاعلياً في النهاية يُشجع على التعليق مثل: "شو رأيك؟ تعالزرنا نشوفه!"
- أضف دعوة للتواصل واضحة
- الهاشتاقات: 6-8 هاشتاج اجتماعية وعقارية`,
};
