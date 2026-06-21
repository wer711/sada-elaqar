'use client'

import { motion } from 'framer-motion'
import { Sparkles, Lock, Zap, Eye, Film, Globe, CalendarClock, BarChart3, Handshake, ArrowLeft } from 'lucide-react'

const mainFeatures = [
  {
    icon: <Sparkles className="h-7 w-7" />,
    title: 'إنشاء محتوى تسويقي',
    description: 'محتوى يُغري المشتري من أول نظرة — بأسلوب يُناسب كل عقار وكل جمهور. لن تحتاج لكاتب أو مصمم بعد اليوم.',
    badge: 'حصري',
    highlight: true,
  },
  {
    icon: <Zap className="h-7 w-7" />,
    title: 'تصدير هاشتاقات متقدّمة',
    description: 'وصول أوسع لإعلانك العقاري بأسلوب حصري لا يتكرر — يضمن ظهور عقارك لمن يبحث فعلاً.',
    badge: null,
    highlight: false,
  },
  {
    icon: <Eye className="h-7 w-7" />,
    title: 'تصاميم احترافية جاهزة',
    description: 'صور عقارك تتحول إلى إعلانات باحترافية الوكالات الكبرى — بهوية مكتبك وشعارك.',
    badge: 'مطلوب',
    highlight: true,
  },
  {
    icon: <ArrowLeft className="h-7 w-7" />,
    title: 'نشر فوري متعدد المنصات',
    description: 'من إنشاء المحتوى إلى نشره — برحلة واحدة سلسة. وفّر ساعات العمل اليومي.',
    badge: null,
    highlight: false,
  },
]

const upcomingFeatures = [
  { emoji: '🎬', label: 'فيديو عقاري احترافي', icon: <Film className="h-4 w-4" /> },
  { emoji: '🌐', label: 'صفحة ويب لكل عقار', icon: <Globe className="h-4 w-4" /> },
  { emoji: '📅', label: 'جدولة ذكية للنشر', icon: <CalendarClock className="h-4 w-4" /> },
  { emoji: '📊', label: 'تحليلات الأداء', icon: <BarChart3 className="h-4 w-4" /> },
  { emoji: '🤝', label: 'إدارة العملاء', icon: <Handshake className="h-4 w-4" /> },
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

const badgeVariants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
}

export default function Features() {
  return (
    <section
      id="features"
      className="relative py-20 md:py-28 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #FBF8F2 0%, #F5F0E8 50%, #FBF8F2 100%)',
      }}
    >
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #D4A853 0%, transparent 70%)' }}
        />
      </div>

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
            المميزات
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-[#211F1A] leading-tight">
            أدوات تسويقية تُغيّر قواعد اللعبة
          </h2>
          <p className="mt-4 text-base md:text-lg text-[#5B564C] max-w-2xl mx-auto leading-relaxed">
            كل ما يحتاجه المسوّق العقاري في مكان واحد — مع تفاصيل حصرية للمسجّلين
          </p>
        </motion.div>

        {/* Main feature cards - 2x2 on mobile, 4 columns on desktop */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6 mb-16"
        >
          {mainFeatures.map((feature, i) => (
            <motion.div
              key={i}
              variants={cardVariants}
              className="lift group relative bg-white rounded-2xl border border-[#E8E1D2] p-6 cursor-default transition-colors duration-200 hover:border-[#D4A853]/40"
            >
              {/* Badge - حصري / مطلوب */}
              {feature.badge && (
                <div className="absolute top-4 left-4">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                    feature.badge === 'حصري'
                      ? 'bg-[#0D7C66]/10 text-[#0D7C66]'
                      : 'bg-[#D4A853]/10 text-[#D4A853]'
                  }`}>
                    <Lock className="h-2.5 w-2.5" />
                    {feature.badge}
                  </span>
                </div>
              )}

              {/* Icon */}
              <div className={`flex items-center justify-center w-14 h-14 rounded-xl mb-5 transition-colors duration-200 ${
                feature.highlight
                  ? 'text-[#0D7C66] bg-[#0D7C66]/8 group-hover:bg-[#0D7C66]/14'
                  : 'text-[#D4A853] bg-[#D4A853]/8 group-hover:bg-[#D4A853]/14'
              }`}>
                {feature.icon}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold text-[#211F1A] mb-3 leading-snug">
                {feature.title}
              </h3>

              {/* Description - benefit-focused, no technical details */}
              <p className="text-sm leading-relaxed text-[#5B564C]">
                {feature.description}
              </p>

              {/* Teaser line */}
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-[#0D7C66] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Sparkles className="h-3 w-3" />
                <span>اكتشف التفاصيل عند التسجيل</span>
              </div>

              {/* Accent line at top */}
              <div className={`absolute top-0 right-0 left-0 h-1 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                feature.highlight
                  ? 'bg-gradient-to-l from-[#0D7C66] to-[#D4A853]'
                  : 'bg-gradient-to-l from-[#D4A853] to-[#0D7C66]'
              }`} />
            </motion.div>
          ))}
        </motion.div>

        {/* Upcoming features section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <h3 className="text-xl md:text-2xl font-bold text-[#211F1A]">
              قادمة في الطريق
            </h3>
            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-[#E0793C]/10 text-[#E0793C]">
              قريباً
            </span>
          </div>
          <p className="text-sm text-[#5B564C] mb-6 max-w-lg mx-auto">
            نعمل على ميزات ستُحدث فرقاً حقيقياً — سجّل الآن لتكون أول من يحصل عليها
          </p>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {upcomingFeatures.map((feature, i) => (
              <motion.div
                key={i}
                variants={badgeVariants}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-dashed border-[#E8E1D2] bg-white/70 text-sm font-medium text-[#5B564C] transition-colors duration-200 hover:border-[#D4A853] hover:text-[#211F1A] group/upcoming"
              >
                <span className="text-base" role="img" aria-hidden="true">
                  {feature.emoji}
                </span>
                <span className="relative">
                  {feature.label}
                  <Lock className="inline-block h-2.5 w-2.5 mr-1 text-[#D4A853] opacity-0 group-hover/upcoming:opacity-100 transition-opacity duration-200" />
                </span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
