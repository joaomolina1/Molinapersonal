import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
function loadEnv(file) {
  const raw = readFileSync(join(__dirname, "..", "..", file), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))
      v = v.slice(1, -1);
    env[m[1]] = v;
  }
  return env;
}

const env = loadEnv(".env");
const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const pageSize = 1000;
let offset = 0;
const ids = new Set();
while (true) {
  const { data, error } = await admin
    .from("packs_spaces")
    .select("space_id, packs(prices, status, deleted_at)")
    .range(offset, offset + pageSize - 1);
  if (error) { console.error("page error", error); break; }
  if (!data?.length) break;
  for (const link of data) {
    const pack = link.packs;
    if (!pack || pack.deleted_at || pack.status !== 2) continue;
    const prices = pack.prices;
    if (!Array.isArray(prices) || !prices.length) continue;
    const ok = prices.some((r) => {
      const to = r.to ? new Date(r.to).getTime() : Infinity;
      return to >= Date.now();
    });
    if (ok) ids.add(link.space_id);
  }
  if (data.length < pageSize) break;
  offset += pageSize;
}
console.log("qualifying ids:", ids.size);

const idArr = [...ids];
const { data, error } = await admin
  .from("spaces")
  .select(`id, venues!inner (status)`)
  .eq("status", 2)
  .is("deleted_at", null)
  .eq("venues.status", 2)
  .is("venues.deleted_at", null)
  .in("id", idArr);

console.log("in() query error:", error);
console.log("in() rows:", data?.length ?? 0);

// try batched
let total = 0;
for (let i = 0; i < idArr.length; i += 100) {
  const batch = idArr.slice(i, i + 100);
  const r = await admin.from("spaces").select("id").in("id", batch).eq("status", 2);
  if (r.error) console.log("batch error at", i, r.error.message);
  total += r.data?.length ?? 0;
}
console.log("batched total:", total);
