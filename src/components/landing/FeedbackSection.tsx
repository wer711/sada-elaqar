'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Send, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useVisitorId } from '@/lib/visitor';

/* ─── Feedback categories ─── */
const CATEGORIES = [
  { value: 'feature_request', label: '💡 ميزة جديدة', icon: '💡' },
  { value: 'demo_improvement', label: '✨ تحسين الديمو', icon: '✨' },
  { value: 'bug', label: '🐛 مشكلة/خطأ', icon: '🐛' },
  { value: 'pricing_suggestion', label: '💰 اقتراح تسعير', icon: '💰' },
  { value: 'general', label: '💬 رأي عام', icon: '💬' },
];

interface FeedbackSectionProps {
  /** If true, the visitor is a paying founder — show the priority badge */
  isFounder?: boolean;
}

export default function FeedbackSection({ isFounder = false }: FeedbackSectionProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [category, setCategory] = useState('general');
  const [feedback, setFeedback] = useState('');
  const [contactConsent, setContactConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const visitorId = useVisitorId();

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('اختر تقييماً', { description: 'من ١ إلى ٥ نجوم' });
      return;
    }
    if (feedback.trim().length < 5) {
      toast.error('اكتب ملاحظتك', { description: '٥ أحرف على الأقل' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          category,
          feedback: feedback.trim(),
          visitorId,
          contactConsent,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'حدث خطأ');
        return;
      }
      setSubmitted(true);
      toast.success(data.message || 'شكراً لملاحظتك!', { duration: 4000 });

      // ✅ تتبع حفظ الملاحظات في لوحة التحكم
      if (typeof window !== 'undefined' && window.sada) {
        window.sada.track('note', {
          label: 'حفظ ملاحظة',
          category: 'engagement',
        });
      }
    } catch {
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setIsSubmitting(false);
    }
  }, [rating, category, feedback, contactConsent, visitorId]);

  const resetForm = () => {
    setRating(0);
    setCategory('general');
    setFeedback('');
    setContactConsent(false);
    setSubmitted(false);
  };

  /* ─── Success state ─── */
  if (submitted) {
    return (
      <section id="feedback" className="py-16 md:py-20 px-4 bg-gradient-to-b from-[#FBF8F2] to-[#F5F0E8]">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-2xl border border-[#0D7C66]/20 shadow-lg p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0D7C66]/10 mb-4"
            >
              <CheckCircle2 className="w-8 h-8 text-[#0D7C66]" />
            </motion.div>
            <h3 className="text-xl md:text-2xl font-bold text-[#211F1A] mb-2">
              وصلتنا ملاحظتك!
            </h3>
            <p className="text-[#5B564C] text-sm md:text-base leading-relaxed mb-6">
              {isFounder
                ? 'بصفتك داعماً مبكراً، ملاحظتك في أعلى قائمتنا. سنطلع عليها أولاً ونعلمك بالتحديثات المتعلقة بها.'
                : 'نشكرك على وقتك. نقرأ كل ملاحظة ونأخذها بعين الاعتبار في تطوير المنتج.'}
            </p>
            <Button
              onClick={resetForm}
              variant="outline"
              className="border-[#0D7C66] text-[#0D7C66] hover:bg-[#0D7C66]/10 cursor-pointer"
            >
              إرسال ملاحظة أخرى
            </Button>
          </motion.div>
        </div>
      </section>
    );
  }

  /* ─── Form state ─── */
  return (
    <section id="feedback" className="py-16 md:py-20 px-4 bg-gradient-to-b from-[#FBF8F2] to-[#F5F0E8]">
      <div className="max-w-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-[#D4A853]" />
            <span className="text-sm font-semibold tracking-wide text-[#D4A853]">
              شاركنا رأيك
            </span>
            {isFounder && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#D4A853] bg-[#D4A853]/10 border border-[#D4A853]/30 rounded-full px-2 py-0.5">
                <Sparkles className="w-3 h-3" />
                أولوية الداعم
              </span>
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#211F1A] mb-2">
            ما رأيك في صدى العقار؟
          </h2>
          <p className="text-[#5B564C] text-sm md:text-base leading-relaxed">
            ملاحظاتك تُشكّل ميزات النسخة النهائية. كل فكرة تصلنا تُقرأ وتُؤخذ بعين الاعتبار.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-[#E8E1D2] shadow-sm p-6 md:p-8 space-y-5"
          >
            {/* Star rating */}
            <div>
              <label className="block text-sm font-bold text-[#211F1A] mb-3">
                تقييمك العام <span className="text-[#DC3545]">*</span>
              </label>
              <div className="flex gap-1.5 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 cursor-pointer"
                    aria-label={`${star} نجوم`}
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        (hoverRating || rating) >= star
                          ? 'text-[#D4A853] fill-[#D4A853]'
                          : 'text-[#E8E1D2]'
                      }`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-center text-xs text-[#5B564C] mt-2">
                  {rating === 1 && '😐 نأسف لذلك — ساعدنا نتحسّن'}
                  {rating === 2 && '🙁 ليس جيداً بعد'}
                  {rating === 3 && '🙂 مقبول'}
                  {rating === 4 && '😊 جيد'}
                  {rating === 5 && '🤩 ممتاز!'}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-[#211F1A] mb-2">
                نوع الملاحظة
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer text-right ${
                      category === cat.value
                        ? 'border-[#0D7C66] bg-[#0D7C66]/5 text-[#0D7C66]'
                        : 'border-[#E8E1D2] bg-white text-[#5B564C] hover:border-[#0D7C66]/40'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span className="truncate">{cat.label.split(' ')[1] || cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback text */}
            <div>
              <label className="block text-sm font-bold text-[#211F1A] mb-2">
                ملاحظتك <span className="text-[#DC3545]">*</span>
              </label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={
                  category === 'feature_request'
                    ? 'مثال: أتمنى إضافة دعم لمنصة تيك توك...'
                    : category === 'bug'
                    ? 'مثال: عند اختيار منصة إكس لا يظهر المحتوى...'
                    : 'اكتب ملاحظتك هنا...'
                }
                rows={4}
                maxLength={2000}
                className="bg-white border-[#E8E1D2] focus-visible:border-[#0D7C66] focus-visible:ring-[#0D7C66]/20 text-right resize-none"
              />
              <div className="flex justify-between mt-1">
                <p className="text-[10px] text-[#5B564C]/60">
                  {feedback.length}/2000
                </p>
              </div>
            </div>

            {/* Contact consent */}
            <label className="flex items-start gap-2 cursor-pointer p-3 rounded-lg bg-[#FBF8F2]/60 border border-[#E8E1D2]">
              <Checkbox
                checked={contactConsent}
                onCheckedChange={(v) => setContactConsent(v === true)}
                className="mt-0.5 data-[state=checked]:bg-[#0D7C66] data-[state=checked]:border-[#0D7C66]"
              />
              <span className="text-xs text-[#5B564C] leading-relaxed">
                أسمح لفريق صدى العقار بالتواصل معي بخصوص هذه الملاحظة (اختياري)
              </span>
            </label>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isSubmitting || rating === 0 || feedback.trim().length < 5}
              className="w-full h-12 bg-[#0D7C66] hover:bg-[#0B6B58] text-white font-bold text-base rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="animate-spin size-5" />
                  جارٍ الإرسال...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  إرسال الملاحظة
                </span>
              )}
            </Button>

            <p className="text-center text-[10px] text-[#5B564C]/70">
              🔒 ملاحظاتك تُعالجة بسرية — تُستخدم فقط لتطوير المنتج
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}
