'use client';

import { useState, useCallback, useEffect } from 'react';

const VISITOR_ID_KEY = 'sada_visitor_id';
const GENERATION_COUNT_KEY = 'sada_gen_count';
const DAILY_COUNT_KEY = 'sada_daily_count';
const DAILY_DATE_KEY = 'sada_daily_date';
const REFERRAL_BONUS_KEY = 'sada_referral_bonus';
const REFERRER_KEY = 'sada_referrer_id';

/**
 * Daily generation cap for free (unregistered) visitors.
 * Set to 15 as a generous middle ground between the 10–20 range requested.
 * Registered founders bypass this cap (enforced server-side via visitorId lookup).
 * Referral bonuses add to this cap (e.g., 15 base + 5 bonus = 20 total).
 */
export const DAILY_FREE_LIMIT = 15;

/**
 * Returns a stable per-visitor ID (anonymous), persisted in localStorage.
 * Generated once on first visit, reused forever after (unless storage cleared).
 * Used as the key for the per-visitor "background training" StyleProfile.
 *
 * Uses a lazy initializer guarded by `typeof window` so it runs once and avoids
 * setState-in-effect. The value is only consumed in fetch calls (never rendered),
 * so there is no hydration mismatch concern.
 */
export function useVisitorId(): string {
  const [visitorId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    try {
      let id = localStorage.getItem(VISITOR_ID_KEY);
      if (!id) {
        // Generate a random anonymous ID (cuid-like, no PII)
        id = `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem(VISITOR_ID_KEY, id);
      }
      return id;
    } catch {
      // localStorage may be unavailable (private mode) — fall back to session ID
      return `v_session_${Math.random().toString(36).slice(2, 10)}`;
    }
  });

  return visitorId;
}

/**
 * Tracks how many times THIS visitor has generated content (client-side counter
 * for instant UI feedback, mirrors the server-side generationCount).
 */
export function useGenerationCount(): [number, () => void] {
  const [count, setCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const stored = localStorage.getItem(GENERATION_COUNT_KEY);
      return stored ? (parseInt(stored, 10) || 0) : 0;
    } catch {
      return 0;
    }
  });

  const increment = useCallback(() => {
    setCount(prev => {
      const next = prev + 1;
      try {
        localStorage.setItem(GENERATION_COUNT_KEY, String(next));
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  return [count, increment];
}

/**
 * Tracks how many generations the visitor has made TODAY (resets each calendar day).
 * Used to enforce the daily free cap. Returns:
 *  - todayCount: how many generations happened today
 *  - remaining: how many are left before the cap
 *  - limit: the cap itself
 *  - bump: increment the counter (called after a successful generation)
 *  - isLimited: true when the visitor hit the cap (todayCount >= limit)
 */
export function useDailyGenerationCount() {
  const [todayCount, setTodayCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    return readTodayCount();
  });

  // Read referral bonus (extra daily generations from sharing)
  const [referralBonus, setReferralBonus] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const stored = localStorage.getItem(REFERRAL_BONUS_KEY);
      return stored ? (parseInt(stored, 10) || 0) : 0;
    } catch {
      return 0;
    }
  });

  const bump = useCallback(() => {
    setTodayCount(prev => {
      const next = prev + 1;
      writeTodayCount(next);
      return next;
    });
  }, []);

  // Effective limit = base + referral bonus
  const effectiveLimit = DAILY_FREE_LIMIT + referralBonus;
  const remaining = Math.max(0, effectiveLimit - todayCount);
  const isLimited = todayCount >= effectiveLimit;

  return {
    todayCount,
    remaining,
    limit: effectiveLimit,
    baseLimit: DAILY_FREE_LIMIT,
    referralBonus,
    bump,
    isLimited,
    addReferralBonus: (amount: number) => {
      const newBonus = referralBonus + amount;
      setReferralBonus(newBonus);
      try {
        localStorage.setItem(REFERRAL_BONUS_KEY, String(newBonus));
      } catch {
        // ignore
      }
    },
  };
}

/** Returns today's date as YYYY-MM-DD (in the visitor's local timezone). */
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function readTodayCount(): number {
  try {
    const storedDate = localStorage.getItem(DAILY_DATE_KEY);
    const today = todayKey();
    if (storedDate !== today) {
      // Date changed (or first visit) — reset the daily counter
      localStorage.setItem(DAILY_DATE_KEY, today);
      localStorage.setItem(DAILY_COUNT_KEY, '0');
      return 0;
    }
    const stored = localStorage.getItem(DAILY_COUNT_KEY);
    return stored ? (parseInt(stored, 10) || 0) : 0;
  } catch {
    return 0;
  }
}

function writeTodayCount(n: number): void {
  try {
    localStorage.setItem(DAILY_COUNT_KEY, String(n));
    localStorage.setItem(DAILY_DATE_KEY, todayKey());
  } catch {
    // ignore
  }
}

/**
 * Picks a deterministic-but-varied seed for each "regenerate" click so the
 * user always gets a visibly different angle/copy (never the same output twice).
 * Combines the current time with a counter to guarantee freshness.
 */
export function makeVariationSeed(): number {
  return Math.floor(Math.random() * 1_000_000) + Math.floor(Date.now() % 100000);
}

/* ═══════════════════════════════════════════════════════════════════════
 * Referral system — viral growth loop
 *
 * How it works:
 *  1. Each visitor gets a unique referral link: site.com/?ref=VISITOR_ID
 *  2. When they share content (via ShareButtons), the link includes ?ref=
 *  3. When a NEW visitor clicks that link:
 *     - We store the referrer's ID in localStorage (sada_referrer_id)
 *     - The referrer gets +3 bonus generations (if they return)
 *  4. When the referred friend REGISTERS (becomes a lead):
 *     - The referrer gets +10 bonus generations (bigger reward)
 *  5. The referral bonus resets daily (so sharing every day = more writes)
 *
 * Rewards:
 *  - Click from friend → +3 generations for referrer
 *  - Friend registers → +10 generations for referrer
 *  - Friend becomes paid founder → +20 generations for referrer
 * ═══════════════════════════════════════════════════════════════════════ */

/** Returns the visitor's referral link (with ?ref=visitorId appended). */
export function useReferralLink(visitorId: string): string {
  const [link, setLink] = useState<string>('');

  useEffect(() => {
    if (!visitorId || typeof window === 'undefined') return;
    const origin = window.location.origin;
    setLink(`${origin}/?ref=${visitorId}`);
  }, [visitorId]);

  return link;
}

/**
 * On first visit, checks if the URL has ?ref= parameter.
 * If so, stores the referrer's visitorId in localStorage.
 * This is used later to award the referrer when the visitor registers.
 */
export function useCaptureReferrer() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const ref = params.get('ref');
      if (ref && ref.startsWith('v_')) {
        // Only store if not already set (don't overwrite)
        const existing = localStorage.getItem(REFERRER_KEY);
        if (!existing) {
          localStorage.setItem(REFERRER_KEY, ref);
          // Clean the URL (remove ?ref= for a clean address bar)
          const newUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, '', newUrl);
        }
      }
    } catch {
      // ignore
    }
  }, []);
}

/** Returns the stored referrer ID (if this visitor was referred by someone). */
export function getReferrerId(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(REFERRER_KEY);
  } catch {
    return null;
  }
}
