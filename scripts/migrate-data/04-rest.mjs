import { connectOld, connectNew } from "./lib.mjs";

async function copyFiltered({ oldDb, newDb, selectSql, targetTable, keepFn, label, conflict }) {
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
}

async function main() {
  const oldDb = await connectOld();
  const newDb = await connectNew();
  console.log("Connected\n");

  const userIds = new Set((await newDb.query(`SELECT id FROM auth.users`)).rows.map((r) => r.id));

  // WATCHLIST (user_id text -> profiles uuid)
  await copyFiltered({
    oldDb, newDb, label: "watchlist", targetTable: "public.watchlist",
    keepFn: (r) => userIds.has(r.user_id),
    selectSql: `
      SELECT row_to_json(t) AS j FROM (
        SELECT id, user_id, name, spaces, created_at, updated_at
        FROM users.watchlist
      ) t`,
  });

  // REVIEWS (owner_id is text, no FK)
  await copyFiltered({
    oldDb, newDb, label: "reviews", targetTable: "public.review",
    selectSql: `
      SELECT row_to_json(t) AS j FROM (
        SELECT id, created_at, updated_at, owner_id, owner_name, entity, kind,
               rating, comment, photos
        FROM reviews.review
      ) t`,
  });

  // QUOTE (no FK; user_id text nullable)
  await copyFiltered({
    oldDb, newDb, label: "quote", targetTable: "public.quote",
    selectSql: `
      SELECT row_to_json(t) AS j FROM (
        SELECT id, created_at, user_id, name, email, phone_extension, phone_number,
               company_event, company_name, vat_number, event_kind, area, country,
               event_date, start_at::text AS start_at, end_at::text AS end_at, timezone,
               budget, currency, num_people, notes, attributes,
               COALESCE(venue_id,'') AS venue_id, COALESCE(space_id,'') AS space_id,
               COALESCE(pack_id,'') AS pack_id
        FROM bookings.quote
      ) t`,
  });

  // CONTACT_REQUEST (no FK)
  await copyFiltered({
    oldDb, newDb, label: "contact_request", targetTable: "public.contact_request",
    selectSql: `
      SELECT row_to_json(t) AS j FROM (
        SELECT id, created_at, user_id, name, email, phone_extension, phone_number,
               kind, venue_id, space_id, pack_id, message
        FROM bookings.contact_request
      ) t`,
  });

  // ICALS EXPORTS / IMPORTS (owner_id -> profiles)
  await copyFiltered({
    oldDb, newDb, label: "icals_exports", targetTable: "public.icals_exports",
    keepFn: (r) => userIds.has(r.owner_id),
    selectSql: `
      SELECT row_to_json(t) AS j FROM (
        SELECT id, created_at, updated_at, owner_id, token, space_id, name,
               COALESCE(enabled,false) AS enabled
        FROM bookings.icals_exports
      ) t`,
  });
  await copyFiltered({
    oldDb, newDb, label: "icals_imports", targetTable: "public.icals_imports",
    keepFn: (r) => userIds.has(r.owner_id),
    selectSql: `
      SELECT row_to_json(t) AS j FROM (
        SELECT id, created_at, updated_at, owner_id, url, space_id, name, last_sync,
               COALESCE(enabled,false) AS enabled, COALESCE(status,'') AS status
        FROM bookings.icals_imports
      ) t`,
  });

  await oldDb.end();
  await newDb.end();
  console.log("\nRemaining tables done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
