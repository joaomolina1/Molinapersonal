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

const fmtAmount = (price) => {
  if (price.unit_amount == null) return "n/a";
  const value = (price.unit_amount / 100).toLocaleString("pt-PT", {
    style: "currency",
    currency: (price.currency ?? "eur").toUpperCase(),
  });
  return value;
};

const intervalLabel = (price) => {
  if (!price.recurring) return "one-time";
  const { interval, interval_count } = price.recurring;
  return interval_count && interval_count > 1
    ? `every ${interval_count} ${interval}s`
    : interval;
};

// Heuristic: match a plan tier from the product name.
function tierFromName(name) {
  const n = (name ?? "").toLowerCase();
  if (n.includes("expert")) return "EXPERT";
  if (n.includes("premium")) return "PREMIUM";
  return null;
}

async function main() {
  const env = { ...loadEnv(".env"), ...process.env };
  const key = (env.STRIPE_SECRET_KEY ?? "").replace(/^['"]|['"]$/g, "").trim();

  if (!key) {
    console.error(
      "Missing STRIPE_SECRET_KEY. Add the TEST secret key (sk_test_...) to .env first.",
    );
    process.exit(1);
  }

  if (!key.startsWith("sk_test_")) {
    console.warn(
      `\n⚠️  STRIPE_SECRET_KEY does not look like a TEST key (expected sk_test_...). Continuing anyway.\n`,
    );
  }

  const stripe = new Stripe(key);

  console.log("Fetching active products and prices from Stripe...\n");

  const products = await stripe.products.list({ active: true, limit: 100 });
  const prices = await stripe.prices.list({ active: true, limit: 100 });

  const pricesByProduct = new Map();
  for (const price of prices.data) {
    const productId =
      typeof price.product === "string" ? price.product : price.product?.id;
    if (!productId) continue;
    if (!pricesByProduct.has(productId)) pricesByProduct.set(productId, []);
    pricesByProduct.get(productId).push(price);
  }

  // suggestedEnv[ENV_NAME] = price_id
  const suggestedEnv = {};

  for (const product of products.data) {
    const tier = tierFromName(product.name);
    console.log(
      `Product: ${product.name} (${product.id})${tier ? ` -> ${tier}` : ""}`,
    );

    const productPrices = pricesByProduct.get(product.id) ?? [];
    if (productPrices.length === 0) {
      console.log("  (no active prices)");
    }

    for (const price of productPrices) {
      console.log(
        `  - ${price.id} | ${fmtAmount(price)} | ${intervalLabel(price)}${
          price.nickname ? ` | "${price.nickname}"` : ""
        }`,
      );

      if (tier && price.recurring) {
        const interval = price.recurring.interval; // "month" | "year"
        if (interval === "month") {
          suggestedEnv[`STRIPE_PRICE_${tier}_MONTH`] = price.id;
        } else if (interval === "year") {
          suggestedEnv[`STRIPE_PRICE_${tier}_YEAR`] = price.id;
        }
      }
    }
    console.log("");
  }

  const expectedKeys = [
    "STRIPE_PRICE_PREMIUM_MONTH",
    "STRIPE_PRICE_PREMIUM_YEAR",
    "STRIPE_PRICE_EXPERT_MONTH",
    "STRIPE_PRICE_EXPERT_YEAR",
  ];

  console.log("=".repeat(60));
  console.log("Suggested .env entries (copy into .env and Vercel):\n");
  for (const envKey of expectedKeys) {
    const value = suggestedEnv[envKey];
    console.log(`${envKey}=${value ?? "<NOT FOUND — create this price in Stripe>"}`);
  }
  console.log("");

  const missing = expectedKeys.filter((k) => !suggestedEnv[k]);
  if (missing.length > 0) {
    console.warn(
      `⚠️  Could not auto-map ${missing.length} price(s): ${missing.join(", ")}.`,
    );
    console.warn(
      "   Ensure each plan product is named with 'Premium'/'Expert' and has a monthly + yearly recurring price in EUR.",
    );
    process.exitCode = 2;
  } else {
    console.log("✅ All 4 plan prices mapped successfully.");
  }
}

main().catch((err) => {
  console.error("Stripe verification failed:", err.message);
  process.exit(1);
});
