import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const count = await db.lead.count()
    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 0 }, { status: 200 })
  }
}
