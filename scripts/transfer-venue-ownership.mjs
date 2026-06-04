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

const NEW_OWNER_ID = process.argv[2];
const SPACE_IDS = process.argv.slice(3);

if (!NEW_OWNER_ID || SPACE_IDS.length === 0) {
  console.error(
    "Usage: node scripts/transfer-venue-ownership.mjs <owner_id> <space_id> [...]",
  );
  process.exit(1);
}

const { DIRECT_URL } = loadEnv(".env");
const client = new pg.Client({
  connectionString: DIRECT_URL,
  ssl: { rejectUnauthorized: false },
});
await client.connect();

const { rows: spaces } = await client.query(
  `SELECT s.id, s.name, s.reference, s.venue_id, s.owner_id,
          v.name AS venue_name, v.owner_id AS venue_owner_id
   FROM spaces s
   JOIN venues v ON v.id = s.venue_id
   WHERE s.id = ANY($1::uuid[])`,
  [SPACE_IDS],
);

if (spaces.length === 0) {
  console.error("No spaces found for IDs:", SPACE_IDS.join(", "));
  await client.end();
  process.exit(1);
}

const venueIds = [...new Set(spaces.map((s) => s.venue_id))];
console.log("Spaces found:", spaces.length);
console.log("Venues to transfer:", venueIds.join(", "));

for (const venueId of venueIds) {
  await client.query("BEGIN");
  try {
    const { rowCount: venuesUpdated } = await client.query(
      `UPDATE venues SET owner_id = $1, updated_at = now() WHERE id = $2`,
      [NEW_OWNER_ID, venueId],
    );

    const { rowCount: spacesUpdated } = await client.query(
      `UPDATE spaces SET owner_id = $1, updated_at = now() WHERE venue_id = $2`,
      [NEW_OWNER_ID, venueId],
    );

    const { rowCount: packsUpdated } = await client.query(
      `UPDATE packs SET owner_id = $1, updated_at = now()
       WHERE id IN (
         SELECT pack_id FROM packs_spaces
         WHERE space_id IN (SELECT id FROM spaces WHERE venue_id = $2)
       )`,
      [NEW_OWNER_ID, venueId],
    );

    const { rowCount: subsUpdated } = await client.query(
      `UPDATE subscriptions SET owner_id = $1, updated_at = now() WHERE venue_id = $2`,
      [NEW_OWNER_ID, venueId],
    );

    const { rowCount: photosUpdated } = await client.query(
      `UPDATE photos SET owner_id = $1
       WHERE id::text IN (
         SELECT unnest(COALESCE(v.photos, ARRAY[]::text[])) FROM venues v WHERE v.id = $2
         UNION
         SELECT unnest(COALESCE(s.photos, ARRAY[]::text[])) FROM spaces s WHERE s.venue_id = $2
         UNION
         SELECT unnest(COALESCE(p.photos, ARRAY[]::text[])) FROM packs p
           WHERE p.id IN (
             SELECT pack_id FROM packs_spaces
             WHERE space_id IN (SELECT id FROM spaces WHERE venue_id = $2)
           )
       )`,
      [NEW_OWNER_ID, venueId],
    );

    const { rowCount: attachmentsUpdated } = await client.query(
      `UPDATE attachments SET owner_id = $1
       WHERE id::text IN (
         SELECT unnest(COALESCE(p.attachments, ARRAY[]::text[])) FROM packs p
           WHERE p.id IN (
             SELECT pack_id FROM packs_spaces
             WHERE space_id IN (SELECT id FROM spaces WHERE venue_id = $2)
           )
       )`,
      [NEW_OWNER_ID, venueId],
    );

    await client.query("COMMIT");
    console.log(`Venue ${venueId}:`, {
      venuesUpdated,
      spacesUpdated,
      packsUpdated,
      subsUpdated,
      photosUpdated,
      attachmentsUpdated,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  }
}

const { rows: verify } = await client.query(
  `SELECT v.id, v.name, v.owner_id, u.email
   FROM venues v
   LEFT JOIN auth.users u ON u.id = v.owner_id
   WHERE v.id = ANY($1::uuid[])`,
  [venueIds],
);
console.log("\nVerification:");
for (const row of verify) {
  console.log(`  ${row.name || row.id} -> ${row.email} (${row.owner_id})`);
}

await client.end();
console.log("\nDone.");
