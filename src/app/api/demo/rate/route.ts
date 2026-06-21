import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { extractLikedVocab, VARIATION_ANGLES } from '@/lib/ai-types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, rating, visitorId } = body;

    if (!sessionId || !rating) {
      return NextResponse.json(
        { error: 'معرف الجلسة والتقييم مطلوبان' },
        { status: 400 },
      );
    }

    if (!['up', 'down'].includes(rating)) {
      return NextResponse.json({ error: 'التقييم غير صالح' }, { status: 400 });
    }

    // ── Update the demo session rating ──
    let session: { variationAngle: string | null; resolvedProperty: string | null; content?: string } | null = null;
    try {
      session = await db.demoSession.update({
        where: { id: sessionId },
        data: { rating },
        select: { variationAngle: true, resolvedProperty: true },
      });
    } catch {
      // Session might not exist — that's OK
    }

    // ── Background training: update the visitor's StyleProfile ──
    // On UPVOTE: we remember the angle that worked (preferred), extract liked
    //   vocab, bump upvote count + trust score.
    // On DOWNVOTE: we add the angle to "avoided" (learned what NOT to do),
    //   bump downvote count, lightly reduce trust.
    if (visitorId && typeof visitorId === 'string' && session?.variationAngle) {
      try {
        const profile = await db.styleProfile.upsert({
          where: { visitorId },
          create: { visitorId },
          update: {},
        });

        const angleName = VARIATION_ANGLES.find(a => a.key === session.variationAngle)?.name || session.variationAngle;

        if (rating === 'up') {
          const preferredAngles = mergeUnique(
            safeParseArray(profile.preferredAngles),
            [session.variationAngle],
          ).slice(0, 6);

          // Extract liked vocab from the resolvedProperty (we don't store full content
          // for privacy, but resolvedProperty.features + type give us signal). For a
          // richer signal we'd store content; keeping it lean here.
          const resolved = safeParseResolved(session.resolvedProperty);
          const vocabSource = [resolved?.type || '', ...(resolved?.features || [])].join(' ');
          const newVocab = extractLikedVocab(vocabSource);
          const likedVocab = mergeUnique(safeParseArray(profile.likedVocab), newVocab).slice(0, 20);

          // Remove from avoided if it was there (user changed mind / we re-tried)
          const avoidedAngles = safeParseArray(profile.avoidedAngles).filter(a => a !== session.variationAngle);

          await db.styleProfile.update({
            where: { id: profile.id },
            data: {
              upvoteCount: { increment: 1 },
              preferredAngles: JSON.stringify(preferredAngles),
              likedVocab: JSON.stringify(likedVocab),
              avoidedAngles: JSON.stringify(avoidedAngles),
              trustScore: Math.min(100, profile.trustScore + 5),
            },
          });
        } else {
          // Downvote: learn to avoid this angle (but only after 2+ downvotes on it
          // to avoid over-correcting from a single bad result). We still record it
          // in a "soft avoid" by removing it from preferred and noting the downvote.
          const preferredAngles = safeParseArray(profile.preferredAngles).filter(a => a !== session.variationAngle);
          const downCount = profile.downvoteCount + 1;

          // If this angle has been downvoted enough relative to total, avoid it
          let avoidedAngles = safeParseArray(profile.avoidedAngles);
          const totalVotes = profile.upvoteCount + downCount;
          if (totalVotes >= 3) {
            // Avoid angle if it has more downvotes than upvotes
            avoidedAngles = mergeUnique(avoidedAngles, [session.variationAngle]).slice(0, 4);
          }

          await db.styleProfile.update({
            where: { id: profile.id },
            data: {
              downvoteCount: { increment: 1 },
              preferredAngles: JSON.stringify(preferredAngles),
              avoidedAngles: JSON.stringify(avoidedAngles),
              trustScore: Math.max(5, profile.trustScore - 2),
            },
          });
        }
      } catch {
        // Non-critical
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'حدث خطأ أثناء حفظ التقييم' }, { status: 500 });
  }
}

function safeParseArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function safeParseResolved(value: string | null): { type?: string; features?: string[] } | null {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function mergeUnique(a: string[], b: string[]): string[] {
  return Array.from(new Set([...a, ...b]));
}
