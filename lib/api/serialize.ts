type DbRow = Record<string, unknown>;

const STATUS_BY_INT = [
  "in_progress",
  "pending_approval",
  "active",
  "paused",
  "inactive",
  "inactive_admin",
] as const;

const JOURNEY_BY_INT = ["venues", "services"] as const;
const SUBSCRIPTION_BY_INT = ["basic", "premium", "expert"] as const;
const SUBSCRIPTION_TO_INT: Record<string, number> = {
  basic: 0,
  premium: 1,
  expert: 2,
};

export function mapStatus(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") {
    return STATUS_BY_INT[value] ?? "in_progress";
  }
  return "in_progress";
}

export function mapJourney(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") {
    return JOURNEY_BY_INT[value] ?? "venues";
  }
  return "venues";
}

export function mapSubscription(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") {
    return SUBSCRIPTION_BY_INT[value] ?? "basic";
  }
  return "basic";
}

export function parseSubscriptionInt(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return SUBSCRIPTION_TO_INT[value] ?? 0;
  return 0;
}

export function mapSubscriptionRow(row: DbRow) {
  return {
    id: str(row.id),
    venueID: str(row.venue_id ?? row.venueID),
    ownerID: str(row.owner_id ?? row.ownerID),
    plan: str(row.plan),
    interval: str(row.billing_interval ?? row.interval),
    status: str(row.status),
    stripeCustomerID: str(row.stripe_customer_id),
    stripeSubscriptionID: str(row.stripe_subscription_id),
    currentPeriodEnd: row.current_period_end
      ? String(row.current_period_end)
      : null,
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    createdAt: row.created_at ? String(row.created_at) : null,
  };
}

function str(value: unknown): string {
  return value == null ? "" : String(value);
}

function num(value: unknown): number {
  return value == null ? 0 : Number(value);
}

function arr(value: unknown): string[] {
  return Array.isArray(value) ? (value as string[]) : [];
}

function ts(value: unknown): string | null {
  return value == null ? null : String(value);
}

export function mapPhoto(row: DbRow) {
  return {
    id: str(row.id),
    url: str(row.url),
    smallURL: str(row.small_url ?? row.smallURL),
    mediumURL: str(row.medium_url ?? row.mediumURL),
    largeURL: str(row.large_url ?? row.largeURL),
  };
}

export function mapAttachment(row: DbRow) {
  return {
    id: str(row.id),
    url: str(row.url),
    extension: str(row.extension),
    filename: str(row.filename),
  };
}

export function mapVenue(row: DbRow) {
  return {
    id: str(row.id),
    createdAt: ts(row.created_at),
    updatedAt: ts(row.updated_at),
    deletedAt: ts(row.deleted_at),
    ownerID: str(row.owner_id),
    reference: str(row.reference),
    status: mapStatus(row.status),
    journey: mapJourney(row.journey),
    subscription: mapSubscription(row.subscription),
    name: str(row.name),
    description: str(row.description),
    attributes: arr(row.attributes),
    primaryPhotoID: str(row.primary_photo ?? row.primaryPhotoID),
    photoIDs: arr(row.photos ?? row.photoIDs),
    country: str(row.country),
    street1: str(row.street1),
    street2: str(row.street2),
    postalCode: str(row.postal_code ?? row.postalCode),
    city: str(row.city),
    latitude: num(row.latitude),
    longitude: num(row.longitude),
    billingName: str(row.billing_name ?? row.billingName),
    billingVAT: str(row.billing_vat ?? row.billingVAT),
    billingAddress: str(row.billing_address ?? row.billingAddress),
    billingIBAN: str(row.billing_iban ?? row.billingIBAN),
    billingPostalCode: str(row.billing_postal_code ?? row.billingPostalCode),
    billingCity: str(row.billing_city ?? row.billingCity),
    billingEmail: str(row.billing_email ?? row.billingEmail),
    contactName: str(row.contact_name ?? row.contactName),
    contactPhoneExtension: num(row.contact_phone_extension ?? row.contactPhoneExtension),
    contactPhoneNumber: num(row.contact_phone_number ?? row.contactPhoneNumber),
    contactEmail: str(row.contact_email ?? row.contactEmail),
    currency: str(row.currency ?? "eur"),
    commision: row.commission ?? row.commision ?? null,
  };
}

export function mapSpace(row: DbRow) {
  return {
    id: str(row.id),
    createdAt: ts(row.created_at),
    updatedAt: ts(row.updated_at),
    deletedAt: ts(row.deleted_at),
    venueID: str(row.venue_id ?? row.venueID),
    ownerID: str(row.owner_id ?? row.ownerID),
    reference: str(row.reference),
    status: mapStatus(row.status),
    journey: mapJourney(row.journey),
    name: str(row.name),
    description: str(row.description),
    attributes: arr(row.attributes),
    primaryPhotoID: str(row.primary_photo ?? row.primaryPhotoID),
    photoIDs: arr(row.photos ?? row.photoIDs),
    area: num(row.area),
  };
}

// Go time.Weekday order: 0=Sunday .. 6=Saturday.
const WEEKDAY_BY_INT = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function mapDaysOfWeek(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((d) => {
      if (typeof d === "number") return WEEKDAY_BY_INT[d] ?? null;
      if (typeof d === "string") {
        const lower = d.toLowerCase().slice(0, 3);
        return WEEKDAY_BY_INT.includes(lower) ? lower : null;
      }
      return null;
    })
    .filter((d): d is string => !!d);
}

// Converts stored price ranges (snake_case, numeric weekdays) into the camelCase
// shape the frontend Pack model expects.
export function mapPrices(value: unknown): unknown[] {
  if (!Array.isArray(value)) return [];
  return value.map((range) => {
    const r = range as Record<string, unknown>;
    const schedules = Array.isArray(r.schedules) ? r.schedules : [];
    return {
      from: r.from ?? null,
      to: r.to ?? null,
      schedules: schedules.map((schedule) => {
        const s = schedule as Record<string, unknown>;
        return {
          start: s.start ?? null,
          end: s.end ?? null,
          minValue: s.min_value ?? s.minValue ?? null,
          valueHour: s.value_hour ?? s.valueHour ?? null,
          valuePerson: s.value_person ?? s.valuePerson ?? null,
          daysOfWeek: mapDaysOfWeek(s.days_of_week ?? s.daysOfWeek),
        };
      }),
    };
  });
}

// Converts stored extras (snake_case) into the camelCase frontend shape.
export function mapExtras(value: unknown): unknown[] {
  if (!Array.isArray(value)) return [];
  return value.map((extra) => {
    const e = extra as Record<string, unknown>;
    return {
      id: e.id ?? null,
      mandatory: e.mandatory ?? false,
      description: e.description ?? "",
      tooltip: e.tooltip ?? null,
      priceHour: e.price_hour ?? e.priceHour ?? null,
      pricePax: e.price_pax ?? e.pricePax ?? null,
      fixedPrice: e.fixed_price ?? e.fixedPrice ?? null,
      defaultHour: e.default_hour ?? e.defaultHour ?? null,
      minHour: e.min_hour ?? e.minHour ?? null,
      maxHour: e.max_hour ?? e.maxHour ?? null,
      defaultPax: e.default_pax ?? e.defaultPax ?? null,
      minPax: e.min_pax ?? e.minPax ?? null,
      maxPax: e.max_pax ?? e.maxPax ?? null,
    };
  });
}

export function mapPack(row: DbRow) {
  return {
    id: str(row.id),
    createdAt: ts(row.created_at),
    updatedAt: ts(row.updated_at),
    deletedAt: ts(row.deleted_at),
    ownerID: str(row.owner_id ?? row.ownerID),
    reference: str(row.reference),
    status: mapStatus(row.status),
    journey: mapJourney(row.journey),
    name: str(row.name),
    description: str(row.description),
    attributes: arr(row.attributes),
    primaryPhotoID: str(row.primary_photo ?? row.primaryPhotoID),
    photoIDs: arr(row.photos ?? row.photoIDs),
    attachmentIDs: arr(row.attachments ?? row.attachmentIDs),
    noticeDays: num(row.notice_days ?? row.noticeDays),
    minTime: row.min_time ?? row.minTime ?? null,
    maxTime: row.max_time ?? row.maxTime ?? null,
    cancellationPeriod: str(row.cancellation_period ?? row.cancellationPeriod),
    upfrontPercentage:
      row.upfront_percentage ?? row.upfrontPercentage ?? 20,
    prices: mapPrices(row.prices),
    capacities: row.capacities ?? [],
    extras: mapExtras(row.extras),
    travelExpenses: mapTravelExpenses(row.travel_expenses ?? row.travelExpenses),
  };
}

export function mapTravelExpenses(value: unknown): unknown | null {
  if (!value || typeof value !== "object") return null;
  const t = value as Record<string, unknown>;
  const intervals = Array.isArray(t.intervals) ? t.intervals : [];
  return {
    from_billing: Boolean(t.from_billing ?? t.fromBilling ?? false),
    country: str(t.country),
    street1: str(t.street1),
    street2: str(t.street2),
    postalCode: str(t.postal_code ?? t.postalCode),
    city: str(t.city),
    latitude: num(t.latitude),
    longitude: num(t.longitude),
    intervals: intervals.map((interval) => {
      const i = interval as Record<string, unknown>;
      return {
        from: num(i.from),
        to: num(i.to),
        price: num(i.price),
      };
    }),
  };
}

export function serializeTravelExpensesForDb(
  value: unknown,
): unknown | null | undefined {
  if (value === undefined) return undefined;
  if (!value || typeof value !== "object") return null;
  const t = value as Record<string, unknown>;
  const intervals = Array.isArray(t.intervals) ? t.intervals : [];
  return {
    from_billing: Boolean(t.from_billing ?? t.fromBilling ?? false),
    country: t.country ?? "",
    street1: t.street1 ?? "",
    street2: t.street2 ?? "",
    postal_code: t.postalCode ?? t.postal_code ?? "",
    city: t.city ?? "",
    latitude: t.latitude ?? 0,
    longitude: t.longitude ?? 0,
    intervals: intervals.map((interval) => {
      const i = interval as Record<string, unknown>;
      return {
        from: i.from,
        to: i.to,
        price: i.price,
      };
    }),
  };
}

const JOURNEY_TO_INT: Record<string, number> = { venues: 0, services: 1 };
const STATUS_TO_INT: Record<string, number> = {
  in_progress: 0,
  pending_approval: 1,
  active: 2,
  paused: 3,
  inactive: 4,
  inactive_admin: 5,
};
const WEEKDAY_TO_INT: Record<string, number> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

export function parseJourneyInt(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return JOURNEY_TO_INT[value] ?? 0;
  return 0;
}

export function parseStatusInt(value: unknown): number | undefined {
  if (typeof value === "number") return value;
  if (typeof value === "string") return STATUS_TO_INT[value];
  return undefined;
}

function daysOfWeekToInt(days: unknown): number[] {
  if (!Array.isArray(days)) return [];
  return days
    .map((d) => {
      if (typeof d === "number") return d;
      if (typeof d === "string") {
        return WEEKDAY_TO_INT[d.toLowerCase().slice(0, 3)] ?? null;
      }
      return null;
    })
    .filter((d): d is number => d != null);
}

export function serializePricesForDb(value: unknown): unknown[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return [];
  return value.map((range) => {
    const r = range as Record<string, unknown>;
    const schedules = Array.isArray(r.schedules) ? r.schedules : [];
    return {
      from: r.from ?? null,
      to: r.to ?? null,
      schedules: schedules.map((schedule) => {
        const s = schedule as Record<string, unknown>;
        return {
          start: s.start ?? null,
          end: s.end ?? null,
          min_value: s.minValue ?? s.min_value ?? null,
          value_hour: s.valueHour ?? s.value_hour ?? null,
          value_person: s.valuePerson ?? s.value_person ?? null,
          days_of_week: daysOfWeekToInt(s.daysOfWeek ?? s.days_of_week),
        };
      }),
    };
  });
}

export function serializeExtrasForDb(value: unknown): unknown[] | undefined {
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return [];
  return value.map((extra) => {
    const e = extra as Record<string, unknown>;
    return {
      id: e.id ?? null,
      mandatory: e.mandatory ?? false,
      description: e.description ?? "",
      tooltip: e.tooltip ?? null,
      price_hour: e.priceHour ?? e.price_hour ?? null,
      price_pax: e.pricePax ?? e.price_pax ?? null,
      fixed_price: e.fixedPrice ?? e.fixed_price ?? null,
      default_hour: e.defaultHour ?? e.default_hour ?? null,
      min_hour: e.minHour ?? e.min_hour ?? null,
      max_hour: e.maxHour ?? e.max_hour ?? null,
      default_pax: e.defaultPax ?? e.default_pax ?? null,
      min_pax: e.minPax ?? e.min_pax ?? null,
      max_pax: e.maxPax ?? e.max_pax ?? null,
    };
  });
}

export function venueUpdateFromBody(
  body: Record<string, unknown>,
): Record<string, unknown> {
  const u: Record<string, unknown> = {};
  if (body.name !== undefined) u.name = body.name;
  if (body.description !== undefined) u.description = body.description;
  if (body.attributes !== undefined) u.attributes = body.attributes;
  if (body.primaryPhotoID !== undefined) u.primary_photo = body.primaryPhotoID;
  if (body.photoIDs !== undefined) u.photos = body.photoIDs;
  if (body.country !== undefined) u.country = body.country;
  if (body.street1 !== undefined) u.street1 = body.street1;
  if (body.street2 !== undefined) u.street2 = body.street2;
  if (body.postalCode !== undefined) u.postal_code = body.postalCode;
  if (body.city !== undefined) u.city = body.city;
  if (body.latitude !== undefined) u.latitude = body.latitude;
  if (body.longitude !== undefined) u.longitude = body.longitude;
  if (body.billingName !== undefined) u.billing_name = body.billingName;
  if (body.billingVAT !== undefined) u.billing_vat = body.billingVAT;
  if (body.billingAddress !== undefined) u.billing_address = body.billingAddress;
  if (body.billingIBAN !== undefined) u.billing_iban = body.billingIBAN;
  if (body.billingPostalCode !== undefined)
    u.billing_postal_code = body.billingPostalCode;
  if (body.billingCity !== undefined) u.billing_city = body.billingCity;
  if (body.billingEmail !== undefined) u.billing_email = body.billingEmail;
  if (body.contactName !== undefined) u.contact_name = body.contactName;
  if (body.contactPhoneExtension !== undefined)
    u.contact_phone_extension = body.contactPhoneExtension;
  if (body.contactPhoneNumber !== undefined)
    u.contact_phone_number = body.contactPhoneNumber;
  if (body.contactEmail !== undefined) u.contact_email = body.contactEmail;
  if (body.journey !== undefined) u.journey = parseJourneyInt(body.journey);
  if (body.status !== undefined) {
    const status = parseStatusInt(body.status);
    if (status !== undefined) u.status = status;
  }
  return u;
}

export function spaceUpdateFromBody(
  body: Record<string, unknown>,
): Record<string, unknown> {
  const u: Record<string, unknown> = {};
  if (body.name !== undefined) u.name = body.name;
  if (body.description !== undefined) u.description = body.description;
  if (body.attributes !== undefined) u.attributes = body.attributes;
  if (body.primaryPhotoID !== undefined) u.primary_photo = body.primaryPhotoID;
  if (body.photoIDs !== undefined) u.photos = body.photoIDs;
  if (body.area !== undefined) u.area = body.area;
  if (body.journey !== undefined) u.journey = parseJourneyInt(body.journey);
  if (body.status !== undefined) {
    const status = parseStatusInt(body.status);
    if (status !== undefined) u.status = status;
  }
  return u;
}

export function packUpdateFromBody(
  body: Record<string, unknown>,
): Record<string, unknown> {
  const u: Record<string, unknown> = {};
  if (body.name !== undefined) u.name = body.name;
  if (body.description !== undefined) u.description = body.description;
  if (body.attributes !== undefined) u.attributes = body.attributes;
  if (body.primaryPhotoID !== undefined) u.primary_photo = body.primaryPhotoID;
  if (body.photoIDs !== undefined) u.photos = body.photoIDs;
  if (body.attachmentIDs !== undefined) u.attachments = body.attachmentIDs;
  if (body.noticeDays !== undefined) u.notice_days = body.noticeDays;
  if (body.minTime !== undefined) {
    const v = String(body.minTime ?? "").trim();
    u.min_time = v.length > 0 ? v : null;
  }
  if (body.maxTime !== undefined) {
    const v = String(body.maxTime ?? "").trim();
    u.max_time = v.length > 0 ? v : null;
  }
  if (body.cancellationPeriod !== undefined)
    u.cancellation_period = body.cancellationPeriod;
  if (body.upfrontPercentage !== undefined)
    u.upfront_percentage = body.upfrontPercentage;
  if (body.capacities !== undefined) u.capacities = body.capacities;
  if (body.travelExpenses !== undefined) {
    u.travel_expenses = serializeTravelExpensesForDb(body.travelExpenses);
  }
  if (body.journey !== undefined) u.journey = parseJourneyInt(body.journey);
  if (body.prices !== undefined) u.prices = serializePricesForDb(body.prices);
  if (body.extras !== undefined) u.extras = serializeExtrasForDb(body.extras);
  if (body.status !== undefined) {
    const status = parseStatusInt(body.status);
    if (status !== undefined) u.status = status;
  }
  return u;
}

const BOOKING_KIND_BY_INT = ["internal", "external", "block", "integration"];

export function bookingKindToString(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return BOOKING_KIND_BY_INT[value] ?? "internal";
  return "internal";
}

export function bookingKindToInt(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const idx = BOOKING_KIND_BY_INT.indexOf(value);
    return idx >= 0 ? idx : 0;
  }
  return 0;
}

// Postgres INTERVAL ("HH:MM:SS" or "N days HH:MM:SS") -> Go-style "XhYmZs".
export function intervalToGoDuration(value: unknown): string {
  if (value == null) return "0h0m0s";
  if (typeof value === "object") {
    const v = value as Record<string, number>;
    const total =
      (v.days ?? 0) * 86400 +
      (v.hours ?? 0) * 3600 +
      (v.minutes ?? 0) * 60 +
      Math.floor(v.seconds ?? 0);
    return formatGoDuration(total);
  }
  const str = String(value);
  let total = 0;
  const dayMatch = str.match(/(\d+)\s*day/);
  if (dayMatch) total += parseInt(dayMatch[1], 10) * 86400;
  const timeMatch = str.match(/(\d+):(\d+):(\d+)/);
  if (timeMatch) {
    total +=
      parseInt(timeMatch[1], 10) * 3600 +
      parseInt(timeMatch[2], 10) * 60 +
      parseInt(timeMatch[3], 10);
  }
  return formatGoDuration(total);
}

export function mapPayment(row: DbRow) {
  return {
    id: str(row.id),
    bookingID: str(row.booking_id),
    status: str(row.status),
    externalID: str(row.external_id),
    provider: str(row.provider),
  };
}

export function mapBooking(row: DbRow) {
  return {
    id: str(row.id),
    spaceID: str(row.space_id),
    packID: row.pack_id ? str(row.pack_id) : null,
    userID: str(row.user_id),
    createdAt: ts(row.created_at),
    updatedAt: ts(row.updated_at),
    status: str(row.status),
    date: row.event_date ? String(row.event_date).slice(0, 10) : null,
    start: intervalToGoDuration(row.start_at),
    end: intervalToGoDuration(row.end_at),
    kind: bookingKindToString(row.kind),
    numPeople: num(row.num_people),
    layout: str(row.layout),
    notes: str(row.notes),
    billingName: str(row.billing_name),
    billingVAT: str(row.billing_vat),
    billingAddress: str(row.billing_address),
    billingPostCode: str(row.billing_postal_code),
    billingCity: str(row.billing_city),
    billingCountry: str(row.billing_country),
    contactName: str(row.contact_name),
    contactPhoneExtension: num(row.contact_phone_extension),
    contactPhoneNumber: num(row.contact_phone_number),
    contactEmail: str(row.contact_email),
    freeCancellationUntil: ts(row.free_cancellation),
    totalAmount: num(row.total_amount),
    upfrontAmount: num(row.upfront_amount),
    upfrontPercentage: num(row.upfront_percentage),
    commission: num(row.commission),
    timezone: str(row.timezone),
    source: row.ical_import_id ? str(row.ical_import_id) : null,
    extraIDs: arr(row.extra_ids),
    extraParams: Array.isArray(row.extra_params) ? row.extra_params : [],
  };
}

export function mapHighlight(row: DbRow) {
  return {
    id: str(row.id),
    createdAt: ts(row.created_at),
    updatedAt: ts(row.updated_at),
    spaceID: str(row.space_id),
    from: row.from_date ? String(row.from_date).slice(0, 10) : null,
    to: row.to_date ? String(row.to_date).slice(0, 10) : null,
    mode: str(row.mode),
    priority: num(row.priority),
    recommended: Boolean(row.recommended),
    plan: row.plan ? str(row.plan) : null,
  };
}

export const QUOTE_STATUSES = [
  "new",
  "in_follow_up",
  "proposal_sent",
  "won",
  "lost",
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export function isQuoteStatus(value: unknown): value is QuoteStatus {
  return (
    typeof value === "string" &&
    (QUOTE_STATUSES as readonly string[]).includes(value)
  );
}

export function packVenueSpaceFromRow(pack: DbRow | undefined) {
  const links = pack?.packs_spaces as
    | { spaces?: DbRow & { venues?: DbRow } }[]
    | undefined;
  const link = links?.[0];
  const space = link?.spaces;
  const venue = space?.venues;
  return {
    packName: pack ? str(pack.name) : "",
    packReference: pack ? str(pack.reference) : "",
    spaceID: space ? str(space.id) : "",
    spaceName: space ? str(space.name) : "",
    venueID: venue ? str(venue.id) : "",
    venueName: venue ? str(venue.name) : "",
    isDeleted: pack ? !!pack.deleted_at : false,
  };
}

function mapLeadPackAssociation(
  row: DbRow,
  parentKey: "quote_id" | "contact_id",
  parentIdKey: "quoteID" | "contactID",
) {
  const pack = row.packs as DbRow | undefined;
  const venueSpace = packVenueSpaceFromRow(pack);
  const extraIDs = Array.isArray(row.extra_ids)
    ? row.extra_ids.map((id) => str(id))
    : [];
  const extraParams = Array.isArray(row.extra_params) ? row.extra_params : [];

  return {
    id: str(row.id),
    [parentIdKey]: str(row[parentKey]),
    packID: str(row.pack_id),
    createdAt: ts(row.created_at),
    createdBy: row.created_by ? str(row.created_by) : null,
    status: str(row.status),
    extraIDs,
    extraParams,
    ...venueSpace,
  };
}

export function mapQuotePack(row: DbRow) {
  return mapLeadPackAssociation(row, "quote_id", "quoteID");
}

export function mapContactPack(row: DbRow) {
  return mapLeadPackAssociation(row, "contact_id", "contactID");
}

export function parseQualityScore(value: unknown): number | null | undefined {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 5) return undefined;
  return n;
}

export function mapPackLookup(pack: DbRow) {
  const venueSpace = packVenueSpaceFromRow(pack);
  return {
    packID: str(pack.id),
    ...venueSpace,
  };
}

export function maskName(value: unknown): string {
  const s = str(value).trim();
  if (!s) return "";
  return `${s[0]}*****`;
}

export function maskEmail(value: unknown): string {
  const s = str(value).trim();
  if (!s) return "";
  const at = s.indexOf("@");
  if (at <= 0) return `${s[0]}*****`;
  return `${s[0]}*****${s.slice(at)}`;
}

export function maskPhone(value: unknown): string {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (!digits) return "";
  const visible = digits.slice(0, 2);
  return `+${visible}*****`;
}

type EventHubPackInput = {
  packID: string;
  packName: string;
  packReference: string;
  spaceID: string;
  spaceName: string;
  venueID: string;
  venueName: string;
  status?: string;
};

export function mapLeadOutcome(ownerWon: boolean, decided: boolean) {
  if (ownerWon) {
    return { outcome: "won" as const, outcomeLabel: "Ganhou esta lead" };
  }
  if (decided) {
    return {
      outcome: "lost" as const,
      outcomeLabel: "Atribuída a outro fornecedor",
    };
  }
  return { outcome: "pending" as const, outcomeLabel: "Em aberto" };
}

export function countDistinctSpacesFromQuotePackRows(
  rows: { packs?: DbRow }[],
): number {
  const spaceIds = new Set<string>();
  for (const row of rows) {
    const pack = row.packs;
    const links = pack?.packs_spaces as
      | { spaces?: DbRow }[]
      | undefined;
    for (const link of links ?? []) {
      const spaceId = link.spaces?.id;
      if (spaceId) spaceIds.add(str(spaceId));
    }
  }
  return spaceIds.size;
}

export function mapLeadScope(associatedSpaceCount: number) {
  if (associatedSpaceCount <= 1) {
    return {
      leadScope: "exclusive" as const,
      associatedSpaceCount,
      leadScopeLabel: "Lead exclusiva",
    };
  }
  return {
    leadScope: "shared" as const,
    associatedSpaceCount,
    leadScopeLabel: `Lead partilhada com mais ${associatedSpaceCount} espaços`,
  };
}

function mapEventHubLeadBase(
  row: DbRow,
  leadType: "quote" | "contact",
  matchedPacks: EventHubPackInput[],
  associatedSpaceCount: number,
  decided: boolean,
) {
  const qualityScore =
    row.quality_score != null ? num(row.quality_score) : null;
  const ownerWon = matchedPacks.some((p) => p.status === "won");

  return {
    id: str(row.id),
    leadType,
    leadTypeLabel:
      leadType === "quote" ? "Pedido de orçamento" : "Pedido de contacto",
    qualityScore,
    ...mapLeadScope(associatedSpaceCount),
    ...mapLeadOutcome(ownerWon, decided),
    status: str(row.status ?? "new"),
    createdAt: ts(row.created_at),
    contact: {
      name: maskName(row.name),
      email: maskEmail(row.email),
      phoneExtension:
        row.phone_extension != null ? num(row.phone_extension) : null,
      phoneNumber:
        row.phone_number != null ? maskPhone(row.phone_number) : "",
    },
    suggestedPacks: matchedPacks,
  };
}

export function mapEventHubQuoteLead(
  quote: DbRow,
  matchedPacks: EventHubPackInput[],
  associatedSpaceCount: number,
  decided = false,
) {
  const eventDate = quote.event_date
    ? String(quote.event_date).slice(0, 10)
    : null;

  return {
    ...mapEventHubLeadBase(
      quote,
      "quote",
      matchedPacks,
      associatedSpaceCount,
      decided,
    ),
    eventKind: str(quote.event_kind),
    eventDate,
    startAt: quote.start_at ? intervalToGoDuration(quote.start_at) : null,
    endAt: quote.end_at ? intervalToGoDuration(quote.end_at) : null,
    timezone: str(quote.timezone),
    numPeople: num(quote.num_people),
    budget: quote.budget != null ? num(quote.budget) : null,
    currency: str(quote.currency),
    notes: str(quote.notes),
    area: str(quote.area),
    country: str(quote.country),
    attributes: arr(quote.attributes),
    companyEvent: Boolean(quote.company_event),
    companyName: str(quote.company_name),
    contactMethod: null,
    message: null,
  };
}

export function mapEventHubContactLead(
  contact: DbRow,
  matchedPacks: EventHubPackInput[],
  associatedSpaceCount: number,
  decided = false,
) {
  return {
    ...mapEventHubLeadBase(
      contact,
      "contact",
      matchedPacks,
      associatedSpaceCount,
      decided,
    ),
    eventKind: null,
    eventDate: null,
    startAt: null,
    endAt: null,
    timezone: null,
    numPeople: null,
    budget: null,
    currency: null,
    notes: null,
    area: null,
    country: null,
    attributes: [],
    companyEvent: false,
    companyName: null,
    contactMethod: str(contact.kind),
    message: str(contact.message),
  };
}

/** @deprecated Use mapEventHubQuoteLead */
export function mapEventHubLead(
  quote: DbRow,
  matchedPacks: EventHubPackInput[],
  associatedSpaceCount: number,
) {
  return mapEventHubQuoteLead(quote, matchedPacks, associatedSpaceCount);
}

export function collectPhotoIds(
  space: { primary_photo?: string | null; photos?: string[] | null },
  venue?: { primary_photo?: string | null; photos?: string[] | null },
): string[] {
  const ids: string[] = [];
  const add = (id?: string | null) => {
    if (id && !ids.includes(id)) ids.push(id);
  };
  add(space.primary_photo);
  for (const id of space.photos ?? []) add(id);
  if (venue) {
    add(venue.primary_photo);
    for (const id of venue.photos ?? []) add(id);
  }
  return ids;
}

export function parseGoDuration(value: string): number {
  if (!value) return 0;
  let seconds = 0;
  const h = value.match(/(\d+)h/);
  const m = value.match(/(\d+)m/);
  const s = value.match(/(\d+)s/);
  if (h) seconds += parseInt(h[1], 10) * 3600;
  if (m) seconds += parseInt(m[1], 10) * 60;
  if (s) seconds += parseInt(s[1], 10);
  return seconds;
}

export function formatGoDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}h${m}m${s}s`;
}

type PriceSchedule = {
  start?: string;
  end?: string;
  days_of_week?: number[];
  daysOfWeek?: number[];
};

type PriceRange = {
  from?: string;
  to?: string;
  schedules?: PriceSchedule[];
};

export function packHasFuturePrices(
  prices: PriceRange[] | null | undefined,
  now = Date.now(),
): boolean {
  if (!Array.isArray(prices) || prices.length === 0) return false;
  return prices.some((range) => {
    const to = range.to ? new Date(range.to).getTime() : Infinity;
    return to >= now;
  });
}

type HourInterval = { from: number; to: number };

// Replicates be-main Prices.Intervals(date): pulls the schedules whose price
// range covers the given date and whose days_of_week include the weekday.
export function packIntervalsForDate(
  prices: PriceRange[] | null | undefined,
  date: Date,
): HourInterval[] {
  if (!Array.isArray(prices)) return [];
  const time = date.getTime();
  let schedules: PriceSchedule[] | null = null;
  for (const range of prices) {
    const from = range.from ? new Date(range.from).getTime() : -Infinity;
    const to = range.to ? new Date(range.to).getTime() : Infinity;
    if (time >= from && time <= to) {
      schedules = range.schedules ?? [];
    }
  }
  if (!schedules) return [];

  const weekday = date.getUTCDay();
  const intervals: HourInterval[] = [];
  for (const s of schedules) {
    const days = s.days_of_week ?? s.daysOfWeek ?? [];
    if (!days.includes(weekday)) continue;
    intervals.push({
      from: parseGoDuration(s.start ?? ""),
      to: parseGoDuration(s.end ?? ""),
    });
  }
  intervals.sort((a, b) => a.from - b.from);
  return intervals;
}

// Merges overlapping hour intervals into a single set per day.
export function mergeIntervals(intervals: HourInterval[]): HourInterval[] {
  if (intervals.length === 0) return [];
  const sorted = [...intervals].sort((a, b) => a.from - b.from);
  const merged: HourInterval[] = [];
  let current = { ...sorted[0] };
  for (const next of sorted.slice(1)) {
    if (next.from > current.to) {
      merged.push(current);
      current = { ...next };
    } else if (next.to > current.to) {
      current.to = next.to;
    }
  }
  merged.push(current);
  return merged;
}

type Capacity = { capacity?: number; layout?: string };

// Mirrors be-main Capacities.Capacity(): max layout capacity, or "unlimited"
// (999999) when a pack has no capacity layouts defined.
function packCapacity(capacities: Capacity[] | null | undefined): number {
  if (!Array.isArray(capacities) || capacities.length === 0) return 999999;
  let res = 0;
  for (const c of capacities) {
    const value = Number(c?.capacity ?? 0);
    if (value > res) res = value;
  }
  return res === 0 ? 999999 : res;
}

type PackPricing = {
  prices?: PriceRange[] | null;
  capacities?: Capacity[] | null;
};

// Computes capacity + min price/pax/hour for a space from its packs, mirroring
// the be-main search domain Object aggregation.
export function aggregatePackMetrics(packs: PackPricing[]): {
  capacity: number;
  price: { min: number | null; pax: number | null; hour: number | null };
} {
  const now = Date.now();

  let capacity = 0;
  for (const pack of packs) {
    capacity = Math.max(capacity, packCapacity(pack.capacities));
  }
  if (capacity === 999999) capacity = 0; // treat "unlimited" as unspecified

  let min: number | null = null;
  let pax: number | null = null;
  let hour: number | null = null;

  const consider = (current: number | null, value: unknown): number | null => {
    if (value == null) return current;
    const n = Number(value);
    if (Number.isNaN(n)) return current;
    return current == null ? n : Math.min(current, n);
  };

  for (const pack of packs) {
    for (const range of pack.prices ?? []) {
      const to = range.to ? new Date(range.to).getTime() : Infinity;
      if (to < now) continue;
      for (const s of range.schedules ?? []) {
        const sch = s as PriceSchedule & {
          min_value?: number;
          minValue?: number;
          value_person?: number;
          valuePax?: number;
          value_hour?: number;
          valueHour?: number;
        };
        min = consider(min, sch.min_value ?? sch.minValue);
        pax = consider(pax, sch.value_person ?? sch.valuePax);
        hour = consider(hour, sch.value_hour ?? sch.valueHour);
      }
    }
  }

  return { capacity, price: { min, pax, hour } };
}

export async function resolvePhotoUrlMap(
  admin: ReturnType<typeof import("@lib/db").createAdminClient>,
  photoIds: string[],
): Promise<Map<string, string>> {
  const byId = new Map<string, string>();
  if (photoIds.length === 0) return byId;

  const chunkSize = 100;
  for (let i = 0; i < photoIds.length; i += chunkSize) {
    const chunk = photoIds.slice(i, i + chunkSize);
    const { data, error } = await admin
      .from("photos")
      .select("id, medium_url, url")
      .in("id", chunk);
    if (error || !data) continue;
    for (const p of data) {
      byId.set(
        p.id as string,
        ((p.medium_url as string) || (p.url as string)) ?? "",
      );
    }
  }
  return byId;
}

export async function resolvePhotoUrls(
  admin: ReturnType<typeof import("@lib/db").createAdminClient>,
  photoIds: string[],
): Promise<string[]> {
  if (photoIds.length === 0) return [];
  const byId = await resolvePhotoUrlMap(admin, photoIds);
  return photoIds.map((id) => byId.get(id)).filter((url): url is string => !!url);
}
