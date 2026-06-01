import { formatDate } from "@/_utils/date";

export function formatShortCancellationDate(date: Date): string {
  const day = formatDate(date, { day: "numeric" });
  const month = formatDate(date, { month: "short" }).slice(0, -1);
  return `${day} ${month}`;
}

export function formatRemainingPaymentDate(date: Date): string {
  const day = formatDate(date, { day: "numeric" });
  const month = formatDate(date, { month: "numeric" });
  return `${day}/${month}`;
}
