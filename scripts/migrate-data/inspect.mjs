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

async function main() {
  const { OLD_DATABASE_URL } = loadEnv(".env.migrate");
  const client = new pg.Client({
    connectionString: OLD_DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  console.log("Connected to old RINU database\n");

  const schemas = await client.query(`
    SELECT schema_name FROM information_schema.schemata
    WHERE schema_name NOT IN ('pg_catalog','information_schema','pg_toast')
    ORDER BY schema_name;
  `);
  console.log("Schemas:", schemas.rows.map((r) => r.schema_name).join(", "), "\n");

  const tables = await client.query(`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_type = 'BASE TABLE'
      AND table_schema NOT IN ('pg_catalog','information_schema')
    ORDER BY table_schema, table_name;
  `);

  console.log("Tables and row counts:");
  for (const t of tables.rows) {
    const fq = `"${t.table_schema}"."${t.table_name}"`;
    try {
      const c = await client.query(`SELECT count(*)::int AS n FROM ${fq}`);
      console.log(`  ${t.table_schema}.${t.table_name}: ${c.rows[0].n}`);
    } catch (e) {
      console.log(`  ${t.table_schema}.${t.table_name}: ERROR ${e.message}`);
    }
  }

  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
