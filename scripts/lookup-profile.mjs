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
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    env[m[1]] = v;
  }
  return env;
}

const { DIRECT_URL } = loadEnv(".env");
const client = new pg.Client({ connectionString: DIRECT_URL, ssl: { rejectUnauthorized: false } });
await client.connect();

const email = process.argv[2] ?? "joao.d.molina@gmail.com";
const { rows } = await client.query(
  `SELECT u.id, u.email, p.name, p.roles
   FROM auth.users u
   LEFT JOIN public.profiles p ON p.id = u.id
   WHERE lower(u.email) = lower($1)`,
  [email],
);
console.log("By email:", JSON.stringify(rows, null, 2));

const id = process.argv[3] ?? "d9dca75f-e660-4746-ad55-d75f43c0deae";
const { rows: byId } = await client.query(
  `SELECT u.id, u.email, p.name FROM auth.users u
   LEFT JOIN public.profiles p ON p.id = u.id WHERE u.id = $1`,
  [id],
);
console.log("By ID:", JSON.stringify(byId, null, 2));

await client.end();
