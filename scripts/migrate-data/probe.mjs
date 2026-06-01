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
  const client = new pg.Client({ connectionString: OLD_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  // 1. Does auth.users.id == users.users.id for same person?
  const joinCheck = await client.query(`
    SELECT
      count(*) FILTER (WHERE a.id = u.id) AS same_id,
      count(*) FILTER (WHERE a.id <> u.id) AS diff_id,
      count(*) AS matched_by_email
    FROM auth.users a
    JOIN users.users u ON lower(u.email) = lower(a.username)
  `);
  console.log("auth.users vs users.users (join on email=username):");
  console.log(JSON.stringify(joinCheck.rows[0], null, 2));

  const authOnly = await client.query(`
    SELECT count(*) AS n FROM auth.users a
    WHERE NOT EXISTS (SELECT 1 FROM users.users u WHERE lower(u.email)=lower(a.username))
  `);
  const usersOnly = await client.query(`
    SELECT count(*) AS n FROM users.users u
    WHERE NOT EXISTS (SELECT 1 FROM auth.users a WHERE lower(a.username)=lower(u.email))
  `);
  console.log(`auth.users without users.users: ${authOnly.rows[0].n}`);
  console.log(`users.users without auth.users: ${usersOnly.rows[0].n}`);

  // 2. bcrypt prefix distribution
  const pw = await client.query(`
    SELECT substring(password from 1 for 4) AS prefix, count(*) AS n
    FROM auth.users WHERE password IS NOT NULL GROUP BY 1 ORDER BY 2 DESC
  `);
  console.log("\npassword hash prefixes:", JSON.stringify(pw.rows));

  // 3. status distribution for venues/spaces
  const vs = await client.query(`SELECT status, count(*) AS n FROM venues.venues GROUP BY 1 ORDER BY 1`);
  console.log("\nvenues.status:", JSON.stringify(vs.rows));
  const ss = await client.query(`SELECT status, count(*) AS n FROM venues.spaces GROUP BY 1 ORDER BY 1`);
  console.log("spaces.status:", JSON.stringify(ss.rows));

  // 4. duplicate emails in users.users (would block auth import)
  const dup = await client.query(`
    SELECT count(*) AS dup_emails FROM (
      SELECT lower(email) FROM users.users WHERE deleted_at IS NULL GROUP BY 1 HAVING count(*) > 1
    ) x
  `);
  console.log("\nduplicate emails (active):", dup.rows[0].dup_emails);

  await client.end();
}

main().catch((e) => { console.error(e); process.exit(1); });
