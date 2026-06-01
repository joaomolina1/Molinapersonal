import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { connectNew } from "./lib.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TSV_PATH = join(__dirname, "data", "highlights.tsv");

function parseDateOnly(str) {
  if (!str || str === "null") return null;
  const [d, m, y] = str.trim().split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

function parseTimestamp(str) {
  if (!str || str === "null") return null;
  const [datePart, timePart] = str.trim().split(" ");
  const [d, m, y] = datePart.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}T${timePart}Z`;
}

function parseBool(str) {
  if (!str || str === "null") return false;
  return str.toUpperCase() === "TRUE";
}

function parseTsv(content) {
  const lines = content.trim().split(/\r?\n/);
  const header = lines[0].split("\t");
  return lines.slice(1).map((line) => {
    const cols = line.split("\t");
    const row = Object.fromEntries(header.map((h, i) => [h, cols[i]]));
    return {
      id: row.id,
      created_at: parseTimestamp(row.created_at),
      updated_at: parseTimestamp(row.updated_at),
      deleted_at: parseTimestamp(row.deleted_at),
      space_id: row.space_id,
      from_date: parseDateOnly(row.from_date),
      to_date: parseDateOnly(row.to_date),
      priority: row.priority ? Number(row.priority) : null,
      mode: row.mode || null,
      recommended: parseBool(row.recommended),
    };
  });
}

async function main() {
  const raw = readFileSync(TSV_PATH, "utf8");
  const parsed = parseTsv(raw);
  console.log(`Parsed ${parsed.length} highlights from TSV\n`);

  const newDb = await connectNew();
  const spaceIdsRes = await newDb.query(`SELECT id FROM public.spaces`);
  const spaceIds = new Set(spaceIdsRes.rows.map((r) => r.id));

  const rows = parsed.filter((r) => spaceIds.has(r.space_id));
  const skipped = parsed.length - rows.length;
  console.log(`Importing ${rows.length} rows (${skipped} skipped — space not in target)`);

  if (rows.length === 0) {
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

  const active = await newDb.query(`
    SELECT count(*) FROM public.highlights
    WHERE deleted_at IS NULL
      AND from_date <= CURRENT_DATE
      AND to_date >= CURRENT_DATE
  `);
  console.log(`Active today: ${active.rows[0].count}`);

  const byMode = await newDb.query(`
    SELECT mode, count(*) FROM public.highlights
    WHERE deleted_at IS NULL
      AND from_date <= CURRENT_DATE
      AND to_date >= CURRENT_DATE
    GROUP BY mode ORDER BY mode
  `);
  console.log("Active by mode:", byMode.rows);

  await newDb.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
