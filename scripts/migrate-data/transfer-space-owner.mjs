import { connectNew } from "./lib.mjs";

const SPACE_ID = "95ae1e3e-8758-4bab-b1c7-1f4d35b09305";
const EMAIL = "joao.d.molina@gmail.com";

const db = await connectNew();

const user = await db.query(
  `SELECT id, email FROM auth.users WHERE lower(email) = lower($1)`,
  [EMAIL],
);
if (!user.rows[0]) {
  console.error("User not found:", EMAIL);
  process.exit(1);
}
const newOwnerId = user.rows[0].id;
console.log("New owner:", newOwnerId, user.rows[0].email);

const space = await db.query(
  `SELECT id, name, venue_id, owner_id, status FROM public.spaces WHERE id = $1`,
  [SPACE_ID],
);
if (!space.rows[0]) {
  console.error("Space not found:", SPACE_ID);
  process.exit(1);
}
const { venue_id: venueId, owner_id: oldSpaceOwner } = space.rows[0];
console.log("\nSpace:", space.rows[0]);

const venue = await db.query(
  `SELECT id, name, owner_id, status FROM public.venues WHERE id = $1`,
  [venueId],
);
console.log("Venue before:", venue.rows[0]);

const packs = await db.query(
  `
  SELECT p.id, p.name, p.owner_id
  FROM public.packs p
  JOIN public.packs_spaces ps ON ps.pack_id = p.id
  WHERE ps.space_id = $1 AND p.deleted_at IS NULL
  `,
  [SPACE_ID],
);
console.log(`\nPacks linked (${packs.rows.length}):`, packs.rows);

await db.query("BEGIN");

await db.query(
  `UPDATE public.venues SET owner_id = $1, updated_at = now() WHERE id = $2`,
  [newOwnerId, venueId],
);

await db.query(
  `UPDATE public.spaces SET owner_id = $1, updated_at = now() WHERE id = $2`,
  [newOwnerId, SPACE_ID],
);

if (packs.rows.length > 0) {
  const packIds = packs.rows.map((p) => p.id);
  await db.query(
    `UPDATE public.packs SET owner_id = $1, updated_at = now() WHERE id = ANY($2::uuid[])`,
    [newOwnerId, packIds],
  );
}

await db.query("COMMIT");

const after = await db.query(
  `
  SELECT s.id AS space_id, s.name AS space_name, s.owner_id AS space_owner,
         v.id AS venue_id, v.name AS venue_name, v.owner_id AS venue_owner
  FROM public.spaces s
  JOIN public.venues v ON v.id = s.venue_id
  WHERE s.id = $1
  `,
  [SPACE_ID],
);

console.log("\nAfter transfer:", after.rows[0]);
console.log("\nDone. Log in as", EMAIL, "and check /host");

await db.end();
