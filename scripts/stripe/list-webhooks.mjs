import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Stripe from "stripe";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv(file) {
  const raw = readFileSync(join(__dirname, "..", "..", file), "utf8");
  const env = {};
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (!m) continue;
    let v = m[2].trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    env[m[1]] = v;
  }
  return env;
}

const key = loadEnv(".env").STRIPE_SECRET_KEY;
if (!key) {
  console.error("Missing STRIPE_SECRET_KEY in .env");
  process.exit(1);
}

const stripe = new Stripe(key);
const { data } = await stripe.webhookEndpoints.list({ limit: 20 });

if (!data.length) {
  console.log("Nenhum webhook encontrado na conta (test mode).");
  process.exit(0);
}

console.log("Webhooks na tua conta Stripe (test):\n");
for (const ep of data) {
  console.log(`URL: ${ep.url}`);
  console.log(`ID:  ${ep.id}`);
  console.log(`Estado: ${ep.status}`);
  const events = ep.enabled_events ?? [];
  console.log(
    `Eventos: ${events.includes("*") ? "todos" : events.join(", ")}`,
  );
  console.log("");
}

console.log(
  "O whsec_ correcto e o Signing secret do endpoint cuja URL e:\n  https://molinapersonal.vercel.app/api/payments/v1/stripe/webhook",
);
