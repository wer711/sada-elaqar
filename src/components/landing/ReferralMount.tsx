'use client';

import { useEffect, useState } from 'react';
import ReferralWidget from './ReferralWidget';
import { useCaptureReferrer, useGenerationCount } from '@/lib/visitor';

/**
 * ReferralMount — handles two things:
 * 1. Captures ?ref= from URL on first visit (stores referrer ID)
 * 2. Shows the ReferralWidget after the visitor has written at least 1 piece of content
 *    (generationCount >= 1), because that's when they've experienced value
 *    and are most likely to share.
 */
export function ReferralMount() {
  const [showWidget, setShowWidget] = useState(false);
  const [generationCount] = useGenerationCount();

  // Capture referrer from URL (?ref=VISITOR_ID) on mount
  useCaptureReferrer();

  // Show the referral widget after the first successful generation
  useEffect(() => {
    if (generationCount >= 1) {
      // Small delay so the result card renders first
      const timer = setTimeout(() => setShowWidget(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [generationCount]);

  if (!showWidget) return null;

  // Render the widget floating near the bottom (above the WhatsApp button)
  return (
    <div className="fixed bottom-24 left-6 right-6 md:left-auto md:right-6 md:w-96 z-40 pointer-events-none">
      <div className="pointer-events-auto">
        <ReferralWidget showAfterGeneration={true} />
      </div>
    </div>
  );
}
