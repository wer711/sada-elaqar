'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Zap, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const steps = [
  {
    number: '١',
    icon: FileText,
    emoji: '📝',
    title: 'أدخل بيانات العقار',
    description:
      'المساحة، السعر، الموقع، عدد الغرف، والمميزات — كلها في نموذج بسيط وسريع.',
  },
  {
    number: '٢',
    icon: Zap,
    emoji: '⚡',
    title: 'المحتوى يُكتب لك',
    description:
      'يحلّل صدى العقار بيانات العقار ويكتب لك محتوى مخصّصاً لكل منصة — بلهجة بلدك وأسلوب يُقنع المشتري الجاد.',
  },
  {
    number: '٣',
    icon: Share2,
    emoji: '📤',
    title: 'انسخ وانشر',
    description:
      'انسخ النص أو شاركه مباشرة — وبدّل بين المنصات بضغطة واحدة لنفس العقار.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function HowItWorks() {
  return (
    <section
      id="how"
      className="relative overflow-hidden py-20 sm:py-28"
      style={{
        background:
          'linear-gradient(180deg, #FBF8F2 0%, #F5F0E8 40%, #FBF8F2 100%)',
      }}
    >
      {/* Subtle decorative blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 right-1/4 h-[280px] w-[280px] rounded-full bg-[#0D7C66] opacity-[0.04] blur-[80px]" />
        <div className="absolute bottom-10 left-1/3 h-[250px] w-[250px] rounded-full bg-[#D4A853] opacity-[0.05] blur-[70px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="block text-center text-sm font-bold tracking-wide text-[#D4A853]"
        >
          العملية
        </motion.span>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mt-3 text-center text-2xl font-extrabold text-[#211F1A] sm:text-3xl lg:text-4xl"
        >
          من بيانات العقار إلى محتوى جاهز للنشر — في ثلاث خطوات
        </motion.h2>

        {/* Steps */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-14 flex flex-col items-center gap-0 lg:flex-row lg:items-stretch lg:justify-center"
        >
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              {/* Step card */}
              <motion.div
                variants={cardVariants}
                className="lift relative w-[300px] rounded-2xl border border-[#E8E1D2] bg-white p-8 shadow-sm sm:w-[340px]"
              >
                {/* Large step number watermark */}
                <span className="pointer-events-none absolute -top-2 left-4 text-[7rem] font-black leading-none text-[#E8E1D2]/60 select-none">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="relative mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-[#0D7C66]/10 text-3xl">
                  {step.emoji}
                </div>

                {/* Title */}
                <h3 className="relative mb-2 text-lg font-bold text-[#211F1A]">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="relative text-sm leading-relaxed text-[#5B564C]">
                  {step.description}
                </p>
              </motion.div>

              {/* Connecting arrow (between cards, not after last) */}
              {index < steps.length - 1 && (
                <div className="flex items-center justify-center px-2 py-4 lg:px-4 lg:py-0">
                  {/* Desktop: horizontal arrow (RTL, so ArrowLeft) */}
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
                    className="hidden lg:block"
                  >
                    <ArrowLeft className="h-6 w-6 text-[#D4A853]" />
                  </motion.div>
                  {/* Mobile: vertical arrow */}
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.2 }}
                    className="block lg:hidden"
                  >
                    <svg className="h-6 w-6 text-[#D4A853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </motion.div>
                </div>
              )}
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, delay: 0.7 }}
          className="mt-14 flex justify-center"
        >
          <a href="#demo">
            <Button className="h-12 rounded-full bg-[#D4A853] px-8 text-base font-bold text-white shadow-lg hover:bg-[#c49a48] cursor-pointer">
              جرّب الآن — مجاناً
            </Button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
