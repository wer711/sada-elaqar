'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, ChevronLeft, ChevronRight, Crown, Gift, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { triggerPrivacyTermsDialog } from './PrivacyTermsDialog';
import { useVisitorId } from '@/lib/visitor';

/* ─── Country / City data ─── */
interface CountryInfo {
  code: string;
  name: string;
  phoneCode: string;
  currency: string;
  cities: string[];
}

const COUNTRIES: CountryInfo[] = [
  { code: 'SA', name: 'المملكة العربية السعودية', phoneCode: '+966', currency: 'ريال', cities: ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الظهران', 'أبها', 'تبوك', 'بريدة', 'نجران', 'الطائف', 'ينبع', 'حائل', 'الجبيل'] },
  { code: 'AE', name: 'الإمارات العربية المتحدة', phoneCode: '+971', currency: 'درهم', cities: ['دبي', 'أبوظبي', 'الشارقة', 'عجمان', 'رأس الخيمة', 'الفجيرة', 'أم القيوين'] },
  { code: 'KW', name: 'الكويت', phoneCode: '+965', currency: 'دينار', cities: ['الكويت العاصمة', 'حولي', 'الفروانية', 'الأحمدي', 'الجهراء', 'مبارك الكبير'] },
  { code: 'QA', name: 'قطر', phoneCode: '+974', currency: 'ريال', cities: ['الدوحة', 'الوكرة', 'الخور', 'الريان', 'أم صلال', 'الدخيل'] },
  { code: 'BH', name: 'البحرين', phoneCode: '+973', currency: 'دينار', cities: ['المنامة', 'المحرق', 'الرفاع', 'مدينة حمد', 'مدينة عيسى'] },
  { code: 'OM', name: 'عُمان', phoneCode: '+968', currency: 'ريال', cities: ['مسقط', 'صلالة', 'صحار', 'نزوى', 'السيب', 'بركاء'] },
  { code: 'EG', name: 'مصر', phoneCode: '+20', currency: 'جنيه', cities: ['القاهرة', 'الإسكندرية', 'الجيزة', 'شرم الشيخ', 'الغردقة', 'المنصورة', 'طنطا', 'أسيوط', 'الإسماعيلية', 'السويس'] },
  { code: 'JO', name: 'الأردن', phoneCode: '+962', currency: 'دينار', cities: ['عمّان', 'إربد', 'الزرقاء', 'العقبة', 'السلط', 'مأدبا'] },
  { code: 'IQ', name: 'العراق', phoneCode: '+964', currency: 'دينار', cities: ['بغداد', 'البصرة', 'أربيل', 'الموصل', 'النجف', 'كربلاء', 'السليمانية', 'ذي قار'] },
  { code: 'LB', name: 'لبنان', phoneCode: '+961', currency: 'دولار', cities: ['بيروت', 'طرابلس', 'صيدا', 'صور', 'جونية', 'زحلة'] },
  { code: 'PS', name: 'فلسطين', phoneCode: '+970', currency: 'شيكل', cities: ['غزة', 'رام الله', 'القدس', 'نابلس', 'خان يونس', 'بيت لحم'] },
  { code: 'SY', name: 'سوريا', phoneCode: '+963', currency: 'ليرة', cities: ['دمشق', 'حلب', 'حمص', 'اللاذقية', 'حماة', 'طرطوس'] },
  { code: 'YE', name: 'اليمن', phoneCode: '+967', currency: 'ريال', cities: ['صنعاء', 'عدن', 'تعز', 'الحديدة', 'المكلا', 'إب'] },
  { code: 'MA', name: 'المغرب', phoneCode: '+212', currency: 'درهم', cities: ['الدار البيضاء', 'الرباط', 'مراكش', 'فاس', 'طنجة', 'أكادير', 'مكناس'] },
  { code: 'DZ', name: 'الجزائر', phoneCode: '+213', currency: 'دينار', cities: ['الجزائر العاصمة', 'وهران', 'قسنطينة', 'عنابة', 'سطيف', 'بليدة'] },
  { code: 'TN', name: 'تونس', phoneCode: '+216', currency: 'دينار', cities: ['تونس العاصمة', 'صفاقس', 'سوسة', 'بنزرت', 'الموناستير', 'قابس'] },
  { code: 'LY', name: 'ليبيا', phoneCode: '+218', currency: 'دينار', cities: ['طرابلس', 'بنغازي', 'مصراتة', 'الزاوية', 'سبها', 'طبرق'] },
  { code: 'SD', name: 'السودان', phoneCode: '+249', currency: 'جنيه', cities: ['الخرطوم', 'أم درمان', 'بحرى', 'بورتسودان', 'كسلا', 'الأبيض'] },
];

/* ─── Form data type ─── */
interface LeadFormData {
  name: string;
  whatsapp: string;
  email: string;
  country: string;
  city: string;
  role: string;
  challenges: string[];
  topFeature: string;
  monthlyBudget: string;
  consent: boolean;
}

/* ─── Role options ─── */
const ROLES = [
  { value: 'وكيل عقاري مستقل', label: 'وكيل عقاري مستقل' },
  { value: 'مكتب وساطة عقاري', label: 'مكتب وساطة عقاري' },
  { value: 'شركة تطوير عقاري', label: 'شركة تطوير عقاري' },
  { value: 'مستثمر عقاري', label: 'مستثمر عقاري' },
  { value: 'أخرى', label: 'أخرى' },
];

const CHALLENGES = [
  { value: 'كتابة وصف تسويقي جذاب', label: 'كتابة وصف تسويقي جذاب' },
  { value: 'تصميم صور ومنشورات احترافية', label: 'تصميم صور ومنشورات احترافية' },
  { value: 'اختيار الهاشتاجات المناسبة', label: 'اختيار الهاشتاجات المناسبة' },
  { value: 'استنزاف الوقت في المهام المتكررة', label: 'استنزاف الوقت في المهام المتكررة' },
  { value: 'تكلفة التسويق المرتفعة', label: 'تكلفة التسويق المرتفعة' },
  { value: 'ضعف التفاعل على المنشورات', label: 'ضعف التفاعل على المنشورات' },
  { value: 'أخرى', label: 'أخرى' },
];

const FEATURES = [
  { value: 'كتابة النصوص التسويقية', label: 'كتابة النصوص التسويقية' },
  { value: 'تحسين الصور والعروض', label: 'تحسين الصور والعروض' },
  { value: 'إنشاء الفيديو العقاري', label: 'إنشاء الفيديو العقاري' },
  { value: 'تحليلات الأداء', label: 'تحليلات الأداء' },
  { value: 'الكل', label: 'الكل' },
];

const BUDGETS = [
  { value: 'أقل من 500', label: 'أقل من 500 ريال' },
  { value: '500-2000', label: '500 - 2,000 ريال' },
  { value: '2000-5000', label: '2,000 - 5,000 ريال' },
  { value: 'أكثر من 5000', label: 'أكثر من 5,000 ريال' },
];

/* ─── Component ─── */
export default function LeadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [duplicateLead, setDuplicateLead] = useState(false);
  const [demoSessionsCount, setDemoSessionsCount] = useState(0);
  const [selectedCountry, setSelectedCountry] = useState<CountryInfo | null>(null);
  const [leadCount, setLeadCount] = useState<number>(0);
  // Single-step form (simplified from 2 steps for higher conversion)

  // visitorId — links the lead to their anonymous demo behavior
  const visitorId = useVisitorId();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    trigger,
    formState: { errors },
  } = useForm<LeadFormData>({
    defaultValues: {
      name: '',
      whatsapp: '',
      email: '',
      country: '',
      city: '',
      role: '',
      challenges: [],
      topFeature: '',
      monthlyBudget: '',
      consent: false,
    },
    mode: 'onChange',
  });

  const countryValue = watch('country');
  const nameValue = watch('name');
  const whatsappValue = watch('whatsapp');
  const cityValue = watch('city');
  const consentValue = watch('consent');

  // Fetch lead count on mount
  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/leads/count');
        const data = await res.json();
        setLeadCount(data.count || 0);
      } catch {
        // silently ignore
      }
    }
    fetchCount();
  }, []);

  // When country changes, update selectedCountry and reset city
  useEffect(() => {
    if (countryValue) {
      const country = COUNTRIES.find((c) => c.code === countryValue);
      setSelectedCountry(country || null);
      setValue('city', '');
    } else {
      setSelectedCountry(null);
    }
  }, [countryValue, setValue]);

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    try {
      if (!data.consent) {
        toast.error('يجب الموافقة على سياسة الخصوصية للمتابعة');
        return;
      }
      const payload = {
        name: data.name,
        whatsapp: selectedCountry ? `${selectedCountry.phoneCode}${data.whatsapp}` : data.whatsapp,
        email: data.email || undefined,
        city: data.city,
        country: selectedCountry?.name || data.country,
        role: data.role || 'لم يُحدّد',
        challenges: data.challenges.length > 0 ? data.challenges : ['لم يُحدّد'],
        topFeature: data.topFeature || 'لم يُحدّد',
        monthlyBudget: data.monthlyBudget || undefined,
        consent: true,
        visitorId, // ← links lead to their demo behavior
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.error(result.error || 'حدث خطأ أثناء التسجيل');
        return;
      }

      setIsSuccess(true);
      setDuplicateLead(!!result.duplicate);
      setDemoSessionsCount(result.demoSessions || 0);
      setLeadCount((prev) => prev + 1);
      toast.success(result.duplicate ? 'أنت مسجّل بالفعل!' : 'تم التسجيل بنجاح!');

      // ✅ تتبع التسجيل في لوحة التحكم
      if (typeof window !== 'undefined' && window.sada) {
        window.sada.track('signup', {
          label: 'نموذج التسجيل الرئيسي',
          category: 'conversion',
        });
      }
    } catch {
      toast.error('حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      '🚀 اكتشفت صدى العقار — مساعد التسويق العقاري! سجّل الآن واحصل على وصول مبكر مجاناً 👇\nhttps://sadaaqar.com'
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleReset = () => {
    setIsSuccess(false);
    setDuplicateLead(false);
    reset();
    setSelectedCountry(null);
  };

  const spotsLeft = Math.max(0, 100 - leadCount);

  /* ─── Success State — smart thank-you screen with founder offer ─── */
  if (isSuccess) {
    return (
      <section id="lead-form" className="py-16 md:py-24 px-4 bg-[#FBF8F2]">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 150 }}
          >
            <Card className="border-2 border-[#0D7C66]/20 shadow-xl overflow-hidden">
              {/* Success header */}
              <div className="bg-gradient-to-l from-[#0D7C66] to-[#0a6b58] p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="text-5xl mb-2"
                >
                  {duplicateLead ? '👋' : '🎉'}
                </motion.div>
                <h3 className="text-2xl md:text-3xl font-bold text-white">
                  {duplicateLead ? 'مرحباً بعودتك!' : 'تم التسجيل بنجاح!'}
                </h3>
                <p className="text-white/80 text-sm mt-1">
                  {duplicateLead
                    ? 'أنت مسجّل بالفعل في قائمة الوصول المبكر'
                    : 'أنت الآن ضمن قائمة الوصول المبكر'}
                </p>
              </div>

              <CardContent className="p-6 md:p-8 space-y-5">
                {/* Demo behavior insight — shows the user we tracked their interest */}
                {demoSessionsCount > 0 && (
                  <div className="rounded-xl border border-[#0D7C66]/20 bg-[#0D7C66]/5 p-4 flex items-start gap-3">
                    <TrendingUp className="w-5 h-5 text-[#0D7C66] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-[#0D7C66]">
                        جرّبت {demoSessionsCount} {demoSessionsCount === 1 ? 'كتابة' : 'كتابة'} قبل التسجيل
                      </p>
                      <p className="text-xs text-[#5B564C] mt-1 leading-relaxed">
                        سجّلنا اهتمامك — سنرسل لك ميزات تخصّ ما جرّبته بالضبط عند الإطلاق.
                      </p>
                    </div>
                  </div>
                )}

                {/* What happens next */}
                <div className="space-y-2.5">
                  <p className="text-sm font-bold text-[#211F1A]">ماذا بعد؟</p>
                  {[
                    'سنتواصل معك عبر واتساب فور إطلاق النسخة الكاملة',
                    'تحصل على أولوية في الوصول + ميزات حصرية للمسجلين الأوائل',
                    'سنرسل لك تحديثات عن الميزات الجديدة قبل الجميع',
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-[#0D7C66] shrink-0 mt-0.5" strokeWidth={3} />
                      <p className="text-sm text-[#5B564C] leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>

                {/* Founder offer teaser — soft CTA */}
                {!duplicateLead && (
                  <div className="rounded-xl border border-[#D4A853]/30 bg-gradient-to-l from-[#D4A853]/10 to-[#FBF8F2] p-4">
                    <div className="flex items-start gap-3">
                      <Crown className="w-5 h-5 text-[#D4A853] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#211F1A]">
                          💡 تريد استخداماً بلا حدود؟
                        </p>
                        <p className="text-xs text-[#5B564C] mt-1 leading-relaxed">
                          اشترك كـ<strong>داعم مبكر</strong> — دفعة رمزية واحدة، كتابة غير محدودة
                          حتى الإطلاق + شارة الداعم + أولوية في الميزات القادمة.
                          <span className="text-[#D4A853] font-semibold"> (قريباً)</span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button
                    onClick={handleShareWhatsApp}
                    className="bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-base h-12 px-6 cursor-pointer"
                    size="lg"
                  >
                    📢 أخبر زملاءك عن صدى العقار
                  </Button>

                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-[#0D7C66] text-[#0D7C66] hover:bg-[#0D7C66]/10 font-semibold text-base h-12 px-6 cursor-pointer"
                    size="lg"
                  >
                    تسجيل حساب آخر
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    );
  }

  /* ─── Form State (two steps) ─── */
  return (
    <section id="lead-form" className="py-16 md:py-24 px-4 bg-[#FBF8F2]">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <Badge className="bg-[#D4A853]/15 text-[#D4A853] border-[#D4A853]/30 text-sm font-semibold px-4 py-1.5 mb-4">
            🎁 عرض الانطلاق
          </Badge>

          <h2 className="text-2xl md:text-4xl font-bold text-[#211F1A] leading-tight mb-4">
            {`كن من أول ١٠٠ وكيل يحصل على `}
            <span className="grad-text">وصول مبكر مجاناً</span>
          </h2>

          <p className="text-[#5B564C] text-base md:text-lg leading-relaxed">
            شهر كامل مجاناً عند الإطلاق + أولوية في تخصيص الميزات التي تهمك
          </p>

          {/* Urgency badge — only shown when spots are running low (≤ 60 left = 40+ joined).
              Before that, showing "97 left" is depressing and hurts trust. */}
          {spotsLeft > 0 && spotsLeft <= 60 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-[#0D7C66]/10 text-[#0D7C66] rounded-full px-4 py-1.5 text-sm font-semibold">
              <span className="w-2 h-2 bg-[#0D7C66] rounded-full animate-pulse" />
              متبقي {spotsLeft} مكان فقط
            </div>
          )}
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Card className="border border-[#E8E1D2] shadow-lg overflow-hidden">
            <CardContent className="p-6 md:p-8">
              {/* Notice Box */}
              <div className="bg-[#0D7C66]/8 border border-[#0D7C66]/15 rounded-lg p-4 mb-6 flex gap-3 items-start">
                <span className="text-xl mt-0.5 shrink-0">🏗️</span>
                <p className="text-[#211F1A] text-sm leading-relaxed">
                  نعمل على تطوير مشروع متكامل يُسهّل التسويق الرقمي في السوق العقاري.
                  سجّل بياناتك لتحصل على الوصول المبكر فور الإطلاق.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                {/* ─── Single step: all fields, required ones first, optional collapsible ─── */}
                      {/* 1. الاسم الكامل */}
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-[#211F1A] font-semibold text-sm">
                          الاسم الكامل <span className="text-[#DC3545]">*</span>
                        </Label>
                        <Input
                          id="name"
                          placeholder="أدخل اسمك الكامل"
                          className="h-11 bg-white border-[#E8E1D2] focus-visible:border-[#0D7C66] focus-visible:ring-[#0D7C66]/20 text-right"
                          {...register('name', { required: 'الاسم الكامل مطلوب' })}
                        />
                        {errors.name && (
                          <p className="text-[#DC3545] text-xs mt-1">{errors.name.message}</p>
                        )}
                      </div>

                      {/* 2. رقم الواتساب + الدولة */}
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp" className="text-[#211F1A] font-semibold text-sm">
                          رقم الواتساب <span className="text-[#DC3545]">*</span>
                        </Label>
                        <div className="flex gap-2" dir="ltr">
                          <Controller
                            name="country"
                            control={control}
                            rules={{ required: 'الدولة مطلوبة' }}
                            render={({ field }) => (
                              <Select value={field.value} onValueChange={field.onChange}>
                                <SelectTrigger className="w-[120px] shrink-0 h-11 bg-white border-[#E8E1D2] text-left">
                                  <SelectValue placeholder="الرمز" />
                                </SelectTrigger>
                                <SelectContent className="max-h-64">
                                  {COUNTRIES.map((c) => (
                                    <SelectItem key={c.code} value={c.code}>
                                      {c.phoneCode} {c.code}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                          <Input
                            id="whatsapp"
                            type="tel"
                            placeholder="5XXXXXXXX"
                            dir="ltr"
                            className="h-11 bg-white border-[#E8E1D2] focus-visible:border-[#0D7C66] focus-visible:ring-[#0D7C66]/20 flex-1 text-left"
                            {...register('whatsapp', {
                              required: 'رقم الواتساب مطلوب',
                              pattern: {
                                value: /^[0-9]{8,15}$/,
                                message: 'أدخل رقم واتساب صحيح',
                              },
                            })}
                          />
                        </div>
                        {errors.whatsapp && (
                          <p className="text-[#DC3545] text-xs mt-1">{errors.whatsapp.message}</p>
                        )}
                        {errors.country && (
                          <p className="text-[#DC3545] text-xs mt-1">{errors.country.message}</p>
                        )}
                      </div>

                      {/* 3. المدينة */}
                      <div className="space-y-2">
                        <Label className="text-[#211F1A] font-semibold text-sm">
                          المدينة <span className="text-[#DC3545]">*</span>
                        </Label>
                        <Controller
                          name="city"
                          control={control}
                          rules={{ required: 'المدينة مطلوبة' }}
                          render={({ field }) => {
                            const cities = selectedCountry?.cities || [];
                            return (
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={!selectedCountry}
                              >
                                <SelectTrigger className="w-full h-11 bg-white border-[#E8E1D2]">
                                  <SelectValue
                                    placeholder={
                                      selectedCountry
                                        ? 'اختر المدينة'
                                        : 'اختر الدولة أولاً من حقل رقم الواتساب'
                                    }
                                  />
                                </SelectTrigger>
                                <SelectContent className="max-h-64">
                                  {cities.map((city) => (
                                    <SelectItem key={city} value={city}>
                                      {city}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            );
                          }}
                        />
                        {errors.city && (
                          <p className="text-[#DC3545] text-xs mt-1">{errors.city.message}</p>
                        )}
                      </div>

                      {/* 4. البريد الإلكتروني (optional, but useful) */}
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-[#211F1A] font-semibold text-sm">
                          البريد الإلكتروني <span className="text-[#5B564C] text-xs font-normal">(اختياري)</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="example@email.com"
                          dir="ltr"
                          className="h-11 bg-white border-[#E8E1D2] focus-visible:border-[#0D7C66] focus-visible:ring-[#0D7C66]/20 text-left"
                          {...register('email', {
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: 'أدخل بريد إلكتروني صحيح',
                            },
                          })}
                        />
                        {errors.email && (
                          <p className="text-[#DC3545] text-xs mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      {/* Consent Checkbox */}
                      <div className="rounded-xl border border-[#E8E1D2] bg-[#FBF8F2]/60 p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <Controller
                            name="consent"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                              <Checkbox
                                id="consent"
                                checked={field.value}
                                onCheckedChange={(v) => field.onChange(v === true)}
                                className="mt-0.5 data-[state=checked]:bg-[#0D7C66] data-[state=checked]:border-[#0D7C66]"
                              />
                            )}
                          />
                          <span className="text-sm text-[#211F1A] leading-relaxed">
                            أوافق على{' '}
                            <button
                              type="button"
                              onClick={() => triggerPrivacyTermsDialog('privacy')}
                              className="text-[#0D7C66] font-semibold underline-offset-2 hover:underline"
                            >
                              سياسة الخصوصية
                            </button>{' '}
                            و{' '}
                            <button
                              type="button"
                              onClick={() => triggerPrivacyTermsDialog('terms')}
                              className="text-[#0D7C66] font-semibold underline-offset-2 hover:underline"
                            >
                              الشروط والأحكام
                            </button>
                            ، وأسمح لـ«صدى العقار» بالتواصل معي عبر واتساب والبريد
                            الإلكتروني بخصوص الخدمة.
                          </span>
                        </label>
                        {errors.consent && (
                          <p className="mt-2 text-xs text-red-600 font-medium">
                            يجب الموافقة على سياسة الخصوصية لإكمال التسجيل
                          </p>
                        )}
                      </div>

                      {/* ─── Optional details (collapsible — all in one step) ─── */}
                      <details className="rounded-xl border border-[#E8E1D2] bg-[#FBF8F2]/50 p-3">
                        <summary className="cursor-pointer text-sm font-bold text-[#0D7C66] flex items-center gap-2">
                          💡 تفاصيل إضافية (اختياري — تساعدنا على تخصيص الميزات لك)
                        </summary>
                        <div className="space-y-5 mt-4">
                      {/* 5. صفتك */}
                      <div className="space-y-3">
                        <Label className="text-[#211F1A] font-semibold text-sm">
                          صفتك <span className="text-[#5B564C] text-xs font-normal">(اختياري)</span>
                        </Label>
                        <Controller
                          name="role"
                          control={control}
                          render={({ field }) => (
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="gap-2"
                            >
                              {ROLES.map((role) => (
                                <label
                                  key={role.value}
                                  className={`flex items-center gap-3 rounded-lg border p-2.5 cursor-pointer transition-all ${
                                    field.value === role.value
                                      ? 'border-[#0D7C66] bg-[#0D7C66]/5'
                                      : 'border-[#E8E1D2] bg-white hover:border-[#0D7C66]/40'
                                  }`}
                                >
                                  <RadioGroupItem value={role.value} id={`role-${role.value}`} />
                                  <Label
                                    htmlFor={`role-${role.value}`}
                                    className="cursor-pointer text-sm font-medium text-[#211F1A]"
                                  >
                                    {role.label}
                                  </Label>
                                </label>
                              ))}
                            </RadioGroup>
                          )}
                        />
                      </div>

                      {/* 6. التحديات */}
                      <div className="space-y-3">
                        <Label className="text-[#211F1A] font-semibold text-sm">
                          ما أكبر تحدٍّ تواجهه في التسويق العقاري؟{' '}
                          <span className="text-[#5B564C] text-xs font-normal">(اختياري)</span>
                        </Label>
                        <Controller
                          name="challenges"
                          control={control}
                          render={({ field }) => {
                            const toggleChallenge = (challenge: string) => {
                              const current = field.value || [];
                              if (current.includes(challenge)) {
                                field.onChange(current.filter((c: string) => c !== challenge));
                              } else {
                                field.onChange([...current, challenge]);
                              }
                            };

                            return (
                              <div className="space-y-2">
                                {CHALLENGES.map((challenge) => {
                                  const isChecked = (field.value || []).includes(challenge.value);
                                  return (
                                    <label
                                      key={challenge.value}
                                      className={`flex items-center gap-3 rounded-lg border p-2.5 cursor-pointer transition-all ${
                                        isChecked
                                          ? 'border-[#0D7C66] bg-[#0D7C66]/5'
                                          : 'border-[#E8E1D2] bg-white hover:border-[#0D7C66]/40'
                                      }`}
                                    >
                                      <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={() => toggleChallenge(challenge.value)}
                                      />
                                      <span className="text-sm font-medium text-[#211F1A]">
                                        {challenge.label}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            );
                          }}
                        />
                      </div>

                      {/* 7. الميزة الأهم */}
                      <div className="space-y-3">
                        <Label className="text-[#211F1A] font-semibold text-sm">
                          أي ميزة تهمك أكثر؟{' '}
                          <span className="text-[#5B564C] text-xs font-normal">(اختياري)</span>
                        </Label>
                        <Controller
                          name="topFeature"
                          control={control}
                          render={({ field }) => (
                            <RadioGroup
                              value={field.value}
                              onValueChange={field.onChange}
                              className="gap-2"
                            >
                              {FEATURES.map((feature) => (
                                <label
                                  key={feature.value}
                                  className={`flex items-center gap-3 rounded-lg border p-2.5 cursor-pointer transition-all ${
                                    field.value === feature.value
                                      ? 'border-[#0D7C66] bg-[#0D7C66]/5'
                                      : 'border-[#E8E1D2] bg-white hover:border-[#0D7C66]/40'
                                  }`}
                                >
                                  <RadioGroupItem
                                    value={feature.value}
                                    id={`feature-${feature.value}`}
                                  />
                                  <Label
                                    htmlFor={`feature-${feature.value}`}
                                    className="cursor-pointer text-sm font-medium text-[#211F1A]"
                                  >
                                    {feature.label}
                                  </Label>
                                </label>
                              ))}
                            </RadioGroup>
                          )}
                        />
                      </div>

                      {/* 8. الميزانية الشهرية */}
                      <div className="space-y-2">
                        <Label className="text-[#211F1A] font-semibold text-sm">
                          كم تدفع شهرياً على تسويق عقاراتك؟{' '}
                          <span className="text-[#5B564C] text-xs font-normal">(اختياري)</span>
                        </Label>
                        <Controller
                          name="monthlyBudget"
                          control={control}
                          render={({ field }) => (
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger className="w-full h-11 bg-white border-[#E8E1D2]">
                                <SelectValue placeholder="اختر النطاق" />
                              </SelectTrigger>
                              <SelectContent>
                                {BUDGETS.map((b) => (
                                  <SelectItem key={b.value} value={b.value}>
                                    {selectedCountry
                                      ? b.label.replace('ريال', selectedCountry.currency)
                                      : b.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </div>

                      {/* Submit button */}
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-[#0D7C66] hover:bg-[#0B6B58] text-white font-bold text-base rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin size-5" />
                            جارٍ الإرسال...
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5">
                            <Sparkles className="h-4 w-4" />
                            🚀 سجّل واحصل على وصول مبكر
                          </span>
                        )}
                      </Button>

                      <p className="text-center text-[#5B564C] text-xs">
                        🔒 بياناتك محفوظة بأمان. اطّلع على{' '}
                        <button
                          type="button"
                          onClick={() => triggerPrivacyTermsDialog('privacy')}
                          className="text-[#0D7C66] font-semibold underline-offset-2 hover:underline"
                        >
                          سياسة الخصوصية
                        </button>
                      </p>
                        </div>
                      </details>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
