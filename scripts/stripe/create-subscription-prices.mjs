/**
 * Creates EUR recurring prices for Premium / Expert (49€/mês, 517€/ano, 99€/mês, 1072€/ano).
 * Run: node scripts/stripe/create-subscription-prices.mjs
 * Then copy the printed STRIPE_PRICE_* lines into .env and Vercel.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import Stripe from "stripe";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv(file) {
  let raw;
  try {
    raw = readFileSync(join(__dirname, "..", "..", file), "utf8");
  } catch {
    return {};
  }
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

const PLANS = [
  {
    productNameIncludes: "premium",
    envPrefix: "PREMIUM",
    prices: [
      { interval: "month", unitAmount: 4900, nickname: "Premium monthly (49€)" },
      { interval: "year", unitAmount: 51700, nickname: "Premium yearly (517€)" },
    ],
  },
  {
    productNameIncludes: "expert",
    envPrefix: "EXPERT",
    prices: [
      { interval: "month", unitAmount: 9900, nickname: "Expert monthly (99€)" },
      { interval: "year", unitAmount: 107200, nickname: "Expert yearly (1072€)" },
    ],
  },
];

async function main() {
  const env = { ...loadEnv(".env"), ...process.env };
  const key = (env.STRIPE_SECRET_KEY ?? "").trim();
  if (!key) {
    console.error("Missing STRIPE_SECRET_KEY in .env");
    process.exit(1);
  }

  const stripe = new Stripe(key);
  const products = await stripe.products.list({ active: true, limit: 100 });
  const created = {};

  for (const plan of PLANS) {
    const product = products.data.find((p) =>
      (p.name ?? "").toLowerCase().includes(plan.productNameIncludes),
    );
    if (!product) {
      console.error(
        `No active Stripe product found containing "${plan.productNameIncludes}". Create it first.`,
      );
      process.exitCode = 2;
      continue;
    }

    console.log(`Product: ${product.name} (${product.id})\n`);

    for (const spec of plan.prices) {
      const price = await stripe.prices.create({
        product: product.id,
        currency: "eur",
        unit_amount: spec.unitAmount,
        recurring: { interval: spec.interval },
        nickname: spec.nickname,
      });
      const envKey = `STRIPE_PRICE_${plan.envPrefix}_${spec.interval.toUpperCase()}`;
      created[envKey] = price.id;
      console.log(
        `  Created ${price.id} — ${(spec.unitAmount / 100).toFixed(0)}€/${spec.interval}`,
      );
    }
    console.log("");
  }

  console.log("=".repeat(60));
  console.log("Add to .env and Vercel:\n");
  for (const [key, value] of Object.entries(created)) {
    console.log(`${key}=${value}`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
