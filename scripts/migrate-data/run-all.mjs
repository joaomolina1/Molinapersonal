import { connectOld, connectNew } from "./lib.mjs";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

function runNode(script) {
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [join(__dirname, script)], {
      stdio: "inherit",
      cwd: join(__dirname, "..", ".."),
    });
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${script} exit ${code}`))));
  });
}

async function waitUsers(target = 5100) {
  const db = await connectNew();
  for (;;) {
    const r = await db.query(`SELECT count(*)::int n FROM auth.users`);
    const n = r.rows[0].n;
    console.log(`auth.users: ${n}`);
    if (n >= target) {
      await db.end();
      return n;
    }
    await new Promise((r) => setTimeout(r, 15000));
  }
}

async function verify() {
  const oldDb = await connectOld();
  const newDb = await connectNew();
  const checks = [
    ["auth.users", "auth.users", "SELECT count(*)::int n FROM auth.users"],
    ["profiles", "public.profiles", "SELECT count(*)::int n FROM public.profiles"],
    ["venues", "venues.venues", "SELECT count(*)::int n FROM venues.venues"],
    ["spaces", "venues.spaces", "SELECT count(*)::int n FROM venues.spaces"],
    ["packs", "venues.packs", "SELECT count(*)::int n FROM venues.packs"],
    ["photos", "photos.photos", "SELECT count(*)::int n FROM photos.photos"],
    ["bookings", "bookings.bookings", "SELECT count(*)::int n FROM bookings.bookings"],
  ];
  console.log("\n=== Verification ===");
  for (const [label, oldTable, oldSql] of checks) {
    const oldN = (await oldDb.query(oldSql)).rows[0].n;
    const newTable = label === "auth.users" ? "auth.users" : `public.${label === "profiles" ? "profiles" : label}`;
    const newN = (await newDb.query(`SELECT count(*)::int n FROM ${newTable}`)).rows[0].n;
    console.log(`${label.padEnd(12)} old=${oldN} new=${newN}`);
  }
  const pub = await newDb.query(
    `SELECT count(*)::int n FROM public.spaces WHERE status = 2 AND deleted_at IS NULL`,
  );
  console.log(`published spaces: ${pub.rows[0].n}`);
  await oldDb.end();
  await newDb.end();
}

async function main() {
  console.log("=== Step 1: finish users import ===");
  await runNode("01-users.mjs");

  console.log("\n=== Step 2: business ===");
  await runNode("02-business.mjs");

  console.log("\n=== Step 3: photos + bookings ===");
  await runNode("03-photos-bookings.mjs");

  console.log("\n=== Step 4: rest ===");
  await runNode("04-rest.mjs");

  await verify();
  console.log("\nMigration complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
