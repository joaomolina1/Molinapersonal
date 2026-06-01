import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = join(__dirname, "..", ".env");
  const raw = readFileSync(envPath, "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let value = m[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[m[1]] = value;
  }
  return env;
}

async function main() {
  const env = loadEnv();
  const connectionString = env.DIRECT_URL;
  if (!connectionString) {
    throw new Error("DIRECT_URL not found in .env");
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log("Connected to database");

  const migrationsDir = join(__dirname, "..", "supabase", "migrations");
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), "utf8");
    console.log(`\nApplying ${file} ...`);
    try {
      await client.query(sql);
      console.log(`  OK ${file}`);
    } catch (err) {
      console.error(`  ERROR in ${file}: ${err.message}`);
      throw err;
    }
  }

  console.log("\nAll migrations applied.");
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
