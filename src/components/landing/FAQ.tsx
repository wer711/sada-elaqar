'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { MessageCircleQuestion } from 'lucide-react'

const faqs = [
  {
    q: 'هل المنتج يعمل بالعربية؟',
    a: 'نعم! صدى العقار مصمم خصيصاً للسوق العربي ويدعم العربية الفصحى واللهجات الخليجية بشكل طبيعي. كل المحتوى المكتوب جاهز بلغة تسويقية عربية احترافية.',
  },
  {
    q: 'هل أحتاج خبرة تقنية لاستخدامه؟',
    a: 'لا، الواجهة بسيطة جداً. تُدخل بيانات العقار وتضغط زراً واحداً، وصدى العقار يتولّى الباقي. لا تحتاج أي مهارات تقنية أو تصميمية.',
  },
  {
    q: 'كم التكلفة؟',
    a: 'خلال فترة الإطلاق نمنح أول ١٠٠ مسجّل وصولاً مبكراً مجانياً لمدة شهر كامل. التفاصيل الكاملة للاشتراكات تُعلن قريباً وستكون مناسبة لجميع أحجام المكاتب والشركات.',
  },
  {
    q: 'هل النتائج فريدة أم مكررة؟',
    a: 'كل نص يُكتب بناءً على بيانات عقارك الفعلية وموقعه ونوعه، لذا تختلف النتيجة من عقار لآخر. صدى العقار يراعي خصوصية كل عقار ويكتب محتوى يتناسب معه.',
  },
  {
    q: 'هل يمكنني تجربة المنتج قبل الاشتراك؟',
    a: 'بالتأكيد، يمكنك تجربة العرض التفاعلي في هذه الصفحة الآن مجاناً وبدون تسجيل. أدخل بيانات عقار وشاهد النتيجة فوراً.',
  },
  {
    q: 'كيف أبدأ؟',
    a: 'سجّل بياناتك في نموذج الوصول المبكر بالأسفل وسنتواصل معك عبر واتساب فور إطلاق النسخة الكاملة. التسجيل مجاني ولا يلزمك بأي التزام.',
  },
  {
    q: 'هل بيانات عقاراتي آمنة؟',
    a: 'نعم، بياناتك محفوظة بأمان وتُستخدم فقط لكتابة المحتوى الذي تطلبه وتحسين جودة الخدمة. للحصول على التفاصيل الكاملة حول كيفية معالجة بياناتك وحقوقك، اطّلع على سياسة الخصوصية في أسفل الصفحة.',
  },
  {
    q: 'ما المنصات التي يمكنني النشر عليها؟',
    a: 'المحتوى المكتوب جاهز للنشر على واتساب، إنستغرام، سناب شات، إكس (تويتر)، فيسبوك، ولينكدإن. كما يمكنك استخدامه في المواقع العقارية مثل بروبرتي فايندر وبيوت.',
  },
  {
    q: 'هل يدعم الأسواق خارج الخليج؟',
    a: 'نعم، صدى العقار يغطي حالياً ١٨ دولة: السعودية، الإمارات، الكويت، قطر، البحرين، عُمان، مصر، الأردن، العراق، لبنان، فلسطين، سوريا، اليمن، المغرب، الجزائر، تونس، ليبيا، والسودان. ونعمل على إضافة المزيد من الأسواق قريباً.',
  },
  {
    q: 'لماذا أدفع الآن والمشروع لم يكتمل بعد؟',
    a: 'لأنك تحجز مكاناً في النخبة المؤسِّسة بسعر رمزي لن يتكرر. عند الإطلاق الرسمي، السعر سيرتفع ولن تحصل على نفس المزايا الحصرية. دفعك اليوم هو استثمار في مكانة دائمة، لا مجرد مصروف — وأنت مغطى بضمان استرداد كامل خلال ٧ أيام إن لم تقتنع بالقيمة.',
  },
  {
    q: 'ماذا لو لم يعجبني المنتج بعد الدفع؟',
    a: 'نقدم ضمان استرداد كامل خلال ٧ أيام من الدفع، بدون أسئلة. جرّب الخدمة بلا حدود، وإن لم تقتنع بأنها توفر وقتك وجهدك، نعيد لك كل مبلغك فوراً عبر PayPal. المخاطرة كلها علينا، لا عليك.',
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export default function FAQ() {
  return (
    <section
      id="faq"
      className="relative py-20 md:py-28 overflow-hidden"
      dir="rtl"
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FBF8F2] via-[#F5F0E8] to-[#FBF8F2]" />

      {/* Decorative shapes */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-[#0D7C66]/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D4A853]/5 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <MessageCircleQuestion className="w-5 h-5 text-[#D4A853]" />
            <span className="text-sm font-semibold tracking-wide text-[#D4A853]">
              الأسئلة الشائعة
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[#211F1A] leading-tight">
            كل ما تحتاج معرفته
          </h2>
        </motion.div>

        {/* FAQ Accordion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          <Accordion type="single" collapsible className="space-y-0">
            {faqs.map((faq, i) => (
              <motion.div key={i} variants={itemVariants}>
                <AccordionItem
                  value={`faq-${i}`}
                  className="border-[#E8E1D2] group"
                >
                  <AccordionTrigger className="text-right text-base md:text-lg font-medium text-[#211F1A] hover:text-[#0D7C66] hover:no-underline transition-colors py-5 px-1 [&[data-state=open]>svg]:text-[#0D7C66]">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-[#5B564C] leading-relaxed text-sm md:text-base px-1 pb-5">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
