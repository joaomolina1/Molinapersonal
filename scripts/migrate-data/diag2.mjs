import { connectOld } from "./lib.mjs";
const db = await connectOld();
console.log("connected to old");
const t0 = Date.now();
const r = await db.query(`
  SELECT DISTINCT ON (lower(a.username))
    a.id, a.username AS email, a.password, a.created_at,
    u.name, u.roles, u.kind, u.date_of_birth
  FROM auth.users a
  LEFT JOIN users.users u ON u.id = a.id
  WHERE a.username IS NOT NULL AND a.username <> '' AND a.deleted_at IS NULL
  ORDER BY lower(a.username), a.created_at ASC
`);
console.log(`dedup query returned ${r.rows.length} rows in ${Date.now() - t0}ms`);
console.log("sample:", JSON.stringify({ ...r.rows[0], password: "***" }));
await db.end();
