import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
function loadEnv(file) {
  const raw = readFileSync(join(__dirname, "..", "..", file), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[m[1]] = v;
  }
  return env;
}

const TARGETS = [
  ["auth", "users"],
  ["users", "users"],
  ["users", "watchlist"],
  ["venues", "venues"],
  ["venues", "spaces"],
  ["venues", "packs"],
  ["venues", "packs_spaces"],
  ["venues", "highlights"],
  ["bookings", "bookings"],
  ["bookings", "payments"],
  ["bookings", "quote"],
  ["bookings", "contact_request"],
  ["bookings", "icals_exports"],
  ["bookings", "icals_imports"],
  ["photos", "photos"],
  ["reviews", "review"],
];

async function main() {
  const { OLD_DATABASE_URL } = loadEnv(".env.migrate");
  const client = new pg.Client({ connectionString: OLD_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  for (const [schema, table] of TARGETS) {
    const cols = await client.query(
      `SELECT column_name, data_type FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = $2 ORDER BY ordinal_position`,
      [schema, table],
    );
    if (cols.rows.length === 0) {
      console.log(`\n### ${schema}.${table} -> NOT FOUND`);
      continue;
    }
    console.log(`\n### ${schema}.${table}`);
    console.log(cols.rows.map((c) => `${c.column_name}:${c.data_type}`).join(", "));
  }

  // Sample auth.users (just non-sensitive shape + check password col present)
  console.log("\n\n=== auth.users sample (1 row, masked) ===");
  const au = await client.query(`SELECT * FROM auth.users LIMIT 1`);
  if (au.rows[0]) {
    const r = { ...au.rows[0] };
    for (const k of Object.keys(r)) {
      if (/pass|hash|token|secret/i.test(k) && r[k]) r[k] = `<${String(r[k]).slice(0, 7)}...len${String(r[k]).length}>`;
    }
    console.log(JSON.stringify(r, null, 2));
  }

  console.log("\n=== users.users sample (1 row) ===");
  const uu = await client.query(`SELECT * FROM users.users LIMIT 1`);
  console.log(JSON.stringify(uu.rows[0], null, 2));

  console.log("\n=== photos.photos sample (2 rows) ===");
  const ph = await client.query(`SELECT * FROM photos.photos WHERE url IS NOT NULL AND url <> '' LIMIT 2`);
  console.log(JSON.stringify(ph.rows, null, 2));

  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
