'use client'

import { motion } from 'framer-motion'
import { User, Building2, HardHat, Briefcase } from 'lucide-react'

const audiences = [
  {
    icon: <User className="h-7 w-7" />,
    emoji: '👤',
    title: 'وكلاء عقارات مستقلون',
    description: 'وفّر ساعات يومياً كنت تقضيها في كتابة الإعلانات وتصميمها. ركّز على إغلاق الصفقات ودع المحتوى لنا.',
  },
  {
    icon: <Building2 className="h-7 w-7" />,
    emoji: '🏢',
    title: 'مكاتب الوساطة العقارية',
    description: 'وحّد جودة محتوى فريقك بالكامل ووفّر تكاليف وكالات التسويق الخارجية مع نتائج أفضل.',
  },
  {
    icon: <HardHat className="h-7 w-7" />,
    emoji: '🏗️',
    title: 'شركات التطوير العقاري',
    description: 'سوّق وحداتك الجديدة بسرعة واحترافية مع كل دفعة إطلاق، وكن سبّاقاً في نشر الإعلانات.',
  },
  {
    icon: <Briefcase className="h-7 w-7" />,
    emoji: '💼',
    title: 'مستثمرون عقاريون',
    description: 'قدّم عقاراتك الاستثمارية بلغة مستثمرين محترفة تسهّل اتخاذ القرار للمشتري.',
  },
]

const countries = [
  { name: 'السعودية', flag: '🇸🇦' },
  { name: 'الإمارات', flag: '🇦🇪' },
  { name: 'قطر', flag: '🇶🇦' },
  { name: 'الكويت', flag: '🇰🇼' },
  { name: 'البحرين', flag: '🇧🇭' },
  { name: 'عُمان', flag: '🇴🇲' },
  { name: 'مصر', flag: '🇪🇬' },
  { name: 'الأردن', flag: '🇯🇴' },
  { name: 'العراق', flag: '🇮🇶' },
  { name: 'المغرب', flag: '🇲🇦' },
  { name: 'تركيا', flag: '🇹🇷' },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
}

export default function TargetAudience() {
  return (
    <section
      id="audience"
      className="relative py-20 md:py-28 bg-[#FBF8F2]"
    >
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-sm font-bold tracking-wide mb-3 px-4 py-1.5 rounded-full bg-[#D4A853]/10 text-[#D4A853]">
            لمن صدى العقار؟
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#211F1A] leading-tight">
            صُنع لكل من يسوّق عقاراً في الخليج والشرق الأوسط
          </h2>
        </motion.div>

        {/* Audience cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-14"
        >
          {audiences.map((audience, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="lift group relative bg-white rounded-2xl border border-[#E8E1D2] p-6 cursor-default transition-colors duration-200 hover:border-[#0D7C66]/30"
            >
              {/* Icon */}
              <div className="flex items-center justify-center w-14 h-14 rounded-xl mb-5 text-[#0D7C66] bg-[#0D7C66]/8 transition-colors duration-200 group-hover:bg-[#0D7C66]/14">
                <span className="text-2xl" role="img" aria-hidden="true">
                  {audience.emoji}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-[#211F1A] mb-3 leading-snug">
                {audience.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-[#5B564C]">
                {audience.description}
              </p>

              {/* Accent line at top */}
              <div className="absolute top-0 right-0 left-0 h-1 rounded-t-2xl bg-gradient-to-l from-[#0D7C66] to-[#D4A853] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </motion.div>

        {/* Countries / regions section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <div className="inline-flex flex-col items-center gap-3 px-6 py-5 rounded-2xl bg-white/60 border border-[#E8E1D2]">
            <div className="flex items-center gap-2 text-base font-bold text-[#211F1A]">
              <span role="img" aria-hidden="true">📍</span>
              <span>متاح الآن في:</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm text-[#5B564C]">
              {countries.map((country, i) => (
                <span key={i} className="inline-flex items-center gap-1 hover:text-[#0D7C66] transition-colors duration-200">
                  <span className="text-lg" role="img" aria-label={country.name}>{country.flag}</span>
                  <span className="font-medium">{country.name}</span>
                  {i < countries.length - 1 && <span className="text-[#E8E1D2] mr-1">·</span>}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
