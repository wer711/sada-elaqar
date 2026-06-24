'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ArrowDown, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const typewriterTexts = [
  'شقة فاخرة بتصميم عصري في قلب الرياض — ٣ غرف واسعة وصالة مفتوحة تطل على أفق المدينة. فرصة استثمارية لا تُعوّض!',
  'فيلا راقية بحي الورود — مساحة ٣٥٠ م² مع حديقة خاصة ومسبح. مثالية للعائلة الباحثة عن الرقي والخصوصية.',
  'مكتب تجاري مميز ببرج المملكة — إطلالة بانورامية وتشطيب سوبر لوكس. موقع استراتيجي يضمن حضورك التجاري.',
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Hero() {
  const [textIndex, setTextIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);

  const typeText = useCallback(() => {
    const fullText = typewriterTexts[textIndex];
    let charIndex = 0;
    setIsTyping(true);
    setDisplayedText('');

    const interval = setInterval(() => {
      if (charIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
        // Wait 2.5s, then move to next text
        setTimeout(() => {
          setTextIndex((prev) => (prev + 1) % typewriterTexts.length);
        }, 2500);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [textIndex]);

  useEffect(() => {
    const cleanup = typeText();
    return cleanup;
  }, [typeText]);

  return (
    <section
      id="hero"
      className="relative min-h-screen overflow-hidden bg-[#FBF8F2] pt-24 pb-16 sm:pt-32 sm:pb-20"
    >
      {/* Ambient decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/4 h-[420px] w-[420px] rounded-full bg-[#D4A853] opacity-[0.07] blur-[100px]" />
        <div className="absolute top-1/3 right-0 h-[350px] w-[350px] rounded-full bg-[#0D7C66] opacity-[0.06] blur-[90px]" />
        <div className="absolute bottom-0 left-0 h-[300px] w-[300px] rounded-full bg-[#D4A853] opacity-[0.05] blur-[80px]" />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 sm:px-6 lg:flex-row lg:items-start lg:gap-8 lg:px-8">
        {/* Left / Text side */}
        <div className="flex flex-1 flex-col items-center text-center lg:items-start lg:text-right">
          {/* Badge pill */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
          >
            <span className="inline-block rounded-full bg-[#0D7C66]/10 px-5 py-2 text-sm font-medium text-[#0D7C66]">
              مساعد التسويق العقاري للسوق العربي
            </span>
          </motion.div>

          {/* Main title */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="mt-6 text-3xl font-extrabold leading-tight text-[#211F1A] sm:text-4xl lg:text-5xl"
          >
            تقضي ساعات في تسويق عقار واحد؟
            <br />
            <span className="grad-text">
              حوّل بياناته إلى محتوى احترافي في ثوانٍ معدودة
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="mt-5 max-w-lg text-base leading-relaxed text-[#5B564C] sm:text-lg"
          >
            لا مزيد من ساعات الكتابة والتصميم. أدخل بيانات العقار، واحصل على محتوى
            تسويقي جاهز للنشر.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="mt-8 flex flex-col gap-4 sm:flex-row"
          >
            <a href="#demo" data-sada-track="try-now-click" data-sada-category="engagement">
              <Button className="pulse-cta h-12 rounded-full bg-[#0D7C66] px-8 text-base font-bold text-white hover:bg-[#0a6b58] cursor-pointer">
                جرّب الآن مجاناً
              </Button>
            </a>
            <a href="#how">
              <Button
                variant="outline"
                className="h-12 rounded-full border-[#E8E1D2] px-8 text-base font-bold text-[#211F1A] hover:border-[#0D7C66] hover:text-[#0D7C66] cursor-pointer"
              >
                شاهد كيف يعمل
              </Button>
            </a>
          </motion.div>

          {/* Checkmarks */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={4}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-6"
          >
            {[
              'بدون خبرة تقنية',
              'مصمم للسوق العربي',
              'نتائج فورية',
            ].map((item) => (
              <span
                key={item}
                className="flex items-center gap-2 text-sm font-medium text-[#5B564C]"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0D7C66]/15">
                  <Check className="h-3 w-3 text-[#0D7C66]" strokeWidth={3} />
                </span>
                {item}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Right / Transformation panel */}
        <div className="flex flex-1 items-center justify-center lg:justify-end">
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
            className="relative w-full max-w-md"
          >
            {/* Property data card */}
            <div className="rounded-2xl border border-[#E8E1D2] bg-white p-5 shadow-lg">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D7C66]/10">
                  <svg className="h-4 w-4 text-[#0D7C66]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />
                  </svg>
                </span>
                <span className="text-sm font-bold text-[#211F1A]">بيانات العقار</span>
              </div>
              <div className="rounded-xl bg-[#FBF8F2] p-4">
                <p className="text-base font-semibold text-[#211F1A]">شقة ٣ غرف</p>
                <p className="mt-1 text-sm text-[#5B564C]">
                  ١٥٠ م² · الرياض · ٨٥٠,٠٠٠ ريال
                </p>
              </div>
            </div>

            {/* Arrow */}
            <div className="my-3 flex justify-center">
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' as const }}
              >
                <ArrowDown className="h-6 w-6 text-[#D4A853]" />
              </motion.div>
            </div>

            {/* Generated marketing content card */}
            <div className="rounded-2xl border border-[#0D7C66]/20 bg-white p-5 shadow-lg">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#D4A853]/15">
                    <svg className="h-4 w-4 text-[#D4A853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </span>
                  <span className="text-sm font-bold text-[#211F1A]">المحتوى التسويقي</span>
                </div>
                <span className="rounded-full bg-[#0D7C66]/10 px-3 py-1 text-xs font-semibold text-[#0D7C66]">
                  ⏱️ ثوانٍ معدودة فقط
                </span>
              </div>
              <div className="rounded-xl bg-[#FBF8F2] p-4 min-h-[80px]">
                <p className="text-sm leading-relaxed text-[#211F1A]">
                  {displayedText}
                  {isTyping && <span className="caret" />}
                </p>
              </div>
            </div>

            {/* Decorative floating badge */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' as const }}
              className="absolute -top-4 -left-4 rounded-xl bg-[#D4A853] px-4 py-2 text-sm font-bold text-white shadow-lg"
            >
              ⚡ تسويق فوري
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
