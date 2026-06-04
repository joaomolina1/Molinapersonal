import Stripe from "stripe";
import { optionalEnvValue } from "@lib/env";
import { parseSubscriptionInt } from "@lib/api/serialize";

let stripe: Stripe | null = null;

export function getStripeClient(): Stripe {
  if (!stripe) {
    const key = optionalEnvValue(process.env.STRIPE_SECRET_KEY);
    if (!key) throw new Error("STRIPE_SECRET_KEY not configured");
    stripe = new Stripe(key);
  }
  return stripe;
}

export async function createBookingCheckoutSession(params: {
  paymentId: string;
  bookingId: string;
  contactEmail: string;
  currency: string;
  amount: number;
}): Promise<{ clientSecret: string; sessionId: string }> {
  const client = getStripeClient();
  const siteUrl =
    optionalEnvValue(process.env.NEXT_PUBLIC_SITE_URL) ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
  const returnBase =
    optionalEnvValue(process.env.STRIPE_RETURN_URL) ?? `${siteUrl}/book`;

  const returnUrl = new URL(returnBase);
  returnUrl.searchParams.set("bookingID", params.bookingId);
  returnUrl.searchParams.set("paymentID", params.paymentId);

  const session = await client.checkout.sessions.create({
    ui_mode: "embedded",
    customer_email: params.contactEmail || undefined,
    mode: "payment",
    return_url: returnUrl.toString(),
    line_items: [
      {
        price_data: {
          currency: params.currency.toLowerCase(),
          product_data: {
            name: "Booking",
            description: "Booking by RINU",
          },
          unit_amount: Math.round(params.amount * 100),
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      metadata: {
        paymentID: params.paymentId,
        bookingID: params.bookingId,
      },
      receipt_email: params.contactEmail || undefined,
    },
    expires_at: Math.floor(Date.now() / 1000) + 31 * 60,
  });

  if (!session.client_secret) {
    throw new Error("Stripe session missing client_secret");
  }

  return { clientSecret: session.client_secret, sessionId: session.id };
}

export type SubscriptionPlan = "premium" | "expert";
export type SubscriptionInterval = "month" | "year";

export function resolvePriceId(
  plan: SubscriptionPlan,
  interval: SubscriptionInterval,
): string | undefined {
  const key = `STRIPE_PRICE_${plan.toUpperCase()}_${interval.toUpperCase()}`;
  return optionalEnvValue(process.env[key]);
}

function subscriptionReturnBase(): string {
  const siteUrl =
    optionalEnvValue(process.env.NEXT_PUBLIC_SITE_URL) ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  return `${siteUrl}/host`;
}

export async function createSubscriptionCheckoutSession(params: {
  venueId: string;
  ownerId: string;
  plan: SubscriptionPlan;
  interval: SubscriptionInterval;
  customerEmail: string;
  customerId?: string;
}): Promise<{ clientSecret: string; sessionId: string }> {
  const client = getStripeClient();
  const priceId = resolvePriceId(params.plan, params.interval);
  if (!priceId) {
    throw new Error(
      `Stripe price not configured for ${params.plan}/${params.interval}`,
    );
  }

  const returnUrl = new URL(subscriptionReturnBase());
  returnUrl.searchParams.set("venueID", params.venueId);
  returnUrl.searchParams.set("subscription", "success");

  const session = await client.checkout.sessions.create({
    ui_mode: "embedded",
    mode: "subscription",
    return_url: returnUrl.toString(),
    customer: params.customerId || undefined,
    customer_email: params.customerId ? undefined : params.customerEmail || undefined,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      metadata: {
        venueID: params.venueId,
        ownerID: params.ownerId,
        plan: params.plan,
        interval: params.interval,
      },
    },
    metadata: {
      venueID: params.venueId,
      ownerID: params.ownerId,
      plan: params.plan,
      interval: params.interval,
    },
  });

  if (!session.client_secret) {
    throw new Error("Stripe session missing client_secret");
  }

  return { clientSecret: session.client_secret, sessionId: session.id };
}

export async function createBillingPortalSession(params: {
  customerId: string;
  returnUrl?: string;
}): Promise<{ url: string }> {
  const client = getStripeClient();
  const session = await client.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl ?? subscriptionReturnBase(),
  });
  return { url: session.url };
}

function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status,
): "active" | "past_due" | "canceled" | "incomplete" {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
    case "incomplete_expired":
      return "canceled";
    default:
      return "incomplete";
  }
}

export async function syncSubscriptionFromStripe(
  admin: ReturnType<typeof import("@lib/db").createAdminClient>,
  subscription: Stripe.Subscription,
): Promise<void> {
  const meta = subscription.metadata ?? {};
  const venueId = meta.venueID;
  const ownerId = meta.ownerID;
  if (!venueId) return;

  const plan = (meta.plan as string) || "premium";
  const item = subscription.items?.data?.[0];
  const interval =
    (meta.interval as string) || item?.price?.recurring?.interval || "month";
  const status = mapStripeSubscriptionStatus(subscription.status);
  const customerId =
    typeof subscription.customer === "string"
      ? subscription.customer
      : subscription.customer?.id;

  const periodEnd =
    (subscription as unknown as { current_period_end?: number })
      .current_period_end ??
    (item as unknown as { current_period_end?: number } | undefined)
      ?.current_period_end;

  const row: Record<string, unknown> = {
    venue_id: venueId,
    plan,
    billing_interval: interval,
    status,
    stripe_customer_id: customerId ?? null,
    stripe_subscription_id: subscription.id,
    current_period_end: periodEnd
      ? new Date(periodEnd * 1000).toISOString()
      : null,
    cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    updated_at: new Date().toISOString(),
  };
  if (ownerId) row.owner_id = ownerId;

  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", subscription.id)
    .maybeSingle();

  if (existing) {
    await admin.from("subscriptions").update(row).eq("id", existing.id);
  } else {
    await admin
      .from("subscriptions")
      .insert({ ...row, created_at: new Date().toISOString() });
  }

  // Reflect the tier on the venue (drives public visibility/featuring).
  const venueTier = status === "canceled" ? "basic" : plan;
  await admin
    .from("venues")
    .update({ subscription: parseSubscriptionInt(venueTier) })
    .eq("id", venueId);

  if (venueTier === "basic") {
    const { revokeVenueCollaborators } = await import("@lib/api/venueAccess");
    await revokeVenueCollaborators(admin, venueId);
  }

  // When the subscription ends, retire its featured highlights.
  if (status === "canceled" && existing) {
    await admin
      .from("highlights")
      .update({ deleted_at: new Date().toISOString() })
      .eq("subscription_id", existing.id)
      .is("deleted_at", null);
  }
}

export async function updatePaymentFromStripeEvent(
  admin: ReturnType<typeof import("@lib/db").createAdminClient>,
  params: {
    paymentId?: string;
    externalId?: string;
    status: "pending" | "paid" | "cancelled";
  },
): Promise<void> {
  let paymentQuery = admin.from("payments").select("*");
  if (params.paymentId) {
    paymentQuery = paymentQuery.eq("id", params.paymentId);
  } else if (params.externalId) {
    paymentQuery = paymentQuery.eq("external_id", params.externalId);
  } else {
    return;
  }

  const { data: payment } = await paymentQuery.maybeSingle();
  if (!payment) return;

  await admin
    .from("payments")
    .update({
      status: params.status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  const { data: booking } = await admin
    .from("bookings")
    .select("status")
    .eq("id", payment.booking_id)
    .maybeSingle();

  if (booking?.status === "confirmed") return;

  let bookingStatus: string | null = null;
  switch (params.status) {
    case "pending":
      bookingStatus = "inProgress";
      break;
    case "paid":
      bookingStatus = "confirmed";
      break;
    case "cancelled":
      bookingStatus = "abandoned";
      break;
  }

  if (bookingStatus) {
    await admin
      .from("bookings")
      .update({
        status: bookingStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.booking_id);
  }
}
