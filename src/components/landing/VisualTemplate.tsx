'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Loader2, Image as ImageIcon, Instagram, Twitter } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { GeneratedContent } from '@/lib/ai-types';

interface VisualTemplateProps {
  content: GeneratedContent | null;
  platform: 'instagram' | 'twitter';
  propertyName?: string;
  location?: string;
  price?: string;
  features?: string[];
}

/**
 * VisualTemplate — renders a professional real estate post as an HTML/CSS
 * card, then uses html2canvas-pro to download it as a PNG image.
 *
 * Two templates:
 * - Instagram: 1080×1350 (vertical, detailed)
 * - Twitter/X: 1200×675 (landscape, compact)
 *
 * Colors: Blue (#1a3a5c) + Gold (#D4A853) + White — professional real estate
 * aesthetic that works across Arab markets.
 */
export default function VisualTemplate({
  content,
  platform,
  propertyName,
  location,
  price,
  features,
}: VisualTemplateProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const templateRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(async () => {
    if (!templateRef.current) return;
    setIsDownloading(true);

    try {
      const html2canvas = (await import('html2canvas-pro')).default;
      const canvas = await html2canvas(templateRef.current, {
        backgroundColor: '#ffffff',
        scale: 2, // 2x resolution for crisp output
        useCORS: true,
        logging: false,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('فشل إنشاء الصورة');
          return;
        }
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sada-aqar-${platform}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('تم تنزيل الصورة!', { duration: 2500 });
      }, 'image/png');
    } catch (err) {
      console.error('Download error:', err);
      toast.error('فشل التنزيل', { description: 'حاول مرة أخرى' });
    } finally {
      setIsDownloading(false);
    }
  }, [platform]);

  if (!content) return null;

  // Extract data from content
  const rp = content.resolvedProperty;
  const title = propertyName || content.headline || rp.type;
  const loc = location || rp.location || '';
  const pr = price || rp.price || '';
  const feats = features || rp.features || [];
  const mainText = content.content;

  // Parse content into lines for display
  const contentLines = mainText.split('\n').filter(l => l.trim()).slice(0, 8);

  // ─── Instagram Template (1080×1350 vertical) ───
  if (platform === 'instagram') {
    return (
      <div className="space-y-3">
        {/* Download button */}
        <div className="flex justify-center">
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-[#0D7C66] hover:bg-[#0a6b58] text-white font-bold h-10 px-6 cursor-pointer"
          >
            {isDownloading ? (
              <><Loader2 className="w-4 h-4 animate-spin ml-1" /> جارٍ الإنشاء...</>
            ) : (
              <><Download className="w-4 h-4 ml-1" /> تنزيل كصورة (إنستغرام)</>
            )}
          </Button>
        </div>

        {/* Template — scaled down for preview, but renders at 1080×1350 internally */}
        <div className="flex justify-center overflow-hidden rounded-xl border border-[#E8E1D2] shadow-lg">
          <div
            ref={templateRef}
            style={{
              width: '540px', // Half of 1080 for preview (html2canvas scales 2x)
              minHeight: '675px', // Half of 1350
              background: 'linear-gradient(135deg, #1a3a5c 0%, #2c5f8a 100%)',
              fontFamily: 'Tajawal, sans-serif',
              direction: 'rtl',
              padding: '24px',
              color: '#ffffff',
              position: 'relative',
            }}
          >
            {/* Header banner */}
            <div style={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              padding: '10px 16px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '16px', fontWeight: 800 }}>
                {rp.type}
              </span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>
                {loc}
              </span>
            </div>

            {/* Title */}
            <h2 style={{
              fontSize: '24px',
              fontWeight: 900,
              marginBottom: '8px',
              color: '#D4A853',
              lineHeight: 1.3,
            }}>
              ✨ {title}
            </h2>

            {/* Location pin */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '16px',
              fontSize: '14px',
              opacity: 0.9,
            }}>
              📍 {loc}
            </div>

            {/* Property image placeholder */}
            <div style={{
              width: '100%',
              height: '180px',
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '12px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px dashed rgba(212,168,83,0.4)',
            }}>
              <span style={{ fontSize: '14px', opacity: 0.6 }}>
                📸 صورة العقار (ستظهر هنا لاحقاً)
              </span>
            </div>

            {/* Specs row */}
            {feats.length > 0 && (
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                marginBottom: '16px',
              }}>
                {feats.slice(0, 4).map((f, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.12)',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                  }}>
                    {f}
                  </div>
                ))}
              </div>
            )}

            {/* Content preview (first 5 lines) */}
            <div style={{
              background: 'rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '16px',
              fontSize: '13px',
              lineHeight: 1.7,
            }}>
              {contentLines.slice(0, 5).map((line, i) => (
                <p key={i} style={{ marginBottom: '4px' }}>{line}</p>
              ))}
            </div>

            {/* Price box */}
            {pr && (
              <div style={{
                background: '#0D7C66',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '12px', opacity: 0.8 }}>💰 السعر</span>
                <span style={{ fontSize: '20px', fontWeight: 900, color: '#D4A853' }}>{pr}</span>
              </div>
            )}

            {/* CTA */}
            <div style={{
              background: '#D4A853',
              borderRadius: '10px',
              padding: '10px',
              textAlign: 'center',
              fontSize: '14px',
              fontWeight: 700,
              color: '#1a3a5c',
              marginBottom: '16px',
            }}>
              للجادين، تواصل عبر واتساب
            </div>

            {/* Hashtags */}
            {content.hashtags && content.hashtags !== 'لا يوجد' && (
              <div style={{
                fontSize: '11px',
                opacity: 0.6,
                lineHeight: 1.6,
                marginBottom: '12px',
              }}>
                {content.hashtags.slice(0, 150)}
              </div>
            )}

            {/* Footer — small Sada Al Aqar stamp */}
            <div style={{
              position: 'absolute',
              bottom: '12px',
              left: '0',
              right: '0',
              textAlign: 'center',
              fontSize: '10px',
              opacity: 0.4,
            }}>
              صدى العقار — مساعد التسويق العقاري
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Twitter/X Template (1200×675 landscape) ───
  return (
    <div className="space-y-3">
      {/* Download button */}
      <div className="flex justify-center">
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="bg-[#0D7C66] hover:bg-[#0a6b58] text-white font-bold h-10 px-6 cursor-pointer"
        >
          {isDownloading ? (
            <><Loader2 className="w-4 h-4 animate-spin ml-1" /> جارٍ الإنشاء...</>
          ) : (
            <><Download className="w-4 h-4 ml-1" /> تنزيل كصورة (إكس)</>
          )}
        </Button>
      </div>

      {/* Template */}
      <div className="flex justify-center overflow-hidden rounded-xl border border-[#E8E1D2] shadow-lg">
        <div
          ref={templateRef}
          style={{
            width: '600px', // Half of 1200
            minHeight: '338px', // Half of 675
            background: 'linear-gradient(135deg, #1a3a5c 0%, #2c5f8a 100%)',
            fontFamily: 'Tajawal, sans-serif',
            direction: 'rtl',
            padding: '20px',
            color: '#ffffff',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Top row: title + location */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 900,
              color: '#D4A853',
            }}>
              ✨ {title}
            </h2>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>📍 {loc}</span>
          </div>

          {/* Main content — compact */}
          <div style={{
            flex: 1,
            display: 'flex',
            gap: '16px',
          }}>
            {/* Left: text */}
            <div style={{ flex: 1 }}>
              {/* Property image placeholder */}
              <div style={{
                width: '100%',
                height: '100px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '10px',
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px dashed rgba(212,168,83,0.3)',
              }}>
                <span style={{ fontSize: '11px', opacity: 0.5 }}>📸 صورة العقار</span>
              </div>

              {/* Content (3 lines only for Twitter) */}
              {contentLines.slice(0, 3).map((line, i) => (
                <p key={i} style={{
                  fontSize: '12px',
                  lineHeight: 1.6,
                  marginBottom: '4px',
                  opacity: 0.95,
                }}>{line}</p>
              ))}
            </div>

            {/* Right: price + specs */}
            <div style={{ width: '160px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {/* Price */}
              {pr && (
                <div style={{
                  background: '#0D7C66',
                  borderRadius: '10px',
                  padding: '10px',
                  textAlign: 'center',
                }}>
                  <p style={{ fontSize: '10px', opacity: 0.8, marginBottom: '4px' }}>💰 السعر</p>
                  <p style={{ fontSize: '16px', fontWeight: 900, color: '#D4A853' }}>{pr}</p>
                </div>
              )}

              {/* Features */}
              {feats.slice(0, 3).map((f, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.12)',
                  borderRadius: '8px',
                  padding: '6px 8px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}>
                  ✓ {f}
                </div>
              ))}

              {/* CTA */}
              <div style={{
                background: '#D4A853',
                borderRadius: '8px',
                padding: '8px',
                textAlign: 'center',
                fontSize: '11px',
                fontWeight: 700,
                color: '#1a3a5c',
              }}>
                تواصل الآن
              </div>
            </div>
          </div>

          {/* Footer stamp */}
          <div style={{
            position: 'absolute',
            bottom: '8px',
            left: '0',
            right: '0',
            textAlign: 'center',
            fontSize: '9px',
            opacity: 0.35,
          }}>
            صدى العقار
          </div>
        </div>
      </div>
    </div>
  );
}
