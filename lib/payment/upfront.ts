export type PackPaymentBreakdown = {
  isPartial: boolean;
  totalAmount: number;
  todayAmount: number;
  laterAmount: number;
  upfrontPercentage: number;
  freeCancellationUntil: Date;
};

export function subtractCancellationPeriod(date: Date, period: string): Date {
  if (!period) return new Date(date);
  const m = period.match(
    /(?:(\d+)y)?(?:(\d+)M)?(?:(\d+)w)?(?:(\d+)d)?(?:(\d+)h)?(?:(\d+)m)?/,
  );
  const result = new Date(date);
  if (!m) return result;
  const [, y, mo, w, d, h, min] = m.map((x) => (x ? parseInt(x, 10) : 0));
  if (y) result.setUTCFullYear(result.getUTCFullYear() - y);
  if (mo) result.setUTCMonth(result.getUTCMonth() - mo);
  const days = (w ?? 0) * 7 + (d ?? 0);
  if (days) result.setUTCDate(result.getUTCDate() - days);
  if (h || min) {
    result.setTime(
      result.getTime() - ((h ?? 0) * 3600 + (min ?? 0) * 60) * 1000,
    );
  }
  return result;
}

export function computePackPaymentBreakdown(params: {
  totalAmount: number;
  cancellationPeriod: string;
  upfrontPercentage?: number | null;
  eventDate: Date;
  now?: Date;
}): PackPaymentBreakdown {
  const upfrontPct = params.upfrontPercentage ?? 20;
  const freeCancellationUntil = subtractCancellationPeriod(
    params.eventDate,
    params.cancellationPeriod,
  );
  const now = params.now ?? new Date();
  const isPartial = now.getTime() < freeCancellationUntil.getTime();

  if (!isPartial || params.totalAmount <= 0) {
    return {
      isPartial: false,
      totalAmount: params.totalAmount,
      todayAmount: params.totalAmount,
      laterAmount: 0,
      upfrontPercentage: 100,
      freeCancellationUntil,
    };
  }

  const todayAmount = (params.totalAmount * upfrontPct) / 100;

  return {
    isPartial: true,
    totalAmount: params.totalAmount,
    todayAmount,
    laterAmount: params.totalAmount - todayAmount,
    upfrontPercentage: upfrontPct,
    freeCancellationUntil,
  };
}

export function paymentBreakdownFromBooking(params: {
  totalAmount: number;
  upfrontAmount: number;
  upfrontPercentage: number;
  freeCancellationUntil: string;
}): PackPaymentBreakdown {
  const freeCancellationUntil = new Date(params.freeCancellationUntil);
  const isPartial =
    params.upfrontPercentage < 100 &&
    params.upfrontAmount > 0 &&
    params.upfrontAmount < params.totalAmount;

  return {
    isPartial,
    totalAmount: params.totalAmount,
    todayAmount: isPartial ? params.upfrontAmount : params.totalAmount,
    laterAmount: isPartial ? params.totalAmount - params.upfrontAmount : 0,
    upfrontPercentage: isPartial ? params.upfrontPercentage : 100,
    freeCancellationUntil,
  };
}
