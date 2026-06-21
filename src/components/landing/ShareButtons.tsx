'use client';

import { useState, useCallback } from 'react';
import {
  Share2,
  Check,
  X,
  Copy,
  ChevronDown,
  ClipboardPaste,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

/* ─── Platform SVG icons (inline) ─── */

function XIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function FacebookIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function LinkedInIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

function WhatsAppIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function TelegramIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

function InstagramIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

interface ShareButtonsProps {
  /** The full text content to share (content + hashtags) */
  text: string;
  /** Optional URL to attach to shares */
  url?: string;
}

/**
 * ShareButtons — Social media share buttons for direct publishing.
 *
 * ─── Platform capabilities ───
 * WhatsApp, Telegram, X (Twitter): support `?text=` URL param → content is
 *   pre-filled directly in the compose box. ✅ One-click share.
 *
 * Facebook, LinkedIn, Instagram: do NOT support pre-filling text via URL.
 *   - FB/LinkedIn deprecated the `quote`/`text` params; their sharers only
 *     scrape a URL for OpenGraph (we have no hosted page per-post).
 *   - Instagram has no web share URL for text at all (image/video only).
 *   For these three we: copy the full content to clipboard → open the
 *   platform's compose page → show a PERSISTENT modal (not a toast) telling
 *   the user to paste (Ctrl+V / long-press → Paste). The modal stays open
 *   until the user confirms, so the instruction is impossible to miss.
 *
 * Native Web Share API (navigator.share): best on mobile + desktop Chrome/Edge
 * — shares text directly to whatever app the user picks.
 */

type CopyPastePlatform = {
  name: string;
  url: string;           // the compose page to open
  icon: typeof FacebookIcon;
  color: string;
  emoji: string;
};

const COPY_PASTE_PLATFORMS: Record<string, CopyPastePlatform> = {
  facebook: {
    name: 'فيسبوك',
    url: 'https://www.facebook.com/',
    icon: FacebookIcon,
    color: '#1877F2',
    emoji: '📘',
  },
  linkedin: {
    name: 'لينكدين',
    url: 'https://www.linkedin.com/feed/?shareActive=true',
    icon: LinkedInIcon,
    color: '#0A66C2',
    emoji: '💼',
  },
  instagram: {
    name: 'إنستغرام',
    url: 'https://www.instagram.com/',
    icon: InstagramIcon,
    color: '#E4405F',
    emoji: '📸',
  },
};

function canUseNativeShare(): boolean {
  if (typeof navigator === 'undefined') return false;
  return typeof navigator.share === 'function' && typeof navigator.canShare !== 'undefined';
}

export default function ShareButtons({ text, url }: ShareButtonsProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  // The "copy + paste" modal state. When set, the modal is open for that platform.
  const [pasteModal, setPasteModal] = useState<CopyPastePlatform | null>(null);
  // Whether the clipboard copy succeeded (shown in the modal)
  const [copyFailed, setCopyFailed] = useState(false);

  const shareText = encodeURIComponent(text);
  const combinedText = url ? `${text}\n\n${url}` : text;

  /* ─── Robust clipboard copy with multiple fallbacks ─── */
  const copyToClipboard = useCallback(async (): Promise<boolean> => {
    // Method 1: Modern async clipboard API (requires secure context: HTTPS or localhost)
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(combinedText);
        return true;
      } catch {
        // Fall through to method 2
      }
    }
    // Method 2: Legacy execCommand (works on HTTP, older browsers, mobile Safari)
    try {
      const ta = document.createElement('textarea');
      ta.value = combinedText;
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.opacity = '0';
      ta.style.pointerEvents = 'none';
      ta.setAttribute('readonly', '');
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) return true;
    } catch {
      // Fall through to method 3
    }
    // Method 3: Selection-based copy (last resort)
    try {
      const ta = document.createElement('textarea');
      ta.value = combinedText;
      ta.style.position = 'fixed';
      ta.style.top = '50%';
      ta.style.left = '50%';
      ta.style.transform = 'translate(-50%, -50%)';
      ta.style.opacity = '1';
      ta.style.width = '90%';
      ta.style.maxWidth = '500px';
      ta.style.height = '200px';
      ta.style.zIndex = '99999';
      ta.setAttribute('readonly', '');
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      // Show a toast telling the user to press Ctrl+C
      toast.info('اضغط Ctrl+C للنسخ', { description: 'ثم أغلق هذه النافذة', duration: 8000 });
      // Remove after 10s if they don't copy
      setTimeout(() => {
        if (document.body.contains(ta)) document.body.removeChild(ta);
      }, 10000);
      return true; // optimistically return true — the user will copy manually
    } catch {
      return false;
    }
  }, [combinedText]);

  /* ─── Generic popup opener ─── */
  const openShareWindow = useCallback((shareUrl: string, platformName: string) => {
    const win = window.open(shareUrl, '_blank', 'noopener,noreferrer,width=620,height=540');
    if (!win || win.closed || typeof win.closed === 'undefined') {
      // Popup blocked — copy + show the paste modal as fallback
      toast.warning(`تم منع فتح ${platformName}`, { description: 'سننسخ المحتوى لك بدلاً من ذلك', duration: 4000 });
    } else {
      toast.success(`جارٍ فتح ${platformName}...`, { duration: 2000 });
    }
    setShowMenu(false);
  }, []);

  /* ─── One-click platforms (pre-fill text via URL) ─── */
  const handleWhatsApp = useCallback(() => {
    openShareWindow(`https://wa.me/?text=${shareText}`, 'واتساب');
  }, [openShareWindow, shareText]);

  const handleTelegram = useCallback(() => {
    const tUrl = url ? encodeURIComponent(url) : '';
    const tParams = tUrl
      ? `url=${tUrl}&text=${shareText}`
      : `url=${encodeURIComponent(' ')}&text=${shareText}`;
    openShareWindow(`https://t.me/share/url?${tParams}`, 'تيليجرام');
  }, [openShareWindow, shareText, url]);

  const handleX = useCallback(() => {
    const xUrl = url ? `&url=${encodeURIComponent(url)}` : '';
    openShareWindow(`https://twitter.com/intent/tweet?text=${shareText}${xUrl}`, 'إكس');
  }, [openShareWindow, shareText, url]);

  /* ─── Copy + paste platforms (FB / LinkedIn / Instagram) ───
   * These platforms don't allow pre-filling text via URL. So we:
   *   1. Copy the full content to clipboard (with multiple fallbacks)
   *   2. Open the platform's compose page in a new tab
   *   3. Show a PERSISTENT modal that tells the user to paste (Ctrl+V)
   * The modal stays open until the user clicks "تم اللصق، أغلق" — this
   * guarantees the instruction is seen, unlike a disappearing toast. */
  const handleCopyPastePlatform = useCallback(async (platformKey: string) => {
    const platform = COPY_PASTE_PLATFORMS[platformKey];
    if (!platform) return;
    setShowMenu(false);

    const ok = await copyToClipboard();
    setCopyFailed(!ok);

    // Open the compose page in a new tab (do this regardless of copy success,
    // because the user might still paste from a previous copy or type manually)
    window.open(platform.url, '_blank', 'noopener,noreferrer');

    // Show the persistent paste modal
    setPasteModal(platform);
  }, [copyToClipboard]);

  /* ─── Native Web Share API ─── */
  const handleNativeShare = useCallback(async () => {
    if (canUseNativeShare()) {
      try {
        await navigator.share({
          title: 'صدى العقار — محتوى تسويقي',
          text: combinedText,
          url: url || undefined,
        });
        setShowMenu(false);
        return;
      } catch {
        // user cancelled — fall through to opening the menu
      }
    }
    setShowMenu(prev => !prev);
  }, [combinedText, url]);

  /* ─── Copy button (always available) ─── */
  const handleCopyLink = useCallback(async () => {
    const ok = await copyToClipboard();
    if (ok) {
      setCopied(true);
      toast.success('تم النسخ!', { description: 'المحتوى جاهز للصق في أي مكان', duration: 2500 });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('فشل النسخ', { description: 'حاول مرة أخرى أو انسخ يدوياً' });
    }
  }, [copyToClipboard]);

  /* ─── Re-copy from inside the paste modal (if the first copy failed) ─── */
  const handleRetryCopy = useCallback(async () => {
    const ok = await copyToClipboard();
    setCopyFailed(!ok);
    if (ok) {
      toast.success('تم النسخ بنجاح!', { duration: 2000 });
    }
  }, [copyToClipboard]);

  const nativeShareAvailable = canUseNativeShare();

  // One-click platforms (pre-fill text directly)
  const directShareOptions = [
    { name: 'واتساب', icon: WhatsAppIcon, color: 'hover:bg-[#25D366] hover:text-white hover:border-[#25D366]', handler: handleWhatsApp },
    { name: 'تيليجرام', icon: TelegramIcon, color: 'hover:bg-[#0088cc] hover:text-white hover:border-[#0088cc]', handler: handleTelegram },
    { name: 'إكس', icon: XIcon, color: 'hover:bg-[#0F1419] hover:text-white hover:border-[#0F1419]', handler: handleX },
  ];

  // Copy+paste platforms (open compose + show paste modal)
  const copyPasteOptions = [
    { name: 'فيسبوك', icon: FacebookIcon, color: 'hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2]', key: 'facebook' as const },
    { name: 'لينكدين', icon: LinkedInIcon, color: 'hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]', key: 'linkedin' as const },
    { name: 'إنستغرام', icon: InstagramIcon, color: 'hover:bg-[#E4405F] hover:text-white hover:border-[#E4405F]', key: 'instagram' as const },
  ];

  return (
    <>
      <div className="relative">
        {/* Main share button */}
        <button
          onClick={() => setShowMenu(prev => !prev)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#0D7C66] hover:bg-[#0a6b58] text-white font-bold text-sm transition-all cursor-pointer shadow-sm hover:shadow-md"
          aria-expanded={showMenu}
          aria-haspopup="menu"
        >
          <Share2 className="h-4 w-4" />
          <span>مشاركة المنشور</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showMenu ? 'rotate-180' : ''}`} />
        </button>

        {/* Expandable share options */}
        {showMenu && (
          <div className="mt-2 p-2 bg-white rounded-xl border border-[#E8E1D2] shadow-lg" role="menu">
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <span className="text-xs font-bold text-[#5B564C]">شارك عبر:</span>
              <button
                onClick={() => setShowMenu(false)}
                className="text-[#5B564C] hover:text-[#211F1A] cursor-pointer p-1 rounded hover:bg-[#F5F0E8]"
                aria-label="إغلاق"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Native share — best experience on mobile */}
            {nativeShareAvailable && (
              <button
                onClick={handleNativeShare}
                className="mb-1.5 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-[#0D7C66]/8 hover:bg-[#0D7C66]/15 border border-[#0D7C66]/25 text-[#0D7C66] text-xs font-bold transition-all cursor-pointer"
              >
                <Share2 className="h-3.5 w-3.5" />
                مشاركة عبر تطبيقات الجهاز (الأسرع)
              </button>
            )}

            {/* Direct-share platforms (one-click, text pre-filled) */}
            <div className="grid grid-cols-3 gap-1.5">
              {directShareOptions.map(opt => {
                const { icon: Icon } = opt;
                return (
                  <button
                    key={opt.name}
                    onClick={opt.handler}
                    title={`${opt.name} — المحتوى يُملأ تلقائياً`}
                    role="menuitem"
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border border-[#E8E1D2] text-[#5B564C] transition-all cursor-pointer ${opt.color}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[9px] font-bold">{opt.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Divider */}
            <div className="my-1.5 flex items-center gap-2 px-2">
              <div className="flex-1 h-px bg-[#E8E1D2]" />
              <span className="text-[9px] text-[#5B564C]/70 font-medium">نسخ + لصق</span>
              <div className="flex-1 h-px bg-[#E8E1D2]" />
            </div>

            {/* Copy+paste platforms (FB / LinkedIn / Instagram) */}
            <div className="grid grid-cols-3 gap-1.5">
              {copyPasteOptions.map(opt => {
                const { icon: Icon } = opt;
                return (
                  <button
                    key={opt.name}
                    onClick={() => handleCopyPastePlatform(opt.key)}
                    title={`${opt.name} — نسخ المحتوى ثم فتح المنشور`}
                    role="menuitem"
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border border-[#E8E1D2] text-[#5B564C] transition-all cursor-pointer ${opt.color}`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-[9px] font-bold">{opt.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Hint explaining the two flows */}
            <p className="mt-2 px-2 text-[10px] text-[#5B564C]/80 leading-relaxed">
              💡 <strong>واتساب/تيليجرام/إكس:</strong> المحتوى يُملأ تلقائياً.
              <br />
              💡 <strong>فيسبوك/لينكدين/إنستغرام:</strong> يُنسخ المحتوى + تفتح صفحة المنشور — الصق بضغطة (Ctrl+V).
            </p>

            <button
              onClick={handleCopyLink}
              className="mt-1.5 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[#FBF8F2] hover:bg-[#F5F0E8] border border-[#E8E1D2] text-[#211F1A] text-xs font-bold transition-all cursor-pointer"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#0D7C66]" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'تم النسخ!' : 'نسخ المحتوى كاملاً'}
            </button>
          </div>
        )}
      </div>

      {/* ─── Persistent "copy + paste" modal for FB/LinkedIn/Instagram ───
       * This modal stays open until the user clicks "تم اللصق، أغلق".
       * Unlike a toast, it's impossible to miss. */}
      <Dialog open={!!pasteModal} onOpenChange={(open) => !open && setPasteModal(null)}>
        <DialogContent
          className="max-w-md p-0 gap-0 overflow-hidden bg-white"
          dir="rtl"
        >
          <DialogHeader className="px-6 py-5 border-b border-[#E8E1D2]">
            <DialogTitle className="flex items-center gap-3 text-right text-lg font-bold text-[#211F1A]">
              {pasteModal && (
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: pasteModal.color }}
                >
                  <pasteModal.icon className="h-5 w-5" />
                </span>
              )}
              <div>
                <div>تم نسخ المحتوى لـ{pasteModal?.name}</div>
                <DialogDescription className="text-xs text-[#5B564C] mt-0.5">
                  {pasteModal?.emoji} الصق المحتوى الآن في صفحة {pasteModal?.name}
                </DialogDescription>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4">
            {/* Success state */}
            {!copyFailed ? (
              <div className="rounded-xl bg-[#0D7C66]/8 border border-[#0D7C66]/20 p-4 flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0D7C66] shrink-0">
                  <Check className="h-4 w-4 text-white" strokeWidth={3} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0D7C66]">المحتوى في الحافظة!</p>
                  <p className="text-xs text-[#5B564C] mt-1 leading-relaxed">
                    عُد إلى صفحة {pasteModal?.name} التي فُتحت في تبويب جديد،
                    واضغط في حقل المنشور ثم:
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-[#E0793C]/8 border border-[#E0793C]/30 p-4 flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E0793C] shrink-0">
                  <X className="h-4 w-4 text-white" strokeWidth={3} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-[#E0793C]">تعذّر النسخ التلقائي</p>
                  <p className="text-xs text-[#5B564C] mt-1 leading-relaxed">
                    بعض المتصفحات تمنع النسخ التلقائي. اضغط الزر أدناه للنسخ،
                    ثم الصق في صفحة {pasteModal?.name}.
                  </p>
                </div>
              </div>
            )}

            {/* Paste instructions — big and impossible to miss */}
            <div className="rounded-xl bg-[#FBF8F2] border border-[#E8E1D2] p-4">
              <p className="text-xs font-bold text-[#211F1A] mb-2 flex items-center gap-1.5">
                <ClipboardPaste className="h-3.5 w-3.5 text-[#0D7C66]" />
                طريقة اللصق:
              </p>
              <div className="space-y-1.5 text-xs text-[#5B564C]">
                <p>
                  <span className="font-bold text-[#211F1A]">١.</span> اذهب إلى تبويب {pasteModal?.name} الذي فُتح
                </p>
                <p>
                  <span className="font-bold text-[#211F1A]">٢.</span> اضغط في حقل «كتابة منشور»
                </p>
                <p>
                  <span className="font-bold text-[#211F1A]">٣.</span>{' '}
                  <kbd className="inline-block px-1.5 py-0.5 bg-white border border-[#E8E1D2] rounded text-[10px] font-mono">Ctrl</kbd>
                  {' + '}
                  <kbd className="inline-block px-1.5 py-0.5 bg-white border border-[#E8E1D2] rounded text-[10px] font-mono">V</kbd>
                  {' '}
                  <span className="text-[#5B564C]/70">(أو ضغطة طويلة → لصق على الجوال)</span>
                </p>
                <p>
                  <span className="font-bold text-[#211F1A]">٤.</span> انشر منشورك!
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              {/* Re-open the platform tab (in case they closed it) */}
              <a
                href={pasteModal?.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-bold transition-all cursor-pointer"
                style={{ backgroundColor: pasteModal?.color }}
              >
                <ExternalLink className="h-4 w-4" />
                فتح صفحة {pasteModal?.name} مجدداً
              </a>

              {copyFailed && (
                <button
                  onClick={handleRetryCopy}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#FBF8F2] hover:bg-[#F5F0E8] border border-[#E8E1D2] text-[#211F1A] text-sm font-bold transition-all cursor-pointer"
                >
                  <Copy className="h-4 w-4" />
                  إعادة محاولة النسخ
                </button>
              )}

              <button
                onClick={() => setPasteModal(null)}
                className="w-full px-4 py-2 rounded-lg text-[#5B564C] hover:text-[#211F1A] text-sm font-bold transition-all cursor-pointer"
              >
                تم اللصق، أغلق
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
