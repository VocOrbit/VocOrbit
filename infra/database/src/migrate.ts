import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import postgres from "postgres";
import { loadEnv } from "../../../packages/core/src/config/env";

const env = loadEnv();
const sql = postgres(env.DATABASE_URL);
const migrationsDir = join(process.cwd(), "infra", "database", "migrations");

await sql`
  CREATE TABLE IF NOT EXISTS schema_migrations (
    id TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  )
`;

const rows = await sql<{ id: string }[]>`SELECT id FROM schema_migrations`;
const applied = new Set(rows.map((row) => row.id));

const files = readdirSync(migrationsDir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

for (const file of files) {
  if (applied.has(file)) continue;
  const sqlText = readFileSync(join(migrationsDir, file), "utf8");
  if (sqlText.trim().length === 0) continue;
  await sql.begin(async (trx) => {
    await trx.unsafe(sqlText);
  });
  await sql`INSERT INTO schema_migrations (id) VALUES (${file})`;
  console.log(`Applied migration: ${file}`);
}

await sql.end({ timeout: 5 });
