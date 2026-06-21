/**
 * Push Prisma schema to Turso database.
 *
 * Prisma CLI doesn't support libsql:// URLs natively for db:push,
 * so we generate the SQL with `prisma migrate diff` and apply it
 * to Turso using the @libsql/client directly.
 *
 * Usage: bun run db:push-turso
 *
 * Required env vars:
 *   DATABASE_URL          — libsql://your-db.turso.io
 *   DATABASE_AUTH_TOKEN   — your Turso auth token
 */
const { createClient } = require('@libsql/client');
const { execSync } = require('child_process');
const { readFileSync, existsSync, mkdirSync } = require('fs');

const url = process.env.DATABASE_URL;
const authToken = process.env.DATABASE_AUTH_TOKEN;

if (!url || !url.startsWith('libsql://')) {
  console.error('❌ DATABASE_URL must be a libsql:// URL. Current:', url);
  process.exit(1);
}
if (!authToken) {
  console.error('❌ DATABASE_AUTH_TOKEN is required for Turso.');
  process.exit(1);
}

// Step 1: Generate SQL from Prisma schema using a temporary file: URL
console.log('📋 Generating SQL from Prisma schema...');
const tmpSqlPath = require('path').join(__dirname, 'schema.sql');
try {
  execSync(
    `DATABASE_URL="file:./tmp_shadow.db" npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > "${tmpSqlPath}"`,
    { stdio: 'pipe', cwd: process.cwd() }
  );
} catch (err) {
  console.error('❌ Failed to generate SQL:', err.message);
  process.exit(1);
}

const sql = readFileSync(tmpSqlPath, 'utf-8');
console.log(`✅ Generated ${sql.split(';').length - 1} SQL statements\n`);

// Step 2: Connect to Turso and apply
console.log('🔌 Connecting to Turso...');
const client = createClient({ url, authToken });

// Step 3: Execute each statement
const statements = sql.split(';').map(s => {
  return s.split('\n')
    .filter(line => !line.trim().startsWith('--'))
    .join('\n')
    .trim();
}).filter(s => s.length > 0);

console.log(`🚀 Executing ${statements.length} statements...`);
(async () => {
  let success = 0;
  let failed = 0;
  for (let i = 0; i < statements.length; i++) {
    try {
      await client.execute(statements[i]);
      console.log(`  ✓ [${i + 1}/${statements.length}] ${statements[i].substring(0, 60).replace(/\n/g, ' ')}...`);
      success++;
    } catch (err) {
      // Ignore "already exists" errors (re-running on same DB)
      if (err.message.includes('already exists')) {
        console.log(`  ⊙ [${i + 1}/${statements.length}] Already exists — skipped`);
      } else {
        console.error(`  ✗ [${i + 1}/${statements.length}] ${err.message}`);
        failed++;
      }
    }
  }

  // Verify
  const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
  console.log(`\n📊 Tables in Turso (${tables.rows.length}):`);
  for (const row of tables.rows) {
    console.log(`  ✓ ${row.name}`);
  }

  console.log(`\n${success} succeeded, ${failed} failed`);
  console.log(failed === 0 ? '✅ Schema push complete!' : '⚠️ Some statements failed — check output above');

  // Cleanup temp file
  require('fs').unlinkSync(tmpSqlPath);
  process.exit(failed > 0 ? 1 : 0);
})();
