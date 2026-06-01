import { connectNew } from "./lib.mjs";

async function main() {
  const db = await connectNew();
  console.log("Connected\n");

  // 1. Prices content in migrated packs (the embedded availabilities)
  const priceStats = await db.query(`
    SELECT
      count(*)::int AS total,
      count(*) FILTER (WHERE prices IS NOT NULL AND prices <> '[]'::jsonb)::int AS with_prices,
      count(*) FILTER (WHERE jsonb_array_length(COALESCE(prices,'[]'::jsonb)) > 0)::int AS non_empty
    FROM public.packs
  `);
  console.log("packs prices:", priceStats.rows[0]);

  const sched = await db.query(`
    SELECT count(*)::int AS packs_with_schedules
    FROM public.packs
    WHERE EXISTS (
      SELECT 1 FROM jsonb_array_elements(COALESCE(prices,'[]'::jsonb)) p
      WHERE jsonb_array_length(COALESCE(p->'schedules','[]'::jsonb)) > 0
    )
  `);
  console.log("packs with schedules:", sched.rows[0].packs_with_schedules);

  // Sample one pack's prices
  const sample = await db.query(`
    SELECT id, name, jsonb_pretty(prices) AS prices
    FROM public.packs
    WHERE jsonb_array_length(COALESCE(prices,'[]'::jsonb)) > 0
    LIMIT 1
  `);
  if (sample.rows[0]) {
    console.log(`\nSample pack ${sample.rows[0].name} (${sample.rows[0].id}):`);
    console.log(sample.rows[0].prices?.slice(0, 1200));
  }

  // 2. Check jmolina@rinu.pt
  const user = await db.query(
    `SELECT u.id, u.email, p.roles
     FROM auth.users u
     LEFT JOIN public.profiles p ON p.id = u.id
     WHERE lower(u.email) = 'jmolina@rinu.pt'`,
  );
  console.log("\njmolina@rinu.pt:", user.rows[0] ?? "NOT FOUND");

  await db.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
