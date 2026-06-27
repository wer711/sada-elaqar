'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Check, Loader2, Users, Sparkles, Zap, ShieldCheck, PartyPopper, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { Button } from '@/components/ui/button';
import { useVisitorId } from '@/lib/visitor';

/**
 * FounderPlan — the "early supporter" subscription section (PayPal).
 *
 * Flow:
 *   1. Visitor clicks "اشترك كداعم مبكر"
 *   2. PayPal Smart Buttons render
 *   3. User pays in the PayPal popup (card / PayPal balance)
 *   4. onApprove → /api/payment/paypal/capture
 *   5. We activate the Subscription, assign founderNumber, push to Sheets
 *
 * The counter shows the REAL count of active founders (no fabrication).
 */

const FOUNDER_PRICE = 9; // USD/month — monthly subscription for sustainability
const FOUNDER_TARGET = 50; // Limited to 50 for urgency (was 100)
// Counter shown only after crossing 20 founders (40% of 50).
// Below that, a low number looks depressing. We show "كن من الأوائل" instead.
const COUNT_DISPLAY_THRESHOLD = 20;

const FOUNDER_PERKS = [
  'كتابة محتوى غير محدودة لكل عقاراتك',
  'تدقيق غير محدود لإعلاناتك القديمة (المدقق الذكي)',
  'بوصلة استثمارية ذكية لكل عقار (بيع/إيجار/استثمار)',
  'تعلّم أسلوبك التسويقي — كل محتوى يُكتب بصوتك أنت',
  'شارة «داعم مبكر» مميزة في حسابك',
  'أولوية في كل الميزات الجديدة قبل الجميع',
  'ملاحظاتك تُعرض مباشرة على خارطة الطريق (أولوية قصوى)',
  'تصويت على الميزات القادمة — رأيك يُحدّد الأولويات',
];

const FREE_PERKS = [
  '١٥ كتابة محتوى يومياً',
  'كل المنصات الـ٦',
  'بدون تسجيل حتى ٣ كتابات',
];

export default function FounderPlan() {
  const [founderCount, setFounderCount] = useState<number | null>(null);
  const [showPaypal, setShowPaypal] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [success, setSuccess] = useState<{ founderNumber: number } | null>(null);
  const [paypalClientId] = useState<string>(
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AfViq4cktwMOcmlCkccx_XoBsrseASA0Z_di5s2NCDzYPa2fv8syBhRV6MS9gIeLnPphIjD_XTEkk4-l'
  );
  const subscriptionIdRef = useRef<string | null>(null);

  const visitorId = useVisitorId();

  // Fetch the real founder count on mount
  useEffect(() => {
    async function fetchCount() {
      try {
        const res = await fetch('/api/founder/count');
        if (res.ok) {
          const data = await res.json();
          setFounderCount(typeof data.count === 'number' ? data.count : 0);
        } else {
          setFounderCount(0);
        }
      } catch {
        setFounderCount(0);
      }
    }
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const remaining = founderCount !== null ? Math.max(0, FOUNDER_TARGET - founderCount) : FOUNDER_TARGET;
  const isFull = founderCount !== null && founderCount >= FOUNDER_TARGET;
  const progressPercent = founderCount !== null ? Math.min(100, (founderCount / FOUNDER_TARGET) * 100) : 0;

  const handleSubscribeClick = useCallback(() => {
    if (!paypalClientId) {
      toast.error('الدفع غير متاح حالياً', {
        description: 'سنفعّل الدفع قريباً. سجّل مجاناً ليصلك إشعار.',
        duration: 6000,
      });
      return;
    }
    setShowPaypal(true);
    // Smooth scroll to the PayPal buttons
    setTimeout(() => {
      document.getElementById('paypal-buttons-container')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 100);
  }, [paypalClientId]);

  /* ─── Success state — shows after successful payment ─── */
  if (success) {
    return (
      <section id="founder-plan" className="py-16 md:py-24 px-4 bg-[#FBF8F2]">
        <div className="max-w-xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring', stiffness: 150 }}
            className="bg-white rounded-2xl border-2 border-[#D4A853]/30 shadow-xl overflow-hidden"
          >
            <div className="bg-gradient-to-l from-[#D4A853] to-[#E0793C] p-6 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-3"
              >
                <PartyPopper className="w-8 h-8 text-white" />
              </motion.div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">
                مبروك! أنت داعم مبكر
              </h3>
              <p className="text-white/90 text-lg font-bold">
                رقمك: #{success.founderNumber}
              </p>
            </div>
            <div className="p-6 md:p-8 space-y-4">
              <p className="text-[#211F1A] text-center text-sm md:text-base leading-relaxed">
                شكراً لثقتك! دعمك اليوم يضعك في النخبة الأولى التي تبني معنا منصة
                التسويق العقاري العربي. ستحصل على كل المزايا الحصرية فوراً.
              </p>
              <div className="rounded-xl bg-[#0D7C66]/5 border border-[#0D7C66]/15 p-4 space-y-2">
                <p className="text-sm font-bold text-[#0D7C66] text-center mb-2">
                  ماذا يحدث الآن؟
                </p>
                {[
                  'كتابة محتوى غير محدودة — استمتع بالتجربة الكاملة',
                  'سنرسل لك شارة الداعم المبكر قريباً',
                  'سنُطلعك على الميزات الجديدة قبل الجميع',
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-[#0D7C66] shrink-0 mt-0.5" strokeWidth={3} />
                    <p className="text-xs text-[#5B564C]">{item}</p>
                  </div>
                ))}
              </div>
              <a href="#demo">
                <Button className="w-full bg-[#0D7C66] hover:bg-[#0a6b58] text-white font-bold h-12 cursor-pointer">
                  ابدأ الكتابة الآن (بلا حدود)
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section id="founder-plan" className="py-16 md:py-24 px-4 bg-[#FBF8F2]">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-[#D4A853]" />
            <span className="text-sm font-semibold tracking-wide text-[#D4A853]">
              عرض العضوية المميزة — لأول ٥٠ مشتركاً فقط
            </span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-[#211F1A] mb-3">
            اشترك الآن بـ $٩ شهرياً، واحصل على مزايا احترافية كاملة
          </h2>
          <p className="text-[#5B564C] text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            لست مجرد مشترك — أنت عضو مميز يحصل على أدوات احترافية كاملة بسعر رمزي.
            كل المزايا متاحة لك دون قيود، مقابل اشتراك شهري بسيط.
          </p>
        </motion.div>

        {/* Real founder counter — shown only after crossing the threshold (40).
            Below the threshold, a low number looks depressing. We show an
            inviting "be among the first" message instead. */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-md mx-auto mb-10"
        >
          <div className="bg-white rounded-xl border border-[#D4A853]/30 p-4 shadow-sm">
            {founderCount !== null && founderCount >= COUNT_DISPLAY_THRESHOLD ? (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#D4A853]" />
                    <span className="text-xs font-bold text-[#211F1A]">الداعمون المبكرون</span>
                  </div>
                  <span className="text-sm font-black text-[#D4A853]">
                    {founderCount} / {FOUNDER_TARGET}
                  </span>
                </div>
                <div className="relative h-2 rounded-full bg-[#F5F0E8] overflow-hidden">
                  <div
                    className="absolute inset-y-0 right-0 rounded-full bg-gradient-to-l from-[#D4A853] to-[#E0793C] transition-all duration-1000"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-[#5B564C] mt-1.5 text-center">
                  {isFull
                    ? 'اكتمل العدد المبكر — شكراً لكل الداعمين!'
                    : `باقي ${remaining} مكاناً من أول ${FOUNDER_TARGET} داعم`}
                </p>
              </>
            ) : (
              /* Below threshold: inviting message instead of a depressing low number */
              <div className="flex items-center gap-3 py-1">
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#D4A853]/10 shrink-0">
                  <Crown className="w-4 h-4 text-[#D4A853]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#211F1A]">
                    كن من أوائل الداعمين
                  </p>
                  <p className="text-[10px] text-[#5B564C] mt-0.5">
                    الأماكن المبكرة متاحة — انضم للنخبة الأولى
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Free plan */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-2xl border border-[#E8E1D2] shadow-sm p-6 md:p-8"
          >
            <div className="mb-5">
              <h3 className="text-lg font-bold text-[#211F1A] mb-1">المجاني</h3>
              <p className="text-xs text-[#5B564C]">للبداية والتجربة</p>
            </div>
            <div className="mb-5">
              <span className="text-3xl font-black text-[#211F1A]">٠</span>
              <span className="text-sm text-[#5B564C] mr-1">ريال / دائماً</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {FREE_PERKS.map((perk, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#0D7C66] shrink-0 mt-0.5" strokeWidth={3} />
                  <span className="text-sm text-[#5B564C]">{perk}</span>
                </li>
              ))}
            </ul>
            <a href="#demo">
              <Button
                variant="outline"
                className="w-full border-[#0D7C66] text-[#0D7C66] hover:bg-[#0D7C66]/10 cursor-pointer"
              >
                جرّب الآن مجاناً
              </Button>
            </a>
          </motion.div>

          {/* Founder plan (highlighted) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative bg-gradient-to-br from-[#0D7C66] to-[#0a6b58] rounded-2xl shadow-xl p-6 md:p-8 text-white"
          >
            <div className="absolute -top-3 right-6">
              <div className="bg-[#D4A853] text-white text-[10px] font-black px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Sparkles className="w-3 h-3" />
                الأكثر قيمة
              </div>
            </div>

            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5 text-[#D4A853]" />
                <h3 className="text-lg font-bold">الداعم المبكر</h3>
              </div>
              <p className="text-xs text-white/80">للمؤمنين بالمشروع — اشتراك شهري رمزي</p>
            </div>
            <div className="mb-5">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black">${FOUNDER_PRICE}</span>
                <span className="text-sm text-white/70 line-through">$249</span>
              </div>
              <p className="text-xs text-white/70 mt-1">شهرياً · يمكنك الإلغاء في أي وقت</p>
            </div>
            <ul className="space-y-2.5 mb-6">
              {FOUNDER_PERKS.map((perk, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[#D4A853] shrink-0 mt-0.5" strokeWidth={3} />
                  <span className="text-sm text-white/90">{perk}</span>
                </li>
              ))}
            </ul>

            {/* Subscribe button → reveals PayPal buttons */}
            {!showPaypal ? (
              <Button
                onClick={handleSubscribeClick}
                disabled={isFull || capturing}
                className="w-full bg-[#D4A853] hover:bg-[#c4974a] text-white font-bold h-12 text-base rounded-lg shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isFull ? (
                  'اكتمل العدد المبكر'
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    اشترك كداعم مبكر — ${FOUNDER_PRICE}
                  </span>
                )}
              </Button>
            ) : (
              <div id="paypal-buttons-container" className="space-y-3">
                {capturing && (
                  <div className="flex items-center justify-center gap-2 text-white/90 text-sm py-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    جارٍ تأكيد الدفع...
                  </div>
                )}
                {paypalClientId && (
                  <div className="bg-white rounded-lg p-3">
                    <PayPalScriptProvider
                      options={{
                        clientId: paypalClientId,
                        currency: 'USD',
                        intent: 'capture',
                      }}
                    >
                      <PayPalButtons
                        style={{ layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' }}
                        // Create order: call our backend to create a PayPal order
                        createOrder={async () => {
                          const res = await fetch('/api/payment/paypal/create-order', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ visitorId }),
                          });
                          const data = await res.json();
                          if (!res.ok || !data.orderID) {
                            toast.error(data.error || data.message || 'تعذّر بدء الدفع');
                            throw new Error('Failed to create order');
                          }
                          subscriptionIdRef.current = data.subscriptionId;
                          toast.success(
                            `أنت ستكون الداعم رقم ${data.previewFounderNumber}!`,
                            { description: 'أكمل الدفع في نافذة PayPal', duration: 3000 },
                          );
                          return data.orderID;
                        }}
                        // On approval: call our backend to capture the payment
                        onApprove={async (details) => {
                          setCapturing(true);
                          try {
                            const res = await fetch('/api/payment/paypal/capture', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                orderID: details.orderID,
                                subscriptionId: subscriptionIdRef.current,
                              }),
                            });
                            const data = await res.json();
                            if (!res.ok) {
                              toast.error(data.error || 'فشل تأكيد الدفع');
                              return;
                            }
                            setSuccess({ founderNumber: data.founderNumber });
                            toast.success(data.message, { duration: 5000 });
                            // Update the counter immediately
                            setFounderCount(prev => (prev !== null ? prev + 1 : 1));
                          } catch {
                            toast.error('حدث خطأ أثناء تأكيد الدفع');
                          } finally {
                            setCapturing(false);
                          }
                        }}
                        onError={(err) => {
                          console.error('PayPal error:', err);
                          toast.error('حدث خطأ في PayPal', {
                            description: 'حاول مرة أخرى أو تواصل معنا',
                          });
                        }}
                        onCancel={() => {
                          toast.info('تم إلغاء الدفع', { description: 'يمكنك المحاولة مرة أخرى' });
                        }}
                      />
                    </PayPalScriptProvider>
                  </div>
                )}
                <button
                  onClick={() => setShowPaypal(false)}
                  className="w-full text-white/70 hover:text-white text-xs font-medium transition-colors cursor-pointer"
                >
                  إلغاء والعودة
                </button>
              </div>
            )}

            <p className="text-center text-[10px] text-white/60 mt-3 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              دفع آمن عبر PayPal (بطاقة بنكية / رصيد PayPal)
            </p>
          </motion.div>
        </div>

        {/* Comparison Table — clear gap between Free and Founder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="max-w-2xl mx-auto mt-10"
        >
          <div className="bg-white rounded-2xl border border-[#E8E1D2] shadow-sm overflow-hidden">
            <div className="grid grid-cols-3 bg-[#FBF8F2] border-b border-[#E8E1D2]">
              <div className="p-3 text-right text-xs font-bold text-[#5B564C]">الميزة</div>
              <div className="p-3 text-center text-xs font-bold text-[#5B564C]">المجاني</div>
              <div className="p-3 text-center text-xs font-bold text-[#0D7C66] bg-[#0D7C66]/5">الداعم المبكر</div>
            </div>
            {[
              { feature: 'كتابة محتوى يومياً', free: '١٥ كتابة', founder: 'غير محدود' },
              { feature: 'المنصات المدعومة', free: 'كل المنصات', founder: 'كل المنصات' },
              { feature: 'الأولوية في الميزات', free: '—', founder: 'أولوية قصوى' },
              { feature: 'السعر عند الإطلاق', free: 'مجاناً محدود', founder: 'سعر عضوية مخفّض' },
              { feature: 'شارة الداعم المبكر', free: '—', founder: '✓' },
              { feature: 'التصويت على الميزات', free: '—', founder: '✓' },
            ].map((row, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-3 ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FBF8F2]/50'} border-b border-[#E8E1D2]/50 last:border-0`}
              >
                <div className="p-2.5 text-right text-xs text-[#211F1A] font-medium">{row.feature}</div>
                <div className="p-2.5 text-center text-xs text-[#5B564C]">{row.free}</div>
                <div className="p-2.5 text-center text-xs text-[#0D7C66] font-bold bg-[#0D7C66]/5">{row.founder}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Vision note + value comparison + guarantee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-2xl mx-auto mt-8 space-y-4"
        >
          {/* Why $29 — partnership framing */}
          <div className="rounded-xl bg-gradient-to-l from-[#0D7C66]/8 to-[#D4A853]/8 border border-[#0D7C66]/15 p-5 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-[#0D7C66] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[#0D7C66] mb-1.5">
                لماذا $٩ شهرياً؟
              </p>
              <p className="text-xs md:text-sm text-[#5B564C] leading-relaxed">
                نحن نبني المقرّ الرقمي الأول لمسوّقي العقار في الوطن العربي —
                منصة متكاملة تجمع بين الذكاء والاحترافية لخدمة سوق عقاري ضخم
                ومتنامٍ. مبلغك اليوم ليس مجرد اشتراك، بل <strong>شراكة في بناء
                شيء كبير</strong> — ومقابل ذلك تحصل على مزايا حصرية للأعضاء المميزين
                بسعر <strong>أقل بكثير</strong> من سعر الإطلاق الرسمي.
              </p>
            </div>
          </div>

          {/* ROI framing — value-based pricing */}
          <div className="rounded-xl bg-[#FBF8F2] border border-[#E8E1D2] p-4 flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-[#D4A853] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[#211F1A] mb-1">
                القيمة التي توفرها
              </p>
              <p className="text-xs text-[#5B564C] leading-relaxed">
                وكيل عقاري يقضي <strong>ساعة في كتابة وصف عقار واحد</strong>.
                مع صدى العقار: <strong>٧ ثوانٍ</strong>. وفّر ٥٣ ساعة شهرياً =
                <strong className="text-[#0D7C66]"> توفير يفوق $٩ آلاف مرة شهرياً</strong>.
              </p>
            </div>
          </div>

          {/* 7-day refund guarantee */}
          <div className="rounded-xl bg-[#0D7C66]/5 border border-[#0D7C66]/20 p-4 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#0D7C66] shrink-0" />
            <p className="text-xs md:text-sm text-[#0D7C66] font-bold">
              ضمان استرداد كامل خلال ٧ أيام — بدون أسئلة.
              <span className="font-normal text-[#5B564C]"> جرّب بلا مخاطرة، فإن لم تقتنع بالقيمة، نعيد لك كل مبلغك.</span>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
