import { connectOld, connectNew, copyViaJson } from "./lib.mjs";

async function main() {
  const oldDb = await connectOld();
  const newDb = await connectNew();
  console.log("Connected\n");

  const spaceIdsRes = await newDb.query(`SELECT id FROM public.spaces`);
  const spaceIds = new Set(spaceIdsRes.rows.map((r) => r.id));

  const res = await oldDb.query(`
    SELECT row_to_json(t) AS j FROM (
      SELECT id, created_at, updated_at, deleted_at, space_id,
             from_date, to_date, priority, mode, recommended
      FROM venues.highlights
    ) t
  `);

  const rows = res.rows.map((r) => r.j).filter((r) => spaceIds.has(r.space_id));
  console.log(`Highlights: ${rows.length} rows (${res.rows.length - rows.length} skipped orphans)`);

  if (rows.length === 0) {
    await oldDb.end();
    await newDb.end();
    return;
  }

  const r = await newDb.query(
    `INSERT INTO public.highlights
     SELECT * FROM jsonb_populate_recordset(null::public.highlights, $1::jsonb)
     ON CONFLICT (id) DO UPDATE SET
       updated_at = EXCLUDED.updated_at,
       deleted_at = EXCLUDED.deleted_at,
       space_id = EXCLUDED.space_id,
       from_date = EXCLUDED.from_date,
       to_date = EXCLUDED.to_date,
       priority = EXCLUDED.priority,
       mode = EXCLUDED.mode,
       recommended = EXCLUDED.recommended`,
    [JSON.stringify(rows)],
  );
  console.log(`Inserted/updated: ${r.rowCount}`);

  const count = await newDb.query(`SELECT count(*) FROM public.highlights`);
  console.log(`Total highlights in target: ${count.rows[0].count}`);

  await oldDb.end();
  await newDb.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
