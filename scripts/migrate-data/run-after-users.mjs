import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { connectNew, connectOld } from "./lib.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..", "..");

function runNode(script) {
  return new Promise((resolve, reject) => {
    const p = spawn(process.execPath, [join(__dirname, script)], {
      stdio: "inherit",
      cwd: root,
    });
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`${script} exit ${code}`))));
  });
}

async function waitUsers(target = 5100, pollMs = 20000) {
  const db = await connectNew();
  let last = 0;
  let stable = 0;
  for (;;) {
    const n = (await db.query(`SELECT count(*)::int n FROM auth.users`)).rows[0].n;
    console.log(`auth.users: ${n} (target ${target})`);
    if (n >= target) {
      await db.end();
      return n;
    }
    if (n === last) stable += 1;
    else stable = 0;
    last = n;
    // If import stalled for ~2 min, continue with what we have
    if (stable >= 6 && n >= 5000) {
      console.log(`Proceeding with ${n} users (import appears stalled)`);
      await db.end();
      return n;
    }
    await new Promise((r) => setTimeout(r, pollMs));
  }
}

async function verify() {
  const oldDb = await connectOld();
  const newDb = await connectNew();
  const checks = [
    ["auth.users", "SELECT count(*)::int n FROM auth.users", "SELECT count(*)::int n FROM auth.users"],
    ["profiles", "SELECT count(*)::int n FROM users.users", "SELECT count(*)::int n FROM public.profiles"],
    ["venues", "SELECT count(*)::int n FROM venues.venues", "SELECT count(*)::int n FROM public.venues"],
    ["spaces", "SELECT count(*)::int n FROM venues.spaces", "SELECT count(*)::int n FROM public.spaces"],
    ["packs", "SELECT count(*)::int n FROM venues.packs", "SELECT count(*)::int n FROM public.packs"],
    ["photos", "SELECT count(*)::int n FROM photos.photos", "SELECT count(*)::int n FROM public.photos"],
    ["bookings", "SELECT count(*)::int n FROM bookings.bookings", "SELECT count(*)::int n FROM public.bookings"],
    ["payments", "SELECT count(*)::int n FROM bookings.payments", "SELECT count(*)::int n FROM public.payments"],
    ["watchlist", "SELECT count(*)::int n FROM users.watchlist", "SELECT count(*)::int n FROM public.watchlist"],
    ["reviews", "SELECT count(*)::int n FROM reviews.review", "SELECT count(*)::int n FROM public.review"],
  ];
  console.log("\n=== Verification ===");
  for (const [label, oldSql, newSql] of checks) {
    const oldN = (await oldDb.query(oldSql)).rows[0].n;
    const newN = (await newDb.query(newSql)).rows[0].n;
    const pct = oldN ? Math.round((newN / oldN) * 100) : "-";
    console.log(`${label.padEnd(12)} old=${String(oldN).padStart(6)} new=${String(newN).padStart(6)} (${pct}%)`);
  }
  const pub = await newDb.query(
    `SELECT count(*)::int n FROM public.spaces WHERE status = 2 AND deleted_at IS NULL`,
  );
  console.log(`published spaces: ${pub.rows[0].n}`);
  await oldDb.end();
  await newDb.end();
}

async function main() {
  console.log("=== Waiting for users import ===");
  const n = await waitUsers();
  console.log(`Users ready: ${n}\n`);

  console.log("=== Business ===");
  await runNode("02-business.mjs");

  console.log("\n=== Photos + bookings ===");
  await runNode("03-photos-bookings.mjs");

  console.log("\n=== Rest ===");
  await runNode("04-rest.mjs");

  // Re-run business to catch rows whose owners were imported late
  console.log("\n=== Business (2nd pass) ===");
  await runNode("02-business.mjs");

  console.log("\n=== Photos + bookings (2nd pass) ===");
  await runNode("03-photos-bookings.mjs");

  console.log("\n=== Rest (2nd pass) ===");
  await runNode("04-rest.mjs");

  await verify();
  console.log("\nMigration complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
