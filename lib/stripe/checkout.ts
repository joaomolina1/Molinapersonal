import Stripe from "stripe";
import { optionalEnvValue } from "@lib/env";

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
