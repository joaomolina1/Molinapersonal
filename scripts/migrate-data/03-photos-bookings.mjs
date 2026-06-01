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
  const spaceIds = new Set((await newDb.query(`SELECT id FROM public.spaces`)).rows.map((r) => r.id));
  const packIds = new Set((await newDb.query(`SELECT id FROM public.packs`)).rows.map((r) => r.id));

  // PHOTOS (owner_id -> profiles). Keep CDN URLs as-is.
  await copyFiltered({
    oldDb, newDb, label: "photos", targetTable: "public.photos",
    keepFn: (r) => userIds.has(r.owner_id),
    selectSql: `
      SELECT row_to_json(t) AS j FROM (
        SELECT id, owner_id, created_at, url,
               COALESCE(large_url,'') AS large_url,
               COALESCE(medium_url,'') AS medium_url,
               COALESCE(small_url,'') AS small_url,
               COALESCE(extension,'') AS extension,
               NULL::text AS lock_id, NULL::timestamptz AS locked_at, 0 AS attempts
        FROM photos.photos
      ) t`,
  });

  // BOOKINGS (user_id -> profiles, space_id -> spaces, pack_id -> packs/null)
  await copyFiltered({
    oldDb, newDb, label: "bookings", targetTable: "public.bookings",
    keepFn: (r) => userIds.has(r.user_id) && spaceIds.has(r.space_id) && (r.pack_id == null || packIds.has(r.pack_id)),
    selectSql: `
      SELECT row_to_json(t) AS j FROM (
        SELECT id, created_at, updated_at, user_id, space_id, pack_id, event_date,
               start_at::text AS start_at, end_at::text AS end_at, num_people, kind,
               status, layout, notes, billing_name, billing_vat, billing_address,
               billing_postal_code, billing_city, billing_country, contact_name,
               contact_phone_extension, contact_phone_number, contact_email,
               free_cancellation, total_amount, commission, cancelled_by, timezone,
               COALESCE(currency,'eur') AS currency, ical_import_id, external_id,
               COALESCE(total_amount, 0) AS upfront_amount,
               100 AS upfront_percentage
        FROM bookings.bookings
      ) t`,
  });

  // PAYMENTS (user_id -> profiles, booking_id -> bookings)
  const bookingIds = new Set((await newDb.query(`SELECT id FROM public.bookings`)).rows.map((r) => r.id));
  await copyFiltered({
    oldDb, newDb, label: "payments", targetTable: "public.payments",
    keepFn: (r) => userIds.has(r.user_id) && bookingIds.has(r.booking_id),
    selectSql: `
      SELECT row_to_json(t) AS j FROM (
        SELECT id, created_at, updated_at, user_id, booking_id, provider, external_id,
               status, COALESCE(data,'{}'::jsonb) AS data
        FROM bookings.payments
      ) t`,
  });

  await oldDb.end();
  await newDb.end();
  console.log("\nPhotos/bookings/payments done.");
}

main().catch((e) => { console.error(e); process.exit(1); });
