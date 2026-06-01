import { connectNew, connectOld } from "./lib.mjs";

const NEW_ID = "f0d5064d-9c63-40e0-8737-4ff8ecf9cc60";
const OLD_ID = "aebc16e2-93fd-4a4f-abee-5c7e23dec64a";
const SPACE_ID = "afc81e20-6634-491c-8ca2-05af94a4072f";

const db = await connectNew();
const spaces = await db.query(
  `SELECT id, name, status, venue_id FROM public.spaces WHERE owner_id = $1 AND deleted_at IS NULL`,
  [NEW_ID],
);
console.log("Joao spaces in new DB:", spaces.rows);

const target = await db.query(`SELECT * FROM public.spaces WHERE id = $1`, [SPACE_ID]);
console.log("Target space:", target.rows[0] ?? "MISSING");

const oldDb = await connectOld();
const oldSpaces = await oldDb.query(`
  SELECT s.id, s.name, s.venue_id, v.id AS venue_exists
  FROM venues.spaces s
  LEFT JOIN venues.venues v ON v.id = s.venue_id
  WHERE s.owner_id = $1 AND s.deleted_at IS NULL
`, [OLD_ID]);
console.log("Old spaces:", oldSpaces.rows);

const venues = await db.query(`SELECT id FROM public.venues WHERE id = ANY($1::uuid[])`, [
  oldSpaces.rows.map((r) => r.venue_id),
]);
console.log("Venues in new DB for those spaces:", venues.rows);

await db.end();
await oldDb.end();
