import { connectNew } from "./lib.mjs";

const PACK_ID = "4307fd99-5b25-4121-ba5d-6e70024f2835";

const db = await connectNew();
const { rows } = await db.query(`SELECT * FROM public.packs WHERE id = $1`, [PACK_ID]);
const pack = rows[0];
console.log("min_time:", pack.min_time, "max_time:", pack.max_time);
console.log("cancellation:", pack.cancellation_period);
console.log("prices sample:", JSON.stringify(pack.prices?.[0], null, 2));
console.log("capacities:", JSON.stringify(pack.capacities));
console.log("extras:", JSON.stringify(pack.extras));
console.log("travel:", JSON.stringify(pack.travel_expenses));

await db.end();
