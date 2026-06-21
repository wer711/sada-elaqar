import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/founder/count
 *
 * Returns the REAL count of active founder subscriptions.
 * Used by the FounderPlan component to show a live "X / 50 founders" counter
 * that moves automatically as real payments come in. No fabrication.
 *
 * Returns: { count: number, target: 50, remaining: number, isFull: boolean }
 */
const FOUNDER_TARGET = 50;

export async function GET() {
  try {
    const count = await db.subscription.count({
      where: {
        status: 'active',
        plan: 'founder',
      },
    });

    return NextResponse.json({
      count,
      target: FOUNDER_TARGET,
      remaining: Math.max(0, FOUNDER_TARGET - count),
      isFull: count >= FOUNDER_TARGET,
    });
  } catch {
    // DB unavailable — return 0 (honest, no fabrication)
    return NextResponse.json({
      count: 0,
      target: FOUNDER_TARGET,
      remaining: FOUNDER_TARGET,
      isFull: false,
    });
  }
}
