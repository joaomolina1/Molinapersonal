export type ExtraQuantityConfig = {
  id: string;
  mandatory?: boolean;
  priceHour?: number | null;
  pricePax?: number | null;
  fixedPrice?: number | null;
  defaultHour?: number | null;
  minHour?: number | null;
  maxHour?: number | null;
  defaultPax?: number | null;
  minPax?: number | null;
  maxPax?: number | null;
};

export type ExtraSelection = {
  id: string;
  hours?: number | null;
  pax?: number | null;
};

export function eventDurationHours(
  startSeconds: number,
  endSeconds: number,
): number {
  return (endSeconds - startSeconds) / 3600;
}

function clampValue(
  value: number,
  min?: number | null,
  max?: number | null,
): number {
  let v = value;
  if (min != null && min > 0) v = Math.max(v, min);
  if (max != null && max > 0) v = Math.min(v, max);
  return v;
}

export function usesExtraHours(extra: ExtraQuantityConfig): boolean {
  return (extra.priceHour ?? 0) > 0;
}

export function usesExtraPax(extra: ExtraQuantityConfig): boolean {
  return (extra.pricePax ?? 0) > 0;
}

export function resolveExtraHours(
  extra: ExtraQuantityConfig,
  eventHours: number,
  selectedHours?: number | null,
): number | null {
  if (!usesExtraHours(extra)) return null;

  const base =
    selectedHours ??
    (extra.defaultHour != null && extra.defaultHour > 0
      ? extra.defaultHour
      : eventHours);

  const capped = Math.min(base, eventHours);
  const max =
    extra.maxHour != null && extra.maxHour > 0 ? extra.maxHour : eventHours;

  return clampValue(capped, extra.minHour, max);
}

export function resolveExtraPax(
  extra: ExtraQuantityConfig,
  eventPax: number,
  selectedPax?: number | null,
): number | null {
  if (!usesExtraPax(extra)) return null;

  const base =
    selectedPax ??
    (extra.defaultPax != null && extra.defaultPax > 0
      ? extra.defaultPax
      : eventPax);

  const capped = Math.min(base, eventPax);
  const max = extra.maxPax != null && extra.maxPax > 0 ? extra.maxPax : eventPax;

  return clampValue(capped, extra.minPax, max);
}

export function initialExtraSelection(
  extra: ExtraQuantityConfig,
  eventHours: number,
  eventPax: number,
): ExtraSelection {
  return {
    id: extra.id,
    hours: resolveExtraHours(extra, eventHours, extra.defaultHour),
    pax: resolveExtraPax(extra, eventPax, extra.defaultPax),
  };
}

export function reconcileExtraSelection(
  extra: ExtraQuantityConfig,
  current: ExtraSelection | undefined,
  eventHours: number,
  eventPax: number,
): ExtraSelection {
  return {
    id: extra.id,
    hours: resolveExtraHours(extra, eventHours, current?.hours),
    pax: resolveExtraPax(extra, eventPax, current?.pax),
  };
}

// Manual resolution for admin tooling: respects the extra's own min/max but is
// NOT capped to the event duration/headcount, so an admin can set any value
// even when the lead has no date/time/people.
export function manualExtraHours(
  extra: ExtraQuantityConfig,
  selectedHours?: number | null,
): number | null {
  if (!usesExtraHours(extra)) return null;
  if (selectedHours == null) return null;
  return clampValue(selectedHours, extra.minHour, extra.maxHour);
}

export function manualExtraPax(
  extra: ExtraQuantityConfig,
  selectedPax?: number | null,
): number | null {
  if (!usesExtraPax(extra)) return null;
  if (selectedPax == null) return null;
  return clampValue(selectedPax, extra.minPax, extra.maxPax);
}

export function manualInitialExtraSelection(
  extra: ExtraQuantityConfig,
  eventHours: number,
  eventPax: number,
): ExtraSelection {
  const defaultHours =
    extra.defaultHour != null && extra.defaultHour > 0
      ? extra.defaultHour
      : eventHours > 0
        ? eventHours
        : null;
  const defaultPax =
    extra.defaultPax != null && extra.defaultPax > 0
      ? extra.defaultPax
      : eventPax > 0
        ? eventPax
        : null;
  return {
    id: extra.id,
    hours: manualExtraHours(extra, defaultHours),
    pax: manualExtraPax(extra, defaultPax),
  };
}

export function reconcileManualExtraSelection(
  extra: ExtraQuantityConfig,
  current: ExtraSelection | undefined,
): ExtraSelection {
  return {
    id: extra.id,
    hours: manualExtraHours(extra, current?.hours),
    pax: manualExtraPax(extra, current?.pax),
  };
}

export function computeExtraPrice(
  extra: ExtraQuantityConfig,
  hours: number | null,
  pax: number | null,
): number {
  let value = 0;
  if (extra.fixedPrice != null) value += extra.fixedPrice;
  if (extra.priceHour != null && hours != null) value += extra.priceHour * hours;
  if (extra.pricePax != null && pax != null) value += extra.pricePax * pax;
  return value;
}

export function parseExtraParamsQuery(
  value: string | null | undefined,
): ExtraSelection[] {
  if (!value?.trim()) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    const result: ExtraSelection[] = [];
    for (const item of parsed) {
      const row = item as Record<string, unknown>;
      const id = row.id != null ? String(row.id) : "";
      if (!id) continue;
      result.push({
        id,
        hours: row.hours != null ? Number(row.hours) : null,
        pax: row.pax != null ? Number(row.pax) : null,
      });
    }
    return result;
  } catch {
    return [];
  }
}

export function extraParamsMap(
  selections: ExtraSelection[],
): Record<string, { hours?: number; pax?: number }> {
  const map: Record<string, { hours?: number; pax?: number }> = {};
  for (const selection of selections) {
    map[selection.id] = {
      ...(selection.hours != null ? { hours: selection.hours } : {}),
      ...(selection.pax != null ? { pax: selection.pax } : {}),
    };
  }
  return map;
}

export function serializeExtraParamsQuery(
  selections: ExtraSelection[],
): string {
  return JSON.stringify(
    selections.map(({ id, hours, pax }) => ({
      id,
      ...(hours != null ? { hours } : {}),
      ...(pax != null ? { pax } : {}),
    })),
  );
}

export function extraParamsFromRecord(
  record: Record<string, { hours?: number; pax?: number }>,
): ExtraSelection[] {
  return Object.entries(record).map(([id, params]) => ({
    id,
    hours: params.hours ?? null,
    pax: params.pax ?? null,
  }));
}
