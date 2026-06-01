import { emptyResponse } from "@lib/api/context";
import { createAdminClient } from "@lib/db";
import { optionalEnvValue } from "@lib/env";
import { getStripeClient, updatePaymentFromStripeEvent } from "@lib/stripe/checkout";
import Stripe from "stripe";

export async function POST(request: Request) {
  const secret = optionalEnvValue(process.env.STRIPE_WEBHOOK_SECRET);
  if (!secret) return emptyResponse(501);

  const signature = request.headers.get("stripe-signature");
  if (!signature) return emptyResponse(400);

  const body = await request.text();
  let event: Stripe.Event;

  try {
    event = getStripeClient().webhooks.constructEvent(body, signature, secret);
  } catch {
    return emptyResponse(400);
  }

  const admin = createAdminClient();

  if (event.type.startsWith("checkout.session.")) {
    const session = event.data.object as Stripe.Checkout.Session;
    switch (event.type) {
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired":
        await updatePaymentFromStripeEvent(admin, {
          externalId: session.id,
          status: "cancelled",
        });
        break;
      case "checkout.session.async_payment_succeeded":
        await updatePaymentFromStripeEvent(admin, {
          externalId: session.id,
          status: "paid",
        });
        break;
    }
  }

  if (event.type.startsWith("payment_intent.")) {
    const intent = event.data.object as Stripe.PaymentIntent;
    const paymentId = intent.metadata?.paymentID;
    switch (event.type) {
      case "payment_intent.canceled":
      case "payment_intent.payment_failed":
        await updatePaymentFromStripeEvent(admin, {
          paymentId,
          status: "cancelled",
        });
        break;
      case "payment_intent.succeeded":
        await updatePaymentFromStripeEvent(admin, {
          paymentId,
          status: "paid",
        });
        break;
    }
  }

  return emptyResponse(200);
}
