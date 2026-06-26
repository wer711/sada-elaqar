'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, CheckCircle2, XCircle, Lightbulb, Star, TrendingUp, Sparkles, Copy, Check, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useVisitorId } from '@/lib/visitor';

const PLATFORMS = [
  { value: 'whatsapp', label: 'واتساب' },
  { value: 'twitter', label: 'إكس (تويتر)' },
  { value: 'instagram', label: 'إنستغرام' },
  { value: 'snapchat', label: 'سناب شات' },
  { value: 'linkedin', label: 'لينكدين' },
  { value: 'facebook', label: 'فيسبوك' },
];

const FREE_IMPROVE_LIMIT = 3; // 3 free improvements, then paywall

interface AuditResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}

interface ImproveResult {
  improvedAd: string;
  originalScore: number;
  improvedScore: number;
}

export default function SmartAuditor() {
  const [adText, setAdText] = useState('');
  const [platform, setPlatform] = useState('whatsapp');
  const [city, setCity] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [improved, setImproved] = useState<ImproveResult | null>(null);
  const [improveCount, setImproveCount] = useState(0);
  const [showPaywall, setShowPaywall] = useState(false);
  const [copiedImproved, setCopiedImproved] = useState(false);
  const visitorId = useVisitorId();

  // Load improve count from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('sada_improve_count');
      if (stored) setImproveCount(parseInt(stored, 10) || 0);
    } catch { /* ignore */ }
  }, []);

  // ── Audit (free, unlimited) ──
  const handleAudit = useCallback(async () => {
    if (adText.trim().length < 10) {
      toast.error('الصق نص الإعلان', { description: '١٠ أحرف على الأقل' });
      return;
    }

    setIsAuditing(true);
    setResult(null);
    setImproved(null);
    setShowPaywall(false);

    try {
      const fetchFn = (typeof window !== 'undefined' && window.__safeFetch) || fetch;
      const res = await fetchFn('/api/demo/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adText: adText.trim(), platform, city, visitorId }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'تعذّر التحليل'); return; }

      setResult(data);
      (window.__sadaSafeTrack || (() => {}))('audit', {
        label: 'تدقيق منشور قديم',
        category: 'engagement',
        value: data.score,
      });
    } catch {
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setIsAuditing(false);
    }
  }, [adText, platform, city, visitorId]);

  // ── Improve (3 free, then paywall) ──
  const handleImprove = useCallback(async () => {
    if (!result) return;

    // Check free limit
    if (improveCount >= FREE_IMPROVE_LIMIT) {
      setShowPaywall(true);
      toast.warning('انتهت محاولاتك المجانية للتحسين', {
        description: 'اشترك كداعم مبكر للتحسين غير المحدود + كل المزايا الحصرية',
        duration: 6000,
        action: {
          label: 'اشترك الآن',
          onClick: () => document.getElementById('founder-plan')?.scrollIntoView({ behavior: 'smooth' }),
        },
      });
      return;
    }

    setIsImproving(true);
    setImproved(null);

    try {
      const fetchFn = (typeof window !== 'undefined' && window.__safeFetch) || fetch;
      const res = await fetchFn('/api/demo/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adText: adText.trim(),
          platform,
          city,
          visitorId,
          weaknesses: result.weaknesses,
          suggestions: result.suggestions,
          score: result.score,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || 'تعذّر التحسين'); return; }

      setImproved(data);
      // Increment count
      const newCount = improveCount + 1;
      setImproveCount(newCount);
      try { localStorage.setItem('sada_improve_count', String(newCount)); } catch { /* ignore */ }

      (window.__sadaSafeTrack || (() => {}))('improve', {
        label: 'تحسين إعلان قديم',
        category: 'conversion',
        value: 1,
      });

      toast.success('تم تحسين إعلانك!', {
        description: newCount < FREE_IMPROVE_LIMIT
          ? `باقي ${FREE_IMPROVE_LIMIT - newCount} محاولات تحسين مجانية`
          : 'هذه آخر محاولة مجانية — اشترك للمتابعة',
        duration: 4000,
      });
    } catch {
      toast.error('حدث خطأ في الاتصال');
    } finally {
      setIsImproving(false);
    }
  }, [adText, platform, city, visitorId, result, improveCount]);

  // ── Copy improved ad ──
  const handleCopyImproved = useCallback(async () => {
    if (!improved?.improvedAd) return;
    try {
      await navigator.clipboard.writeText(improved.improvedAd);
      setCopiedImproved(true);
      toast.success('تم نسخ الإعلان المحسّن!', { duration: 2500 });
      setTimeout(() => setCopiedImproved(false), 2000);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = improved.improvedAd;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedImproved(true);
      setTimeout(() => setCopiedImproved(false), 2000);
    }
  }, [improved]);

  const resetAudit = () => {
    setAdText('');
    setResult(null);
    setImproved(null);
    setShowPaywall(false);
    setCity('');
  };

  // Score styling
  const scoreColor = result
    ? result.score >= 8 ? 'text-[#0D7C66]'
    : result.score >= 5 ? 'text-[#D4A853]'
    : 'text-[#E0793C]' : '';
  const scoreBg = result
    ? result.score >= 8 ? 'bg-[#0D7C66]/10 border-[#0D7C66]/30'
    : result.score >= 5 ? 'bg-[#D4A853]/10 border-[#D4A853]/30'
    : 'bg-[#E0793C]/10 border-[#E0793C]/30' : '';
  const scoreLabel = result
    ? result.score >= 9 ? 'ممتاز'
    : result.score >= 7 ? 'جيد'
    : result.score >= 5 ? 'متوسط'
    : result.score >= 3 ? 'ضعيف'
    : 'سيء' : '';

  return (
    <section id="auditor" className="py-16 md:py-20 px-4 bg-gradient-to-b from-[#F5F0E8] to-[#FBF8F2]">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <Search className="w-5 h-5 text-[#0D7C66]" />
            <span className="text-sm font-semibold tracking-wide text-[#0D7C66]">
              المدقق الذكي
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#211F1A] mb-2">
            هل إعلانك القديم فعّال؟ احصل على تقييم فوري + تحسين
          </h2>
          <p className="text-[#5B564C] text-sm md:text-base leading-relaxed">
            الصق نص أي إعلان عقاري، سنحلّله فوراً (درجة + نقاط قوة/ضعف) ثم نحسّنه لك إلى ١٠/١٠
          </p>
        </motion.div>

        {/* Form / Result */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {!result ? (
            /* ─── Audit Form ─── */
            <div className="bg-white rounded-2xl border border-[#E8E1D2] shadow-sm p-6 md:p-8 space-y-5">
              <div>
                <Label className="text-[#211F1A] font-semibold text-sm mb-2 block">
                  الصق نص إعلانك العقاري <span className="text-[#DC3545]">*</span>
                </Label>
                <Textarea
                  value={adText}
                  onChange={(e) => setAdText(e.target.value)}
                  placeholder="مثال: شقة للبيع في حي النرجس، مساحة ١٥٠ م²، ٣ غرف، سعر ٨٥٠ ألف ريال. تواصل إذا مهتم."
                  rows={6}
                  maxLength={3000}
                  className="bg-white border-[#E8E1D2] focus-visible:border-[#0D7C66] focus-visible:ring-[#0D7C66]/20 text-right resize-none"
                />
                <p className="text-[10px] text-[#5B564C]/60 mt-1">{adText.length}/3000</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-[#211F1A] font-semibold text-xs mb-1.5 block">المنصة</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="h-10 bg-white border-[#E8E1D2]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#211F1A] font-semibold text-xs mb-1.5 block">المدينة (اختياري)</Label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="مثال: الرياض"
                    className="w-full h-10 px-3 rounded-md border border-[#E8E1D2] bg-white text-sm text-right focus:border-[#0D7C66] focus:outline-none"
                  />
                </div>
              </div>

              <Button
                onClick={handleAudit}
                disabled={isAuditing || adText.trim().length < 10}
                className="w-full h-12 bg-[#0D7C66] hover:bg-[#0B6B58] text-white font-bold text-base rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAuditing ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin size-5" />
                    جارٍ التحليل...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    فحص الإعلان الآن
                  </span>
                )}
              </Button>

              <p className="text-center text-[10px] text-[#5B564C]/70">
                🔍 مجاني تماماً — لا يحتاج تسجيل
              </p>
            </div>
          ) : (
            /* ─── Audit Result + Improve ─── */
            <AnimatePresence mode="wait">
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl border border-[#E8E1D2] shadow-lg p-6 md:p-8 space-y-5"
              >
                {/* Score */}
                <div className={`rounded-xl border-2 ${scoreBg} p-5 text-center`}>
                  <p className="text-xs font-bold text-[#5B564C] mb-1">درجة إعلانك الحالي</p>
                  <p className={`text-5xl font-black ${scoreColor}`}>
                    {result.score}<span className="text-2xl text-[#5B564C]/50">/١٠</span>
                  </p>
                  <p className={`text-sm font-bold ${scoreColor} mt-1`}>{scoreLabel}</p>
                </div>

                {/* Strengths */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-[#0D7C66]" />
                    <p className="text-sm font-bold text-[#0D7C66]">نقاط القوة</p>
                  </div>
                  <ul className="space-y-1.5">
                    {result.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#5B564C]">
                        <span className="text-[#0D7C66] mt-0.5">✓</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-[#E0793C]" />
                    <p className="text-sm font-bold text-[#E0793C]">نقاط الضعف</p>
                  </div>
                  <ul className="space-y-1.5">
                    {result.weaknesses.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#5B564C]">
                        <span className="text-[#E0793C] mt-0.5">✗</span>{w}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggestions */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-[#D4A853]" />
                    <p className="text-sm font-bold text-[#D4A853]">اقتراحات التحسين</p>
                  </div>
                  <ul className="space-y-1.5">
                    {result.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#5B564C]">
                        <span className="text-[#D4A853] mt-0.5">💡</span>{s}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* ─── IMPROVE BUTTON ─── */}
                {!improved && !showPaywall && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="pt-2"
                  >
                    <Button
                      onClick={handleImprove}
                      disabled={isImproving}
                      data-sada-track="improve-btn"
                      data-sada-category="conversion"
                      className="w-full h-12 bg-gradient-to-l from-[#0D7C66] to-[#0a6b58] hover:from-[#0a6b58] hover:to-[#095a4b] text-white font-bold text-base rounded-lg shadow-lg transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isImproving ? (
                        <span className="flex items-center gap-2">
                          <Loader2 className="animate-spin size-5" />
                          جارٍ تحسين إعلانك...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5" />
                          ✨ حسّن إعلانك إلى ١٠/١٠
                          {improveCount < FREE_IMPROVE_LIMIT && (
                            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                              باقي {FREE_IMPROVE_LIMIT - improveCount} مجانية
                            </span>
                          )}
                        </span>
                      )}
                    </Button>
                  </motion.div>
                )}

                {/* ─── IMPROVED RESULT ─── */}
                {improved && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="space-y-4"
                  >
                    {/* Score comparison */}
                    <div className="flex items-center justify-center gap-4 py-3">
                      <div className="text-center">
                        <p className="text-[10px] text-[#5B564C] mb-1">قبل</p>
                        <p className="text-2xl font-black text-[#E0793C]">{improved.originalScore}/١٠</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-[#0D7C66] rotate-180" />
                      <div className="text-center">
                        <p className="text-[10px] text-[#5B564C] mb-1">بعد</p>
                        <p className="text-2xl font-black text-[#0D7C66]">١٠/١٠</p>
                      </div>
                    </div>

                    {/* Improved ad text */}
                    <div className="rounded-xl border-2 border-[#0D7C66]/30 bg-[#0D7C66]/5 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-bold text-[#0D7C66] flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4" />
                          الإعلان المحسّن (جاهز للنشر)
                        </p>
                        <Button
                          onClick={handleCopyImproved}
                          size="sm"
                          variant="outline"
                          className="h-8 px-2 text-xs border-[#0D7C66]/30 text-[#0D7C66] hover:bg-[#0D7C66]/10 cursor-pointer"
                        >
                          {copiedImproved ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copiedImproved ? 'تم النسخ' : 'نسخ'}
                        </Button>
                      </div>
                      <p className="text-sm text-[#211F1A] leading-relaxed whitespace-pre-wrap">
                        {improved.improvedAd}
                      </p>
                    </div>

                    {/* Remaining free attempts */}
                    {improveCount < FREE_IMPROVE_LIMIT ? (
                      <p className="text-center text-xs text-[#5B564C]">
                        ✨ باقي {FREE_IMPROVE_LIMIT - improveCount} محاولات تحسين مجانية
                      </p>
                    ) : (
                      <div className="rounded-xl border border-[#D4A853]/30 bg-gradient-to-l from-[#D4A853]/8 to-[#FBF8F2] p-4">
                        <div className="flex items-start gap-3">
                          <Star className="w-5 h-5 text-[#D4A853] shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-[#211F1A]">
                              انتهت محاولاتك المجانية
                            </p>
                            <p className="text-xs text-[#5B564C] mt-1 leading-relaxed">
                              اشترك كداعم مبكر للتحسين غير المحدود + كل المزايا الحصرية الأخرى.
                            </p>
                            <a href="#founder-plan" className="inline-block mt-2">
                              <Button size="sm" className="bg-[#D4A853] hover:bg-[#c4974a] text-white text-xs cursor-pointer">
                                <TrendingUp className="w-3 h-3 ml-1" />
                                اشترك الآن — $٩/شهر
                              </Button>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ─── Paywall (when limit reached without improvement) ─── */}
                {showPaywall && !improved && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl border border-[#D4A853]/30 bg-gradient-to-l from-[#D4A853]/8 to-[#FBF8F2] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <Star className="w-5 h-5 text-[#D4A853] shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-[#211F1A]">
                          انتهت محاولاتك المجانية للتحسين
                        </p>
                        <p className="text-xs text-[#5B564C] mt-1 leading-relaxed">
                          اشترك كداعم مبكر للتحسين غير المحدود + إعادة كتابة فورية + كل المزايا الحصرية.
                        </p>
                        <a href="#founder-plan" className="inline-block mt-2">
                          <Button size="sm" className="bg-[#D4A853] hover:bg-[#c4974a] text-white text-xs cursor-pointer">
                            <TrendingUp className="w-3 h-3 ml-1" />
                            اشترك الآن — $٩/شهر
                          </Button>
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Reset */}
                <Button
                  onClick={resetAudit}
                  variant="outline"
                  className="w-full border-[#E8E1D2] text-[#5B564C] hover:bg-[#F5F0E8] cursor-pointer"
                >
                  فحص إعلان آخر
                </Button>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>
    </section>
  );
}
