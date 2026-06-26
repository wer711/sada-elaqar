import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, whatsapp, email, city, country,
      role, challenges, topFeature, monthlyBudget,
      consent, visitorId, styleSample,
    } = body;

    // ── Required field validation ──
    if (!name || !whatsapp || !city || !role || !challenges || !topFeature) {
      return NextResponse.json({ error: 'جميع الحقول المطلوبة يجب ملؤها' }, { status: 400 });
    }

    // ── Consent is required for legal compliance (PDPL Saudi / DPL UAE) ──
    if (!consent) {
      return NextResponse.json({ error: 'يجب الموافقة على سياسة الخصوصية للمتابعة' }, { status: 400 });
    }

    // ── Duplicate-lead protection ──
    // Same WhatsApp number + country = same person. Return the existing lead
    // instead of creating a duplicate. This prevents a single visitor from
    // inflating the count by registering 100 times.
    const existing = await db.lead.findFirst({
      where: { whatsapp, country: country || null },
      select: { id: true, createdAt: true },
    });
    if (existing) {
      return NextResponse.json({
        success: true,
        id: existing.id,
        duplicate: true,
        message: 'أنت مسجّل بالفعل — سنتواصل معك عند الإطلاق',
      });
    }

    const now = new Date();

    // ── Collect the visitor's demo behavior at the moment of registration ──
    // This is what makes the lead VALUABLE: we can see which property types,
    // platforms, and cities the lead actually engaged with before signing up.
    // It's the "filtering signal" the user asked for.
    let demoBehavior: {
      sessions: number;
      propertyTypes: string[];
      platforms: string[];
      lastSessionAt: string | null;
      ratings: { up: number; down: number };
    } | null = null;

    if (visitorId && typeof visitorId === 'string' && visitorId.length > 0) {
      try {
        // Count sessions for this visitor
        const sessions = await db.demoSession.findMany({
          where: { visitorId },
          select: {
            propertyType: true,
            platform: true,
            rating: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 100, // cap the query
        });

        if (sessions.length > 0) {
          const propertyTypes = Array.from(new Set(sessions.map(s => s.propertyType).filter((v): v is string => !!v)));
          const platforms = Array.from(new Set(sessions.map(s => s.platform).filter((v): v is string => !!v)));
          const ratings = sessions.reduce(
            (acc, s) => {
              if (s.rating === 'up') acc.up++;
              else if (s.rating === 'down') acc.down++;
              return acc;
            },
            { up: 0, down: 0 },
          );
          demoBehavior = {
            sessions: sessions.length,
            propertyTypes,
            platforms,
            lastSessionAt: sessions[0]?.createdAt.toISOString() || null,
            ratings,
          };

          // ── Mark all the visitor's DemoSessions as leadConverted ──
          // This is the "leadConverted = true" path that was previously dead code.
          // Now, when a visitor registers, we link their anonymous sessions to
          // their lead record — so the sales team can query "show me leads who
          // tried 5+ property types" or "leads who liked (upvoted) content".
          await db.demoSession.updateMany({
            where: { visitorId, leadConverted: false },
            data: { leadConverted: true },
          });

          // ── الهوية التسويقية: حفظ عينة أسلوب العميل في StyleProfile ──
          if (styleSample && typeof styleSample === 'string' && styleSample.length > 20) {
            try {
              await db.styleProfile.upsert({
                where: { visitorId },
                create: {
                  visitorId,
                  likedVocab: JSON.stringify({ styleSample: styleSample.slice(0, 1500) }),
                },
                update: {
                  likedVocab: JSON.stringify({ styleSample: styleSample.slice(0, 1500) }),
                },
              });
            } catch {
              // Non-critical — continue without style profile
            }
          }
        }
      } catch {
        // DB query failed — continue without demo behavior (non-critical)
      }
    }

    const demoBehaviorJson = demoBehavior ? JSON.stringify(demoBehavior) : null;

    // ── Create the lead ──
    const lead = await db.lead.create({
      data: {
        name,
        whatsapp,
        email: email || null,
        city,
        country: country || null,
        role,
        challenges: Array.isArray(challenges) ? challenges.join(',') : challenges,
        topFeature,
        monthlyBudget: monthlyBudget || null,
        source: 'landing',
        status: 'new',
        consent: true,
        consentAt: now,
        visitorId: visitorId || null,
        demoBehavior: demoBehaviorJson,
      },
    });

    // ── Sync to Google Sheets (non-blocking, best-effort) ──
    // The webhook URL is set via GOOGLE_SHEETS_WEBHOOK_URL env var.
    // The Apps Script routes the payload to the right sheet based on the
    // "sheet" field. Free leads → "Leads_Free", founder leads → "Leads_Founder".
    try {
      const GOOGLE_SHEETS_WEBHOOK = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
      if (GOOGLE_SHEETS_WEBHOOK) {
        await fetch(GOOGLE_SHEETS_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sheet: 'Leads_Free',
            leadId: lead.id,
            visitorId: visitorId || '',
            name,
            whatsapp,
            email: email || '',
            city,
            country: country || '',
            role,
            challenges: Array.isArray(challenges) ? challenges.join(', ') : challenges,
            topFeature,
            monthlyBudget: monthlyBudget || '',
            source: 'landing',
            consent: true,
            consentAt: now.toISOString(),
            // Demo behavior summary — this is the filtering signal
            demoSessions: demoBehavior?.sessions || 0,
            demoPropertyTypes: demoBehavior?.propertyTypes.join(', ') || '',
            demoPlatforms: demoBehavior?.platforms.join(', ') || '',
            demoRatingsUp: demoBehavior?.ratings.up || 0,
            demoRatingsDown: demoBehavior?.ratings.down || 0,
            demoLastSessionAt: demoBehavior?.lastSessionAt || '',
            timestamp: now.toISOString(),
          }),
        });
      }
    } catch {
      // Don't fail if Google Sheets sync fails — the lead is already in the DB
    }

    return NextResponse.json({
      success: true,
      id: lead.id,
      demoSessions: demoBehavior?.sessions || 0,
    });
  } catch (error) {
    console.error('Lead creation error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء التسجيل' }, { status: 500 });
  }
}
