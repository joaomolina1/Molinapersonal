import type { PriceFilter } from "@lib/api/pricing";
import { computePackPrice } from "@lib/api/pricing";
import {
  intervalToGoDuration,
  mapExtras,
  mapPack,
  parseGoDuration,
} from "@lib/api/serialize";
import { parseExtraIDs, parseExtraParams } from "@lib/api/bookings";
import { extraParamsMap } from "@lib/extras/quantities";

type QuoteRow = {
  event_date?: string | null;
  start_at?: unknown;
  end_at?: unknown;
  num_people?: number | null;
};

export function buildPriceFilterFromQuote(
  quote: QuoteRow,
  extraIDs: string[],
  extraParamsBody: unknown,
): PriceFilter | null {
  const dateStr = quote.event_date;
  if (!dateStr || !quote.start_at || !quote.end_at) return null;

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;

  const startStr = intervalToGoDuration(quote.start_at);
  const endStr = intervalToGoDuration(quote.end_at);
  const start = parseGoDuration(startStr);
  const end = parseGoDuration(endStr);
  if (!start || !end) return null;

  const parsedExtraParams = Array.isArray(extraParamsBody)
    ? extraParamsBody
    : parseExtraParams({ extra_params: extraParamsBody });

  return {
    date,
    start,
    end,
    pax: quote.num_people ?? null,
    extraIDs,
    extraParams: extraParamsMap(parsedExtraParams),
  };
}

export function parseLeadPackExtrasBody(body: Record<string, unknown>): {
  extraIDs: string[];
  extraParams: ReturnType<typeof parseExtraParams>;
} {
  const extraIDs = parseExtraIDs(body);
  const extraParams = parseExtraParams(body);
  return { extraIDs, extraParams };
}

export function leadPackExtrasForDb(
  extraIDs: string[],
  extraParams: ReturnType<typeof parseExtraParams>,
) {
  return {
    extra_ids: extraIDs,
    extra_params: extraParams,
  };
}

export function mapLeadPackExtrasFromRow(row: {
  extra_ids?: string[] | null;
  extra_params?: unknown;
}) {
  const extraIDs = Array.isArray(row.extra_ids) ? row.extra_ids.map(String) : [];
  const extraParams = Array.isArray(row.extra_params) ? row.extra_params : [];
  return { extraIDs, extraParams };
}

export function computeLeadPackPrice(
  packRow: Record<string, unknown>,
  filter: PriceFilter | null,
) {
  if (!filter) {
    return { price: null, reason: "missing_event_context" as const };
  }
  try {
    const price = computePackPrice(packRow as never, filter);
    if (!price) {
      return { price: null, reason: "unavailable" as const };
    }
    return { price, reason: null };
  } catch {
    return { price: null, reason: "error" as const };
  }
}

export function mapPackPreviewForAdmin(packRow: Record<string, unknown>) {
  const mapped = mapPack(packRow);
  const extras = mapExtras(packRow.extras).map((raw) => {
    const e = raw as Record<string, unknown>;
    const priceHour = Number(e.priceHour ?? 0);
    const pricePax = Number(e.pricePax ?? 0);
    let type: "fixed" | "per-hour" | "per-person" | "per-hour-and-person" =
      "fixed";
    if (pricePax > 0 && priceHour > 0) type = "per-hour-and-person";
    else if (priceHour > 0) type = "per-hour";
    else if (pricePax > 0) type = "per-person";
    return {
      id: String(e.id ?? ""),
      type,
      description: String(e.description ?? ""),
      tooltip: e.tooltip != null ? String(e.tooltip) : null,
      priceHour,
      pricePax,
      fixedPrice: Number(e.fixedPrice ?? 0),
      mandatory: Boolean(e.mandatory),
      defaultHour: e.defaultHour != null ? Number(e.defaultHour) : null,
      minHour: e.minHour != null ? Number(e.minHour) : null,
      maxHour: e.maxHour != null ? Number(e.maxHour) : null,
      defaultPax: e.defaultPax != null ? Number(e.defaultPax) : null,
      minPax: e.minPax != null ? Number(e.minPax) : null,
      maxPax: e.maxPax != null ? Number(e.maxPax) : null,
    };
  });
  return { ...mapped, extras };
}
