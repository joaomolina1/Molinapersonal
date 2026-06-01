import { connectOld, connectNew } from "./lib.mjs";

/**
 * Users who re-registered on the new app got a new auth UUID before migration ran.
 * The old UUID could not be inserted (duplicate email), so venues/spaces/packs
 * owned by the old UUID were skipped. This script re-imports that data using
 * the current auth.users id for each email.
 */
async function main() {
  const oldDb = await connectOld();
  const newDb = await connectNew();
  console.log("Connected\n");

  const newUsersRes = await newDb.query(
    `SELECT id, lower(email) AS email FROM auth.users WHERE email IS NOT NULL`,
  );
  const emailToNewId = new Map(
    newUsersRes.rows.map((r) => [r.email, r.id]),
  );

  const oldUsersRes = await oldDb.query(`
    SELECT DISTINCT ON (lower(username))
      id, lower(username) AS email
    FROM auth.users
    WHERE username IS NOT NULL AND username <> '' AND deleted_at IS NULL
    ORDER BY lower(username), created_at ASC
  `);

  const remaps = [];
  for (const oldUser of oldUsersRes.rows) {
    const newId = emailToNewId.get(oldUser.email);
    if (newId && newId !== oldUser.id) {
      remaps.push({ oldId: oldUser.id, newId, email: oldUser.email });
    }
  }
  console.log(`Found ${remaps.length} users with remapped UUIDs\n`);

  const existingVenueIds = new Set(
    (await newDb.query(`SELECT id FROM public.venues`)).rows.map((r) => r.id),
  );
  const existingSpaceIds = new Set(
    (await newDb.query(`SELECT id FROM public.spaces`)).rows.map((r) => r.id),
  );
  const existingPackIds = new Set(
    (await newDb.query(`SELECT id FROM public.packs`)).rows.map((r) => r.id),
  );

  let venuesImported = 0;
  let spacesImported = 0;
  let packsImported = 0;
  let linksImported = 0;

  for (const { oldId, newId, email } of remaps) {
    const venueRes = await oldDb.query(
      `
      SELECT row_to_json(t) AS j FROM (
        SELECT id, created_at, updated_at, deleted_at, $2::uuid AS owner_id, reference, status,
               name, description, attributes, primary_photo, photos, country,
               street1, street2, postal_code, city, latitude, longitude,
               billing_name, billing_vat, billing_address, billing_iban,
               billing_postal_code, billing_city, COALESCE(billing_email,'') AS billing_email,
               contact_name, contact_phone_extension, contact_phone_number, contact_email,
               COALESCE(currency,'eur') AS currency, COALESCE(commission,10) AS commission,
               COALESCE(subscription,0) AS subscription, COALESCE(journey,0) AS journey
        FROM venues.venues
        WHERE owner_id = $1
      ) t
    `,
      [oldId, newId],
    );

    const venueRows = venueRes.rows
      .map((r) => r.j)
      .filter((r) => !existingVenueIds.has(r.id));
    if (venueRows.length > 0) {
      await newDb.query(
        `INSERT INTO public.venues
         SELECT * FROM jsonb_populate_recordset(null::public.venues, $1::jsonb)
         ON CONFLICT (id) DO UPDATE SET owner_id = EXCLUDED.owner_id`,
        [JSON.stringify(venueRows)],
      );
      venuesImported += venueRows.length;
      venueRows.forEach((r) => existingVenueIds.add(r.id));
      console.log(`${email}: ${venueRows.length} venues`);
    }

    const spaceRes = await oldDb.query(
      `
      SELECT row_to_json(t) AS j FROM (
        SELECT id, created_at, updated_at, deleted_at, $2::uuid AS owner_id, venue_id, reference,
               status, name, description, attributes, primary_photo, photos, area,
               COALESCE(journey,0) AS journey
        FROM venues.spaces
        WHERE owner_id = $1
      ) t
    `,
      [oldId, newId],
    );

    const spaceRows = spaceRes.rows
      .map((r) => r.j)
      .filter(
        (r) =>
          !existingSpaceIds.has(r.id) && existingVenueIds.has(r.venue_id),
      );
    if (spaceRows.length > 0) {
      await newDb.query(
        `INSERT INTO public.spaces
         SELECT * FROM jsonb_populate_recordset(null::public.spaces, $1::jsonb)
         ON CONFLICT (id) DO UPDATE SET owner_id = EXCLUDED.owner_id`,
        [JSON.stringify(spaceRows)],
      );
      spacesImported += spaceRows.length;
      spaceRows.forEach((r) => existingSpaceIds.add(r.id));
      console.log(`${email}: ${spaceRows.length} spaces`);
    }

    const packRes = await oldDb.query(
      `
      SELECT row_to_json(t) AS j FROM (
        SELECT id, created_at, updated_at, deleted_at, $2::uuid AS owner_id, reference, status,
               name, description, attributes, primary_photo, photos, notice_days,
               min_time, max_time, cancellation_period,
               COALESCE(prices,'[]'::jsonb) AS prices,
               COALESCE(capacities,'[]'::jsonb) AS capacities,
               COALESCE(extras,'[]'::jsonb) AS extras,
               travel_expenses,
               COALESCE(journey,0) AS journey,
               '{}'::text[] AS attachments,
               20.0 AS upfront_percentage
        FROM venues.packs
        WHERE owner_id = $1
      ) t
    `,
      [oldId, newId],
    );

    const packRows = packRes.rows
      .map((r) => r.j)
      .filter((r) => !existingPackIds.has(r.id));
    if (packRows.length > 0) {
      await newDb.query(
        `INSERT INTO public.packs
         SELECT * FROM jsonb_populate_recordset(null::public.packs, $1::jsonb)
         ON CONFLICT (id) DO UPDATE SET owner_id = EXCLUDED.owner_id`,
        [JSON.stringify(packRows)],
      );
      packsImported += packRows.length;
      packRows.forEach((r) => existingPackIds.add(r.id));
      console.log(`${email}: ${packRows.length} packs`);
    }

    if (packRows.length > 0 || spaceRows.length > 0) {
      const linkRes = await oldDb.query(
        `
        SELECT row_to_json(t) AS j FROM (
          SELECT pack_id, space_id FROM venues.packs_spaces
          WHERE pack_id IN (SELECT id FROM venues.packs WHERE owner_id = $1)
        ) t
      `,
        [oldId],
      );
      const linkRows = linkRes.rows
        .map((r) => r.j)
        .filter(
          (r) =>
            existingPackIds.has(r.pack_id) && existingSpaceIds.has(r.space_id),
        );
      if (linkRows.length > 0) {
        const r = await newDb.query(
          `INSERT INTO public.packs_spaces
           SELECT * FROM jsonb_populate_recordset(null::public.packs_spaces, $1::jsonb)
           ON CONFLICT (pack_id, space_id) DO NOTHING`,
          [JSON.stringify(linkRows)],
        );
        linksImported += r.rowCount;
      }
    }
  }

  console.log(`\nDone: ${venuesImported} venues, ${spacesImported} spaces, ${packsImported} packs, ${linksImported} pack links`);

  await oldDb.end();
  await newDb.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
