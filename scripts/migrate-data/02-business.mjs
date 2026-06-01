import { connectOld, connectNew, copyViaJson } from "./lib.mjs";

async function main() {
  const oldDb = await connectOld();
  const newDb = await connectNew();
  console.log("Connected\n");

  // Valid user ids that exist in the new auth.users (FK target for owner_id).
  const usersRes = await newDb.query(`SELECT id FROM auth.users`);
  const userIds = new Set(usersRes.rows.map((r) => r.id));
  console.log(`Known users in target: ${userIds.size}\n`);

  const inClause = `(SELECT id FROM auth.users)`; // not usable cross-db; filter in JS instead

  // Helper that filters rows by a predicate before copy.
  async function copyFiltered({ selectSql, targetTable, keepFn, label, conflict }) {
    const res = await oldDb.query(selectSql);
    let rows = res.rows.map((r) => r.j);
    const before = rows.length;
    if (keepFn) rows = rows.filter(keepFn);
    const skipped = before - rows.length;

    let inserted = 0;
    const batchSize = 500;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const r = await newDb.query(
        `INSERT INTO ${targetTable}
         SELECT * FROM jsonb_populate_recordset(null::${targetTable}, $1::jsonb)
         ON CONFLICT ${conflict ?? "(id) DO NOTHING"}`,
        [JSON.stringify(batch)],
      );
      inserted += r.rowCount;
      process.stdout.write(`\r  ${label}: ${Math.min(i + batchSize, rows.length)}/${rows.length} (ins ${inserted}, skip ${skipped})   `);
    }
    process.stdout.write("\n");
    return { before, inserted, skipped };
  }

  // VENUES (owner_id -> profiles). Exclude search_vector (trigger recomputes).
  await copyFiltered({
    label: "venues",
    targetTable: "public.venues",
    keepFn: (r) => userIds.has(r.owner_id),
    selectSql: `
      SELECT row_to_json(t) AS j FROM (
        SELECT id, created_at, updated_at, deleted_at, owner_id, reference, status,
               name, description, attributes, primary_photo, photos, country,
               street1, street2, postal_code, city, latitude, longitude,
               billing_name, billing_vat, billing_address, billing_iban,
               billing_postal_code, billing_city, COALESCE(billing_email,'') AS billing_email,
               contact_name, contact_phone_extension, contact_phone_number, contact_email,
               COALESCE(currency,'eur') AS currency, COALESCE(commission,10) AS commission,
               COALESCE(subscription,0) AS subscription, COALESCE(journey,0) AS journey
        FROM venues.venues
      ) t`,
  });

  // SPACES (owner_id -> profiles, venue_id -> venues)
  const venueIdsRes = await newDb.query(`SELECT id FROM public.venues`);
  const venueIds = new Set(venueIdsRes.rows.map((r) => r.id));
  await copyFiltered({
    label: "spaces",
    targetTable: "public.spaces",
    keepFn: (r) => userIds.has(r.owner_id) && venueIds.has(r.venue_id),
    selectSql: `
      SELECT row_to_json(t) AS j FROM (
        SELECT id, created_at, updated_at, deleted_at, owner_id, venue_id, reference,
               status, name, description, attributes, primary_photo, photos, area,
               COALESCE(journey,0) AS journey
        FROM venues.spaces
      ) t`,
  });

  // PACKS (owner_id -> profiles)
  await copyFiltered({
    label: "packs",
    targetTable: "public.packs",
    keepFn: (r) => userIds.has(r.owner_id),
    selectSql: `
      SELECT row_to_json(t) AS j FROM (
        SELECT id, created_at, updated_at, deleted_at, owner_id, reference, status,
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
      ) t`,
  });

  // PACKS_SPACES (pack_id -> packs, space_id -> spaces)
  const packIdsRes = await newDb.query(`SELECT id FROM public.packs`);
  const packIds = new Set(packIdsRes.rows.map((r) => r.id));
  const spaceIdsRes = await newDb.query(`SELECT id FROM public.spaces`);
  const spaceIds = new Set(spaceIdsRes.rows.map((r) => r.id));
  await copyFiltered({
    label: "packs_spaces",
    targetTable: "public.packs_spaces",
    conflict: "(pack_id, space_id) DO NOTHING",
    keepFn: (r) => packIds.has(r.pack_id) && spaceIds.has(r.space_id),
    selectSql: `SELECT row_to_json(t) AS j FROM (SELECT pack_id, space_id FROM venues.packs_spaces) t`,
  });

  await copyFiltered({
    label: "highlights",
    targetTable: "public.highlights",
    keepFn: (r) => spaceIds.has(r.space_id),
    selectSql: `
      SELECT row_to_json(t) AS j FROM (
        SELECT id, created_at, updated_at, deleted_at, space_id,
               from_date, to_date, priority, mode, recommended
        FROM venues.highlights
      ) t`,
  });

  await oldDb.end();
  await newDb.end();
  console.log("\nBusiness (venues/spaces/packs) done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
