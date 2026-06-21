'use client';

import { motion } from 'framer-motion';
import { Clock, DollarSign, TrendingDown, RefreshCw } from 'lucide-react';

const painPoints = [
  {
    icon: Clock,
    emoji: '⏰',
    title: 'استنزاف الوقت',
    description:
      'ساعات طويلة في كتابة الوصف التسويقي وتصميم المنشورات لكل عقار جديد، مع إعادة نفس المجهود في كل مرة.',
  },
  {
    icon: DollarSign,
    emoji: '💰',
    title: 'تكلفة عالية',
    description:
      'الاستعانة بوكالات تسويق عقاري مكلفة أو مصممين مستقلين، مبالغ شهرية ثابتة دون ضمان جودة أو نتيجة.',
  },
  {
    icon: TrendingDown,
    emoji: '📉',
    title: 'جودة غير مستقرة',
    description:
      'منشورات ضعيفة لا تجذب المشترين الجادين ولا تعكس القيمة الحقيقية للعقار، فتضيع الفرصة على من يستحقها.',
  },
  {
    icon: RefreshCw,
    emoji: '🔄',
    title: 'تكرار العمل',
    description:
      'نفس العملية المملة تتكرر مع كل عقار جديد — من كتابة الوصف لاختيار الهاشتاجات وتصميم الصور.',
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.13,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function PainPoints() {
  return (
    <section id="pain" className="relative bg-[#FBF8F2] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section label */}
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="block text-center text-sm font-bold tracking-wide text-[#D4A853]"
        >
          قبل صدى العقار
        </motion.span>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="mt-3 text-center text-2xl font-extrabold text-[#211F1A] sm:text-3xl lg:text-4xl"
        >
          هل تعاني من هذه المشاكل في تسويق عقاراتك؟
        </motion.h2>

        {/* Cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8"
        >
          {painPoints.map((point) => {
            const Icon = point.icon;
            return (
              <motion.div
                key={point.title}
                variants={cardVariants}
                className="lift group rounded-2xl border border-[#E8E1D2] bg-white p-6 shadow-sm"
              >
                {/* Icon */}
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FBF8F2] text-2xl transition-colors group-hover:bg-[#0D7C66]/10">
                  {point.emoji}
                </div>

                {/* Title */}
                <h3 className="mb-2 text-lg font-bold text-[#211F1A]">
                  {point.title}
                </h3>

                {/* Description */}
                <p className="text-sm leading-relaxed text-[#5B564C]">
                  {point.description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
