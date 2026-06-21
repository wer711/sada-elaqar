import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Database client setup.
 *
 * In production (Vercel), we use Turso (LibSQL) — a serverless SQLite
 * compatible database. This works around Vercel's read-only filesystem.
 *
 * In development, we can use either Turso or a local SQLite file.
 *
 * Env vars:
 *   DATABASE_URL          — libsql://... (Turso) or file:./path.db (local)
 *   DATABASE_AUTH_TOKEN   — Turso auth token (only needed for Turso)
 */
function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL || ''
  const authToken = process.env.DATABASE_AUTH_TOKEN || undefined

  // Log config: 'query' only in debug mode; always show 'error' + 'warn'
  const logConfig: ('query' | 'error' | 'warn')[] =
    process.env.DEBUG_SQL === '1' ? ['query', 'error', 'warn'] : ['error', 'warn']

  // If the URL starts with libsql://, use the LibSQL adapter (Turso/remote)
  if (url.startsWith('libsql://') || url.startsWith('http://') || url.startsWith('https://')) {
    // PrismaLibSql accepts a Config object directly (url + authToken)
    const adapter = new PrismaLibSql({ url, authToken })
    return new PrismaClient({ adapter, log: logConfig })
  }

  // Local SQLite file (development)
  return new PrismaClient({ log: logConfig })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
