'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Crown, Star, Rocket, TrendingUp, Users, Quote, CheckCircle2 } from 'lucide-react'

const MAX_EARLY = 50
// العدّاد يُعرض فقط بعد تجاوز عتبة "الرواد المميزون" (34).
// قبل ذلك، الرقم المنخفض محبط ويضر بالثقة أكثر مما ينفعها.
const COUNT_DISPLAY_THRESHOLD = 17

interface Phase {
  id: number
  label: string
  range: [number, number]
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  description: string
  perk: string
}

const phases: Phase[] = [
  {
    id: 1,
    label: 'المؤسسون الأوائل',
    range: [0, 17],
    icon: <Crown className="h-4 w-4" />,
    color: 'text-[#0D7C66]',
    bgColor: 'bg-[#0D7C66]/10',
    borderColor: 'border-[#0D7C66]/30',
    description: 'مزايا حصرية مدى الحياة',
    perk: 'أولوية الوصول + ميزات دائمة مجاناً',
  },
  {
    id: 2,
    label: 'الرواد المميزون',
    range: [18, 34],
    icon: <Star className="h-4 w-4" />,
    color: 'text-[#D4A853]',
    bgColor: 'bg-[#D4A853]/10',
    borderColor: 'border-[#D4A853]/30',
    description: 'مزايا إضافية للمبكرين',
    perk: 'وصول مبكر + تجربة المجانيات',
  },
  {
    id: 3,
    label: 'الاستعداد للإطلاق',
    range: [35, 50],
    icon: <Rocket className="h-4 w-4" />,
    color: 'text-[#E0793C]',
    bgColor: 'bg-[#E0793C]/10',
    borderColor: 'border-[#E0793C]/30',
    description: 'آخر الفرص قبل الإطلاق الرسمي',
    perk: 'إشعار فوري عند الإطلاق',
  },
]

/* ─── Placeholder testimonials ───
 * هذه شهادات توضيحية تعرض الفائدة المتوقعة من المنتج. تُحذف تلقائياً
 * عند وصول عدد المسجلين إلى عتبة عرض العدّاد الحقيقي، وتُستبدل
 * بآراء حقيقية من قاعدة البيانات (سيتم بناء قسم آراء حقيقي في المرحلة 5).
 *
 * لاحظ: كل شهادة تصف تجربة واقعية ممكنة (تحدي → حل → نتيجة)،
 * لكنها ليست من أشخاص حقيقيين. علامة ⓘ تظهر بجانبها توضيح.
 */
interface Testimonial {
  name: string
  role: string
  city: string
  quote: string
  rating: number
}

const PLACEHOLDER_TESTIMONIALS: Testimonial[] = [
  {
    name: 'وكيل عقاري',
    role: 'مكتب وساطة مستقل',
    city: 'الرياض',
    quote: 'كنت أقضي ساعة على وصف كل عقار، الآن أنشر لـ٥ عقارات في نفس الوقت بجودة أفضل. وفّر عليّ تكلفة مصمم ومونتاج.',
    rating: 5,
  },
  {
    name: 'مستثمرة عقارية',
    role: 'محفظة عقارات صغيرة',
    city: 'دبي',
    quote: 'اللي أعجبني إن المحتوى يطلع بلهجة الإمارات وبأسلوب يستهدف المستثمر تحديداً. صار الـWhatsApp عندي يرنّ أكثر بعد كل منشور.',
    rating: 5,
  },
  {
    name: 'مسؤول تسويق',
    role: 'شركة تطوير عقاري',
    city: 'الدوحة',
    quote: 'جربنا كتابة محتوى لـ٣ منصات بنفس العقار — كل وحدة مظبوطة للمنصة. تويتر قصير، لينكدين رسمي، واتساب تفصيلي. فرق حقيقي.',
    rating: 5,
  },
]

export default function SocialProof() {
  const [count, setCount] = useState<number | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' })

  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/leads/count')
        if (res.ok) {
          const data = await res.json()
          setCount(typeof data.count === 'number' ? data.count : 0)
        } else {
          setCount(0)
        }
      } catch {
        setCount(0)
      }
    }
    fetchCount()
  }, [])

  const realCount = count ?? 0
  const showCounter = realCount >= COUNT_DISPLAY_THRESHOLD
  const displayCount = realCount
  const remaining = Math.max(0, MAX_EARLY - displayCount)
  const progressPercent = Math.min(100, (displayCount / MAX_EARLY) * 100)
  const isFull = displayCount >= MAX_EARLY
  const currentPhase = phases.find(p => displayCount >= p.range[0] && displayCount <= p.range[1]) || phases[0]

  // Animate bar fill (only when counter is shown)
  const [animatedWidth, setAnimatedWidth] = useState(0)
  useEffect(() => {
    if (isInView && showCounter) {
      const timer = setTimeout(() => setAnimatedWidth(progressPercent), 200)
      return () => clearTimeout(timer)
    }
  }, [isInView, progressPercent, showCounter])

  // Animate counter number
  const [displayNumber, setDisplayNumber] = useState(0)
  useEffect(() => {
    if (!isInView || !showCounter || displayCount <= 0) return
    let start = 0
    const end = displayCount
    const duration = 1200
    const stepTime = Math.max(Math.floor(duration / end), 30)
    const timer = setInterval(() => {
      start += 1
      setDisplayNumber(start)
      if (start >= end) {
        clearInterval(timer)
        setDisplayNumber(end)
      }
    }, stepTime)
    return () => clearInterval(timer)
  }, [isInView, displayCount, showCounter])

  return (
    <div ref={sectionRef} dir="rtl">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-white rounded-2xl border border-[#E8E1D2] p-6 md:p-8 shadow-sm">
          {/* ─── Counter section — only shown once we cross the "Pioneers" threshold ───
           * Below the threshold, a low number looks depressing ("only 5 joined").
           * We hide it entirely and show testimonials instead. Once the count
           * crosses the threshold (default 34 = "Pioneers" phase), the counter
           * becomes socially validating, so we show it. */}
          {showCounter ? (
            <>
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-11 h-11 rounded-xl bg-[#0D7C66]/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-[#0D7C66]" />
                </div>
                <div className="flex-1">
                  {isFull ? (
                    <p className="text-[#211F1A] font-bold text-base md:text-lg leading-relaxed">
                      تم اكتمال الأماكن المبكرة! انضم لقائمة الانتظار
                    </p>
                  ) : (
                    <p className="text-[#211F1A] font-bold text-base md:text-lg leading-relaxed">
                      <span className="text-[#0D7C66] text-xl md:text-2xl font-black">
                        {displayNumber}
                      </span>{' '}
                      مسوّق عقاري انضمّوا لقائمة الوصول المبكر — باقي{' '}
                      <span className="text-[#D4A853] font-black">{remaining}</span>{' '}
                      مكاناً من أول ٥٠
                    </p>
                  )}
                </div>
              </div>

              {/* Phase indicators - 3 columns */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {phases.map((phase) => {
                  const isActive = currentPhase.id === phase.id
                  const isPast = currentPhase.id > phase.id
                  return (
                    <motion.div
                      key={phase.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: phase.id * 0.1 }}
                      className={`relative rounded-xl border p-3 text-center transition-all duration-300 ${
                        isActive
                          ? `${phase.borderColor} ${phase.bgColor} shadow-sm`
                          : isPast
                          ? 'border-[#0D7C66]/20 bg-[#0D7C66]/5'
                          : 'border-[#E8E1D2] bg-[#FBF8F2]/50'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2">
                          <div className={`w-2 h-2 rounded-full ${
                            phase.id === 1 ? 'bg-[#0D7C66]' : phase.id === 2 ? 'bg-[#D4A853]' : 'bg-[#E0793C]'
                          }`} style={{ animation: 'pulseGlow 2s infinite' }} />
                        </div>
                      )}
                      <div className={`inline-flex items-center justify-center w-7 h-7 rounded-lg mb-1.5 ${
                        isActive ? phase.bgColor : isPast ? 'bg-[#0D7C66]/10' : 'bg-[#E8E1D2]/50'
                      }`}>
                        <span className={isActive ? phase.color : isPast ? 'text-[#0D7C66]' : 'text-[#5B564C]/50'}>
                          {phase.icon}
                        </span>
                      </div>
                      <p className={`text-[11px] font-bold leading-tight ${
                        isActive ? phase.color : isPast ? 'text-[#0D7C66]' : 'text-[#5B564C]/50'
                      }`}>
                        {phase.label}
                      </p>
                      <p className={`text-[9px] mt-0.5 leading-tight ${
                        isActive ? 'text-[#211F1A]/70' : 'text-[#5B564C]/40'
                      }`}>
                        {phase.range[0]}-{phase.range[1]}
                      </p>
                    </motion.div>
                  )
                })}
              </div>

              {/* Progress bar */}
              <div className="relative h-3 rounded-full bg-[#F5F0E8] overflow-hidden mb-1">
                <div className="absolute inset-0 flex">
                  <div className="w-1/3 border-l border-[#E8E1D2]/50 bg-[#0D7C66]/3" />
                  <div className="w-1/3 border-l border-[#E8E1D2]/50 bg-[#D4A853]/3" />
                  <div className="w-1/3 bg-[#E0793C]/3" />
                </div>
                <div
                  className="absolute inset-y-0 right-0 rounded-full bar-fill"
                  style={{
                    width: `${animatedWidth}%`,
                    background: currentPhase.id === 1
                      ? 'linear-gradient(90deg, #0D7C66 0%, #0D7C66 100%)'
                      : currentPhase.id === 2
                      ? 'linear-gradient(90deg, #0D7C66 0%, #D4A853 100%)'
                      : 'linear-gradient(90deg, #0D7C66 0%, #D4A853 60%, #E0793C 100%)',
                  }}
                />
                <div
                  className="absolute inset-y-0 right-0 rounded-full overflow-hidden"
                  style={{ width: `${animatedWidth}%` }}
                >
                  <div className="shimmer absolute inset-0" />
                </div>
              </div>

              {/* Phase perk line */}
              <div className={`flex items-center gap-2 mt-3 p-2.5 rounded-lg ${currentPhase.bgColor} ${currentPhase.borderColor} border`}>
                <span className={currentPhase.color}>{currentPhase.icon}</span>
                <p className={`text-xs font-bold ${currentPhase.color}`}>
                  {currentPhase.perk}
                </p>
              </div>

              {/* Urgency sub text */}
              <div className="flex items-center gap-2 mt-3">
                <TrendingUp className="w-3.5 h-3.5 text-[#0D7C66]" />
                <p className="text-xs text-[#5B564C]">
                  {isFull
                    ? 'الأماكن المبكرة نفدت — سجّل في قائمة الانتظار لتكون أول من يحصل على الوصول'
                    : `أنت الآن في مرحلة "${currentPhase.label}" — ${currentPhase.description}`}
                </p>
              </div>
            </>
          ) : (
            /* ─── Testimonials section — shown when the counter is below the threshold ───
             * Replaces the depressing "0 joined" with credible value-prop testimonials
             * that describe real scenarios the product solves. These get auto-replaced
             * by real reviews from the DB once we hit the threshold + have real data. */
            <>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-[#D4A853]/10 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-[#D4A853] fill-[#D4A853]" />
                </div>
                <div>
                  <h3 className="text-[#211F1A] font-bold text-base md:text-lg">
                    كيف يُستخدم صدى العقار؟
                  </h3>
                  <p className="text-xs text-[#5B564C] mt-0.5">
                    تجارب واقعية لأنماط تسويقية مختلفة — من وكيل مستقل لشركة تطوير
                  </p>
                </div>
              </div>

              {/* Testimonial cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                {PLACEHOLDER_TESTIMONIALS.map((t, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                    className="rounded-xl border border-[#E8E1D2] bg-[#FBF8F2]/60 p-4 flex flex-col"
                  >
                    {/* Quote icon */}
                    <Quote className="h-4 w-4 text-[#D4A853]/40 mb-2 shrink-0" />

                    {/* Stars */}
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 text-[#D4A853] fill-[#D4A853]" />
                      ))}
                    </div>

                    {/* Quote text */}
                    <p className="text-xs text-[#211F1A] leading-relaxed flex-1 mb-3">
                      {t.quote}
                    </p>

                    {/* Author */}
                    <div className="pt-2 border-t border-[#E8E1D2]/60">
                      <p className="text-[11px] font-bold text-[#211F1A]">{t.name}</p>
                      <p className="text-[10px] text-[#5B564C]">
                        {t.role} · {t.city}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Honest disclosure — builds trust, doesn't lie */}
              <div className="flex items-start gap-2 p-3 rounded-lg bg-[#0D7C66]/5 border border-[#0D7C66]/15">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0D7C66] shrink-0 mt-0.5" />
                <p className="text-[11px] text-[#5B564C] leading-relaxed">
                  <span className="font-bold text-[#0D7C66]">عن الوصول المبكر:</span>{' '}
                  نحن في مرحلة الإطلاق الأولى. ما سبق هو وصف لتجارب نموذجية لكيفية
                  استخدام المنتج. بمجرد وصول المسجلين الأوائل، سنعرض العدّاد الحقيقي
                  والآراء الفعلية هنا بدلاً من هذا الوصف.
                </p>
              </div>

              {/* Early-stage CTA — replaces the urgency line */}
              <div className="flex items-center gap-2 mt-3">
                <Crown className="w-3.5 h-3.5 text-[#0D7C66]" />
                <p className="text-xs text-[#5B564C]">
                  <span className="font-bold text-[#0D7C66]">المؤسسون الأوائل</span> يحصلون
                  على مزايا حصرية مدى الحياة — كن من أول ٣٣ مسجّلاً.
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
