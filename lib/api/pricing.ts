import { parseGoDuration } from "@lib/api/serialize";
import {
  computeExtraPrice,
  eventDurationHours,
  initialExtraSelection,
  reconcileExtraSelection,
  usesExtraHours,
  usesExtraPax,
  type ExtraSelection,
  type ExtraQuantityConfig,
} from "@lib/extras/quantities";

// Port of the be-main pack pricing domain (packs_models.go). All durations are
// handled in seconds. Mirrors Pack.Price() and Pack.Filter() exactly so the
// frontend receives the same calculated price + unavailability reasons.

const HOUR = 3600;

type RawSchedule = {
  start?: string;
  end?: string;
  min_value?: number | null;
  minValue?: number | null;
  value_hour?: number | null;
  valueHour?: number | null;
  value_person?: number | null;
  valuePerson?: number | null;
  days_of_week?: (number | string)[];
  daysOfWeek?: (number | string)[];
};

type RawPriceRange = {
  from?: string;
  to?: string;
  schedules?: RawSchedule[];
};

type RawExtra = ExtraQuantityConfig & {
  description?: string;
  price_hour?: number | null;
  priceHour?: number | null;
  price_pax?: number | null;
  pricePax?: number | null;
  fixed_price?: number | null;
  fixedPrice?: number | null;
  default_hour?: number | null;
  min_hour?: number | null;
  max_hour?: number | null;
  default_pax?: number | null;
  min_pax?: number | null;
  max_pax?: number | null;
};

export type RawPack = {
  prices?: RawPriceRange[];
  capacities?: { layout?: string; capacity?: number }[];
  extras?: RawExtra[];
  min_time?: string | null;
  minTime?: string | null;
  max_time?: string | null;
  maxTime?: string | null;
};

export type PriceFilter = {
  date: Date | null;
  start: number | null; // seconds since midnight
  end: number | null; // seconds since midnight
  pax: number | null;
  extraIDs: string[];
  extraParams?: Record<string, { hours?: number; pax?: number }>;
};

type NormalizedSchedule = {
  start: number;
  end: number;
  minValue: number | null;
  valueHour: number | null;
  valuePax: number | null;
  days: number[];
};

const WEEKDAY_STR_TO_INT: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

function normalizeDays(value: (number | string)[] | undefined): number[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((d) => {
      if (typeof d === "number") return d;
      const key = String(d).toLowerCase().slice(0, 3);
      return WEEKDAY_STR_TO_INT[key] ?? null;
    })
    .filter((d): d is number => d !== null);
}

function normalizeSchedule(s: RawSchedule): NormalizedSchedule {
  return {
    start: parseGoDuration(s.start ?? ""),
    end: parseGoDuration(s.end ?? ""),
    minValue: (s.min_value ?? s.minValue) ?? null,
    valueHour: (s.value_hour ?? s.valueHour) ?? null,
    valuePax: (s.value_person ?? s.valuePerson) ?? null,
    days: normalizeDays(s.days_of_week ?? s.daysOfWeek),
  };
}

function packCapacity(pack: RawPack): number {
  const caps = pack.capacities ?? [];
  let res = 0;
  for (const c of caps) {
    const v = Number(c?.capacity ?? 0);
    if (v > res) res = v;
  }
  return res === 0 ? 999999 : res;
}

function priceRangeForDate(
  prices: RawPriceRange[],
  date: Date,
): RawPriceRange | null {
  const time = date.getTime();
  for (const range of prices) {
    const from = range.from ? new Date(range.from).getTime() : -Infinity;
    const to = range.to ? new Date(range.to).getTime() : Infinity;
    if (time >= from && time <= to) return range;
  }
  return null;
}

function schedulesOnInterval(
  range: RawPriceRange,
  date: Date,
  start: number,
  end: number,
): NormalizedSchedule[] {
  const weekday = date.getUTCDay();
  const res: NormalizedSchedule[] = [];
  for (const raw of range.schedules ?? []) {
    const s = normalizeSchedule(raw);
    if (!s.days.includes(weekday)) continue;
    if (start >= s.end || end <= s.start) continue;
    res.push(s);
  }
  return res;
}

function areUninterrupted(schedules: NormalizedSchedule[]): boolean {
  const sorted = [...schedules].sort((a, b) => a.start - b.start);
  let lastEnd = sorted[0].end;
  for (const s of sorted.slice(1)) {
    if (lastEnd !== s.start) return false;
    lastEnd = s.end;
  }
  return true;
}

function validPriceSchedules(
  pack: RawPack,
  filter: PriceFilter,
): NormalizedSchedule[] {
  if (filter.date == null || filter.start == null || filter.end == null) {
    return [];
  }
  const range = priceRangeForDate(pack.prices ?? [], filter.date);
  if (!range) return [];

  let schedules = schedulesOnInterval(
    range,
    filter.date,
    filter.start,
    filter.end,
  );
  if (schedules.length === 0) return [];
  if (schedules.length > 1 && !areUninterrupted(schedules)) return [];

  schedules = [...schedules].sort((a, b) => a.start - b.start);
  const start = schedules[0].start;
  const end = schedules[schedules.length - 1].end;
  if (filter.start < start || filter.end > end) return [];

  return schedules;
}

type CalculatedSchedule = {
  duration: string;
  pax: number | null;
  ratioPax: number | null;
  value: number;
  minValue: number | null;
  valueHour: number | null;
  valuePax: number | null;
};

function durationToGoString(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h${m}m${s}s`;
}

function calculateSchedule(
  s: NormalizedSchedule,
  filter: PriceFilter,
  numSchedules: number,
): CalculatedSchedule {
  const start = filter.start != null ? Math.max(s.start, filter.start) : s.start;
  const end = filter.end != null ? Math.min(s.end, filter.end) : s.end;
  const duration = end - start;

  let ratio: number | null = null;
  if (
    numSchedules > 1 &&
    s.valuePax != null &&
    filter.start != null &&
    filter.end != null &&
    filter.end - filter.start > 0
  ) {
    ratio = duration / (filter.end - filter.start);
  }

  let value = 0;
  if (filter.pax != null) {
    if (s.valuePax != null) value = s.valuePax * filter.pax;
    if (ratio != null) value *= ratio;
  }
  if (s.valueHour != null) {
    value += (s.valueHour * duration) / HOUR;
  }

  return {
    duration: durationToGoString(duration),
    pax: filter.pax,
    ratioPax: ratio,
    value,
    minValue: s.minValue,
    valueHour: s.valueHour,
    valuePax: s.valuePax,
  };
}

type CalculatedExtra = {
  id: string;
  description: string;
  value: number;
};

function normalizeExtra(raw: RawExtra): ExtraQuantityConfig {
  return {
    id: raw.id ?? "",
    mandatory: raw.mandatory,
    priceHour: raw.price_hour ?? raw.priceHour ?? null,
    pricePax: raw.price_pax ?? raw.pricePax ?? null,
    fixedPrice: raw.fixed_price ?? raw.fixedPrice ?? null,
    defaultHour: raw.default_hour ?? raw.defaultHour ?? null,
    minHour: raw.min_hour ?? raw.minHour ?? null,
    maxHour: raw.max_hour ?? raw.maxHour ?? null,
    defaultPax: raw.default_pax ?? raw.defaultPax ?? null,
    minPax: raw.min_pax ?? raw.minPax ?? null,
    maxPax: raw.max_pax ?? raw.maxPax ?? null,
  };
}

function calculateExtras(
  pack: RawPack,
  duration: number,
  pax: number | null,
  extraIDs: string[],
  extraParams: Record<string, { hours?: number; pax?: number }> = {},
): CalculatedExtra[] {
  const eventHours = eventDurationHours(0, duration);
  const eventPax = pax ?? 0;
  const res: CalculatedExtra[] = [];

  for (const raw of pack.extras ?? []) {
    const extra = normalizeExtra(raw as RawExtra);
    const id = extra.id;
    if (!extra.mandatory && !extraIDs.includes(id)) continue;

    const selection: ExtraSelection = reconcileExtraSelection(
      extra,
      extraParams[id]
        ? { id, hours: extraParams[id].hours, pax: extraParams[id].pax }
        : undefined,
      eventHours,
      eventPax,
    );

    const value = computeExtraPrice(
      extra,
      selection.hours ?? null,
      selection.pax ?? null,
    );
    res.push({
      id,
      description: (raw as { description?: string }).description ?? "",
      value,
    });
  }

  return res;
}

export type CalculatedPrice = {
  value: number;
  timeOverflow: boolean;
  schedules: CalculatedSchedule[];
  extras: CalculatedExtra[];
};

export function computePackPrice(
  pack: RawPack,
  filter: PriceFilter,
): CalculatedPrice | null {
  if (filter.date == null || filter.start == null || filter.end == null) {
    return null;
  }

  const minTime = parseGoDuration(pack.min_time ?? pack.minTime ?? "");
  const maxTime = parseGoDuration(pack.max_time ?? pack.maxTime ?? "");

  if (minTime > 0 && filter.end - filter.start < minTime) return null;
  if (filter.pax != null && packCapacity(pack) < filter.pax) return null;

  let overflow = false;
  const effectiveFilter = { ...filter };
  if (maxTime > 0 && filter.end - filter.start > maxTime) {
    overflow = true;
    effectiveFilter.end = filter.start + maxTime;
  }

  const priceSchedules = validPriceSchedules(pack, effectiveFilter);
  if (priceSchedules.length === 0) return null;

  const calculated = priceSchedules.map((s) =>
    calculateSchedule(s, effectiveFilter, priceSchedules.length),
  );

  const duration = (effectiveFilter.end ?? 0) - (effectiveFilter.start ?? 0);
  const extras = calculateExtras(
    pack,
    duration,
    effectiveFilter.pax ?? null,
    filter.extraIDs,
    filter.extraParams,
  );

  let value = 0;
  for (const cs of calculated) {
    let psValue = cs.value;
    if (cs.minValue != null) psValue = Math.max(psValue, cs.minValue);
    value += psValue;
  }
  for (const e of extras) value += e.value;

  return { value, timeOverflow: overflow, schedules: calculated, extras };
}

// Mirrors Pack.Filter(): returns the reason a pack is unavailable for the given
// filter, or "" when it is available.
export function packUnavailabilityReason(
  pack: RawPack,
  filter: PriceFilter,
): string {
  if (filter.pax != null && packCapacity(pack) < filter.pax) return "capacity";
  if (filter.date == null) return "";
  if (filter.start == null || filter.end == null) return "";

  const minTime = parseGoDuration(pack.min_time ?? pack.minTime ?? "");
  if (minTime > 0 && filter.end - filter.start < minTime) return "minTime";

  if (validPriceSchedules(pack, filter).length === 0) return "dateStartEnd";

  return "";
}
