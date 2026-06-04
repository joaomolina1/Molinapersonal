import pg from "pg";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv(file) {
  const raw = readFileSync(join(__dirname, "..", file), "utf8");
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

const { DIRECT_URL } = loadEnv(".env");
if (!DIRECT_URL) {
  console.error("Missing DIRECT_URL in .env");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const files = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["004_attachments_storage.sql", "005_subscriptions.sql"];

for (const file of files) {
  const sql = readFileSync(
    join(__dirname, "..", "supabase/migrations", file),
    "utf8",
  );
  console.log(`Applying ${file}...`);
  try {
    await client.query(sql);
    console.log(`OK: ${file}`);
  } catch (e) {
    const msg = e.message ?? String(e);
    if (
      e.code === "42P07" ||
      e.code === "42710" ||
      msg.includes("already exists")
    ) {
      console.log(`Skip (already applied): ${file}`);
    } else {
      console.error(`FAIL: ${file}`, msg);
      await client.end();
      process.exit(1);
    }
  }
}

const { rows } = await client.query(`
  SELECT column_name FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'subscriptions'
  ORDER BY ordinal_position
`);
console.log(
  "\nsubscriptions table:",
  rows.length ? rows.map((r) => r.column_name).join(", ") : "NOT FOUND",
);

await client.end();
console.log("\nMigrations done.");
