import { connectNew, connectOld } from "./lib.mjs";

const db = await connectNew();
const ps = await db.query(`SELECT count(*)::int n FROM public.packs_spaces`);
console.log("packs_spaces rows:", ps.rows[0].n);

const oldDb = await connectOld();
const conflicts = await oldDb.query(`
  SELECT o.id AS old_id, lower(o.username) AS email
  FROM auth.users o
  WHERE o.deleted_at IS NULL AND o.username IS NOT NULL AND o.username <> ''
`);
let mismatch = 0;
let missingData = 0;
for (const row of conflicts.rows) {
  const n = await db.query(
    `SELECT id FROM auth.users WHERE lower(email) = lower($1)`,
    [row.email],
  );
  if (n.rows[0] && n.rows[0].id !== row.old_id) {
    mismatch++;
    const spaces = await oldDb.query(
      `SELECT count(*)::int n FROM venues.spaces WHERE owner_id = $1 AND deleted_at IS NULL`,
      [row.old_id],
    );
    if (spaces.rows[0].n > 0) missingData++;
  }
}
console.log("Email same but UUID different:", mismatch);
console.log("Of those, with spaces in old DB:", missingData);

await db.end();
await oldDb.end();
