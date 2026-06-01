import { connectNew, connectOld } from "./lib.mjs";

const EMAIL = "joao.d.molina@gmail.com";
const SPACE_ID = "afc81e20-6634-491c-8ca2-05af94a4072f";

async function main() {
  const db = await connectNew();

  // All auth users with similar email
  const users = await db.query(
    `SELECT id, email, created_at FROM auth.users WHERE email ILIKE '%molina%' ORDER BY email`,
  );
  console.log("Users matching molina:", users.rows);

  const spaceAny = await db.query(
    `SELECT id, owner_id, name, status FROM public.spaces WHERE id = $1 OR id::text LIKE 'afc81e20%'`,
    [SPACE_ID],
  );
  console.log("Space in new DB:", spaceAny.rows);

  const totalSpaces = await db.query(`SELECT count(*)::int n FROM public.spaces WHERE deleted_at IS NULL`);
  console.log("Total spaces (not deleted):", totalSpaces.rows[0].n);

  // Exact qualifying logic: published pack + future prices
  const qualifying = await db.query(`
    SELECT count(DISTINCT ps.space_id)::int AS n
    FROM public.packs_spaces ps
    JOIN public.packs p ON p.id = ps.pack_id
    WHERE p.deleted_at IS NULL AND p.status = 2
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(p.prices) pr
        WHERE COALESCE(
          CASE WHEN pr->>'to' IS NULL OR pr->>'to' = '' THEN NULL
               ELSE (pr->>'to')::timestamptz END,
          'infinity'::timestamptz
        ) >= now()
      )
  `);
  console.log("Qualifying space IDs (pack filter only):", qualifying.rows[0].n);

  const searchEligible = await db.query(`
    SELECT count(DISTINCT s.id)::int AS n
    FROM public.spaces s
    JOIN public.venues v ON v.id = s.venue_id
    JOIN public.packs_spaces ps ON ps.space_id = s.id
    JOIN public.packs p ON p.id = ps.pack_id
    WHERE s.status = 2 AND s.deleted_at IS NULL
      AND v.status = 2 AND v.deleted_at IS NULL
      AND p.status = 2 AND p.deleted_at IS NULL
      AND EXISTS (
        SELECT 1 FROM jsonb_array_elements(p.prices) pr
        WHERE COALESCE(
          CASE WHEN pr->>'to' IS NULL OR pr->>'to' = '' THEN NULL
               ELSE (pr->>'to')::timestamptz END,
          'infinity'::timestamptz
        ) >= now()
      )
  `);
  console.log("Search eligible (full filter):", searchEligible.rows[0].n);

  // Packs with empty prices array
  const emptyPrices = await db.query(`
    SELECT count(DISTINCT ps.space_id)::int AS n
    FROM public.packs_spaces ps
    JOIN public.packs p ON p.id = ps.pack_id
    JOIN public.spaces s ON s.id = ps.space_id
    WHERE s.status = 2 AND p.status = 2
      AND p.deleted_at IS NULL AND s.deleted_at IS NULL
      AND (p.prices IS NULL OR p.prices = '[]'::jsonb)
  `);
  console.log("Published spaces with empty prices:", emptyPrices.rows[0].n);

  // Check old DB for space and owner
  try {
    const oldDb = await connectOld();
    const oldSpace = await oldDb.query(`
      SELECT s.id, s.owner_id, s.name, s.status, a.username AS owner_email
      FROM venues.spaces s
      LEFT JOIN auth.users a ON a.id = s.owner_id
      WHERE s.id = $1
    `, [SPACE_ID]);
    console.log("\nSpace in OLD DB:", oldSpace.rows[0]);

    const oldUser = await oldDb.query(`
      SELECT id, username FROM auth.users WHERE lower(username) = lower($1)
    `, [EMAIL]);
    console.log("User in OLD DB:", oldUser.rows[0]);

    if (oldUser.rows[0] && oldSpace.rows[0]) {
      console.log("Old owner match:", oldSpace.rows[0].owner_id === oldUser.rows[0].id);
    }

    const oldOwned = await oldDb.query(`
      SELECT count(*)::int n FROM venues.spaces WHERE owner_id = $1 AND deleted_at IS NULL
    `, [oldUser.rows[0]?.id ?? "00000000-0000-0000-0000-000000000000"]);
    console.log("Old user space count:", oldOwned.rows[0].n);

    await oldDb.end();
  } catch (e) {
    console.log("\nOld DB:", e.message);
  }

  await db.end();
}

main().catch(console.error);
