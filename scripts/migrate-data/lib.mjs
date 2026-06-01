import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadEnv(file) {
  const raw = readFileSync(join(__dirname, "..", "..", file), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    env[m[1]] = v;
  }
  return env;
}

export async function connectOld() {
  const { OLD_DATABASE_URL } = loadEnv(".env.migrate");
  const client = new pg.Client({
    connectionString: OLD_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

export async function connectNew() {
  const { DIRECT_URL } = loadEnv(".env");
  const client = new pg.Client({
    connectionString: DIRECT_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  return client;
}

/**
 * Copies rows from a source SELECT (returning JSON) into a target table using
 * jsonb_populate_recordset, in batches. Idempotent via ON CONFLICT DO NOTHING.
 */
export async function copyViaJson({
  oldClient,
  newClient,
  selectSql,
  targetTable,
  conflict = "(id) DO NOTHING",
  batchSize = 500,
  label,
}) {
  const res = await oldClient.query(selectSql);
  const rows = res.rows.map((r) => r.j ?? r);
  const total = rows.length;
  let inserted = 0;

  for (let i = 0; i < total; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const sql = `
      INSERT INTO ${targetTable}
      SELECT * FROM jsonb_populate_recordset(null::${targetTable}, $1::jsonb)
      ON CONFLICT ${conflict}
    `;
    const r = await newClient.query(sql, [JSON.stringify(batch)]);
    inserted += r.rowCount;
    process.stdout.write(
      `\r  ${label}: ${Math.min(i + batchSize, total)}/${total} (inserted ${inserted})   `,
    );
  }
  process.stdout.write("\n");
  return { total, inserted };
}
