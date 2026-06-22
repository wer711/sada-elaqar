'use client';

import { useEffect, useState } from 'react';
import ReferralWidget from './ReferralWidget';
import { useCaptureReferrer, useGenerationCount } from '@/lib/visitor';

/**
 * ReferralMount — handles two things:
 * 1. Captures ?ref= from URL on first visit (stores referrer ID)
 * 2. Shows the ReferralWidget inline (NOT fixed/floating) after the visitor
 *    has written at least 1 piece of content. It renders in the normal
 *    page flow so it never blocks the view.
 */
export function ReferralMount() {
  const [showWidget, setShowWidget] = useState(false);
  const [generationCount] = useGenerationCount();

  // Capture referrer from URL (?ref=VISITOR_ID) on mount
  useCaptureReferrer();

  // Show the referral widget after the first successful generation
  useEffect(() => {
    if (generationCount >= 1) {
      const raf = requestAnimationFrame(() => setShowWidget(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [generationCount]);

  if (!showWidget) return null;

  // Render inline (in normal page flow) — NOT fixed/floating
  return (
    <div className="px-4 pb-8">
      <div className="max-w-2xl mx-auto">
        <ReferralWidget showAfterGeneration={true} />
      </div>
    </div>
  );
}
