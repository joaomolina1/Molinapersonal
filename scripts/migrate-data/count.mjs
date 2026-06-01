import { connectNew } from "./lib.mjs";
const db = await connectNew();
const tables = [
  "auth.users", "public.profiles", "public.venues", "public.spaces",
  "public.packs", "public.packs_spaces", "public.photos", "public.bookings",
  "public.payments", "public.watchlist", "public.review", "public.quote",
  "public.contact_request", "public.icals_exports", "public.icals_imports",
];
for (const t of tables) {
  try {
    const r = await db.query(`SELECT count(*)::int n FROM ${t}`);
    console.log(`${t}: ${r.rows[0].n}`);
  } catch (e) {
    console.log(`${t}: ERR ${e.message}`);
  }
}
await db.end();
