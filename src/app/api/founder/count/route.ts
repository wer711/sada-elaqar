import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/founder/count
 *
 * Returns the REAL count of active founder subscriptions.
 * Used by the FounderPlan component to show a live "X / 100 founders" counter
 * that moves automatically as real payments come in. No fabrication.
 *
 * Returns: { count: number, target: 100, remaining: number, isFull: boolean }
 */
export async function GET() {
  try {
    const count = await db.subscription.count({
      where: {
        status: 'active',
        plan: 'founder',
      },
    });

    const TARGET = 100;
    return NextResponse.json({
      count,
      target: TARGET,
      remaining: Math.max(0, TARGET - count),
      isFull: count >= TARGET,
    });
  } catch {
    // DB unavailable — return 0 (honest, no fabrication)
    return NextResponse.json({
      count: 0,
      target: 100,
      remaining: 100,
      isFull: false,
    });
  }
}
