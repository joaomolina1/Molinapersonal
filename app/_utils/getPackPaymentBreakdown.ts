import { Pack } from "@/_models/pack";
import { computePackPaymentBreakdown } from "@lib/payment/upfront";

export function getPackPaymentBreakdown(
  pack: Pick<
    Pack,
    "price" | "cancellationPeriod" | "upfrontPercentage"
  >,
  eventDate: Date,
) {
  if (!pack.price?.value || !pack.cancellationPeriod) {
    return null;
  }

  return computePackPaymentBreakdown({
    totalAmount: pack.price.value,
    cancellationPeriod: pack.cancellationPeriod,
    upfrontPercentage: pack.upfrontPercentage,
    eventDate,
  });
}
