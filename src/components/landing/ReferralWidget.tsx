'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Share2, Copy, Check, Users, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useVisitorId, useReferralLink, useDailyGenerationCount } from '@/lib/visitor';

interface ReferralWidgetProps {
  /** Show after a successful generation to encourage sharing */
  showAfterGeneration?: boolean;
}

/**
 * ReferralWidget — the viral growth loop component.
 *
 * Appears after a visitor writes content (showAfterGeneration=true).
 * Offers them their unique referral link + explains the reward:
 * "شارك مع أصدقائك واحصل على محاولات إضافية"
 *
 * Rewards:
 * - Friend clicks link → +3 generations
 * - Friend registers → +10 generations
 * - Friend becomes founder → +20 generations
 */
export default function ReferralWidget({ showAfterGeneration = false }: ReferralWidgetProps) {
  const [copied, setCopied] = useState(false);
  const visitorId = useVisitorId();
  const referralLink = useReferralLink(visitorId);
  const daily = useDailyGenerationCount();

  const handleCopyLink = useCallback(async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success('تم نسخ رابطك!', {
        description: 'شاركه مع أصدقائك — كل صديق يزور الموقع = +٣ محاولات لك',
        duration: 4000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = referralLink;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      toast.success('تم نسخ رابطك!', { duration: 3000 });
      setTimeout(() => setCopied(false), 2000);
    }
  }, [referralLink]);

  const handleShareWhatsApp = useCallback(() => {
    if (!referralLink) return;
    const text = encodeURIComponent(
      `🚀 اكتشفت صدى العقار — أداة تكتب محتوى تسويقي عقاري احترافي في ثوانٍ!\n\nجرّبها مجاناً: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  }, [referralLink]);

  // Don't render if no link yet (still loading) or not needed
  if (!referralLink || !showAfterGeneration) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.4, delay: 0.5 }}
        className="mt-4 rounded-xl border border-[#D4A853]/30 bg-gradient-to-l from-[#D4A853]/8 to-[#0D7C66]/5 p-4"
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-[#D4A853]/15 shrink-0">
            <Gift className="w-4 h-4 text-[#D4A853]" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#211F1A]">
              احصل على محاولات إضافية مجاناً
            </p>
            <p className="text-xs text-[#5B564C] mt-0.5 leading-relaxed">
              شارك رابطك مع أصدقائك — كل صديق يزور الموقع يمنحك <strong className="text-[#0D7C66]">محاولة إضافية</strong>،
              وإذا سجّل تحصل على <strong className="text-[#0D7C66]">+٨ محاولات</strong>، وإذا اشترك <strong className="text-[#0D7C66]">+٢٠ محاولة</strong>!
            </p>
          </div>
        </div>

        {/* Current bonus */}
        {daily.referralBonus > 0 && (
          <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-[#0D7C66]/8 border border-[#0D7C66]/15">
            <Plus className="w-3.5 h-3.5 text-[#0D7C66]" />
            <p className="text-xs font-bold text-[#0D7C66]">
              لديك {daily.referralBonus} محاولة إضافية اليوم من الإحالات!
            </p>
          </div>
        )}

        {/* Referral link + copy */}
        <div className="flex gap-2 items-center">
          <div className="flex-1 px-3 py-2 rounded-lg bg-white border border-[#E8E1D2] text-xs text-[#5B564C] truncate font-mono" dir="ltr">
            {referralLink}
          </div>
          <Button
            onClick={handleCopyLink}
            size="sm"
            className="bg-[#0D7C66] hover:bg-[#0a6b58] text-white h-9 px-3 cursor-pointer shrink-0"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </Button>
        </div>

        {/* Share buttons */}
        <div className="flex gap-2 mt-2">
          <Button
            onClick={handleShareWhatsApp}
            size="sm"
            className="flex-1 bg-[#25D366] hover:bg-[#20BD5A] text-white text-xs h-9 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5 ml-1" />
            شارك على واتساب
          </Button>
        </div>

        {/* Reward tiers */}
        <div className="flex items-center justify-around mt-3 pt-3 border-t border-[#E8E1D2]/50">
          <div className="text-center">
            <p className="text-[10px] text-[#5B564C]">صديق يزور</p>
            <p className="text-sm font-black text-[#0D7C66]">+١</p>
          </div>
          <div className="w-px h-8 bg-[#E8E1D2]" />
          <div className="text-center">
            <p className="text-[10px] text-[#5B564C]">صديق يسجّل</p>
            <p className="text-sm font-black text-[#D4A853]">+٨</p>
          </div>
          <div className="w-px h-8 bg-[#E8E1D2]" />
          <div className="text-center">
            <p className="text-[10px] text-[#5B564C]">صديق يشترك</p>
            <p className="text-sm font-black text-[#E0793C]">+٢٠</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
