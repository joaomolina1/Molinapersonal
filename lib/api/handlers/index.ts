import type { ApiContext } from "@lib/api/context";
import {
  emptyResponse,
  jsonResponse,
  requireSession,
  unauthorized,
} from "@lib/api/context";
import { createAdminClient } from "@lib/db";
import {
  aggregatePackMetrics,
  bookingKindToInt,
  collectPhotoIds,
  formatGoDuration,
  intervalToGoDuration,
  mapBooking,
  mapHighlight,
  mapJourney,
  mapPack,
  mapPayment,
  mapPhoto,
  mapSpace,
  mapStatus,
  mapVenue,
  mergeIntervals,
  packHasFuturePrices,
  packIntervalsForDate,
  packUpdateFromBody,
  parseGoDuration,
  parseJourneyInt,
  parseStatusInt,
  resolvePhotoUrlMap,
  spaceUpdateFromBody,
  venueUpdateFromBody,
} from "@lib/api/serialize";
import {
  alreadyBookedResponse,
  bookingPaymentAmount,
  bookingUpdateFromBody,
  ensureProfile,
  hasBookingOverlap,
  parseExtraIDs,
  parseExtraParams,
} from "@lib/api/bookings";
import {
  computePackPrice,
  packUnavailabilityReason,
  type PriceFilter,
} from "@lib/api/pricing";
import {
  createBookingCheckoutSession,
} from "@lib/stripe/checkout";
import { computePackPaymentBreakdown } from "@lib/payment/upfront";
import {
  extraParamsMap,
  parseExtraParamsQuery,
} from "@lib/extras/quantities";

const PUBLISHED_STATUS = 2;

function mapSearchRow(
  row: Record<string, unknown>,
  photoURLs: string[],
  metrics: {
    capacity: number;
    price: { min: number | null; pax: number | null; hour: number | null };
  },
  highlight?: { recommended?: boolean; priority?: number; from_date?: string | null },
) {
  return {
    id: row.space_id,
    status: "active",
    venueID: row.venue_id,
    subscription: "basic",
    spaceName: row.space_name,
    venueName: row.venue_name,
    createdAt: row.created_at,
    address: {
      country: row.country,
      street1: row.street1,
      street2: row.street2,
      postalCode: row.postal_code,
      city: row.city,
      latitude: Number(row.latitude ?? 0),
      longitude: Number(row.longitude ?? 0),
    },
    price: metrics.price,
    capacity: metrics.capacity,
    recommended: highlight?.recommended ?? false,
    priority: highlight?.priority ?? 0,
    highlightFrom: highlight?.from_date ?? null,
    photos: photoURLs,
    photoURLs,
  };
}

const QUALIFYING_IDS_TTL_MS = 5 * 60 * 1000;
let qualifyingIdsCache: { ids: Set<string>; expiresAt: number } | null = null;

async function fetchQualifyingSpaceIds(
  admin: ReturnType<typeof createAdminClient>,
): Promise<Set<string>> {
  if (qualifyingIdsCache && Date.now() < qualifyingIdsCache.expiresAt) {
    return qualifyingIdsCache.ids;
  }

  const ids = new Set<string>();
  const pageSize = 1000;
  let offset = 0;

  while (true) {
    const { data: packLinks, error } = await admin
      .from("packs_spaces")
      .select("space_id, packs(prices, status, deleted_at)")
      .range(offset, offset + pageSize - 1);
    if (error) {
      console.error("fetchQualifyingSpaceIds error", error);
      break;
    }
    if (!packLinks?.length) break;

    for (const link of packLinks) {
      const pack = link.packs as unknown as {
        prices?: unknown;
        status: number | null;
        deleted_at: string | null;
      };
      if (!pack || pack.deleted_at || pack.status !== PUBLISHED_STATUS) continue;
      if (!packHasFuturePrices(pack.prices as never)) continue;
      ids.add(link.space_id as string);
    }

    if (packLinks.length < pageSize) break;
    offset += pageSize;
  }

  qualifyingIdsCache = { ids, expiresAt: Date.now() + QUALIFYING_IDS_TTL_MS };
  return ids;
}

async function loadPackMetricsForSpaceIds(
  admin: ReturnType<typeof createAdminClient>,
  spaceIds: string[],
): Promise<Map<string, ReturnType<typeof aggregatePackMetrics>>> {
  const metricsBySpace = new Map<
    string,
    ReturnType<typeof aggregatePackMetrics>
  >();
  if (spaceIds.length === 0) return metricsBySpace;

  const packChunkSize = 100;
  const chunks: string[][] = [];
  for (let i = 0; i < spaceIds.length; i += packChunkSize) {
    chunks.push(spaceIds.slice(i, i + packChunkSize));
  }

  const chunkResults = await Promise.all(
    chunks.map((chunk) =>
      admin
        .from("packs_spaces")
        .select("space_id, packs(prices, capacities, status, deleted_at)")
        .in("space_id", chunk),
    ),
  );

  const packsBySpace = new Map<string, unknown[]>();
  for (const { data: packLinks, error } of chunkResults) {
    if (error) {
      console.error("pack links error", error);
      continue;
    }
    for (const link of packLinks ?? []) {
      const pack = link.packs as unknown as {
        prices?: unknown;
        status: number | null;
        deleted_at: string | null;
      };
      if (!pack || pack.deleted_at || pack.status !== PUBLISHED_STATUS) {
        continue;
      }
      if (!packHasFuturePrices(pack.prices as never)) continue;
      const arr = packsBySpace.get(link.space_id as string) ?? [];
      arr.push(pack);
      packsBySpace.set(link.space_id as string, arr);
    }
  }

  for (const id of spaceIds) {
    const packs = packsBySpace.get(id);
    if (!packs?.length) continue;
    metricsBySpace.set(id, aggregatePackMetrics(packs as never));
  }

  return metricsBySpace;
}

async function packSpaceIds(
  admin: ReturnType<typeof createAdminClient>,
  packId: string,
): Promise<string[]> {
  const { data } = await admin
    .from("packs_spaces")
    .select("space_id")
    .eq("pack_id", packId);
  return (data ?? []).map((row) => row.space_id as string);
}

function mapPackResponse(
  row: Record<string, unknown>,
  spaceIDs: string[],
) {
  return { ...mapPack(row), spaceIDs };
}

async function loadOwnedRow(
  admin: ReturnType<typeof createAdminClient>,
  table: "venues" | "spaces" | "packs",
  id: string,
) {
  const { data, error } = await admin
    .from(table)
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !data) return null;
  return data as Record<string, unknown>;
}

function canManageRow(
  ctx: ApiContext,
  row: Record<string, unknown>,
): boolean {
  if (!ctx.session) return false;
  if (ctx.session.roles.includes("admin")) return true;
  return row.owner_id === ctx.session.user_id;
}

const SPACE_SEARCH_SELECT = `
  id,
  name,
  photos,
  primary_photo,
  created_at,
  venue_id,
  venues!inner (
    id,
    name,
    photos,
    primary_photo,
    country,
    street1,
    street2,
    postal_code,
    city,
    latitude,
    longitude,
    status,
    subscription
  )
`;

async function fetchPublishedSpacesForIds(
  admin: ReturnType<typeof createAdminClient>,
  spaceIds: string[],
  q?: string | null,
): Promise<Record<string, unknown>[]> {
  if (spaceIds.length === 0) return [];

  const chunkSize = 100;
  const chunks: string[][] = [];
  for (let i = 0; i < spaceIds.length; i += chunkSize) {
    chunks.push(spaceIds.slice(i, i + chunkSize));
  }

  const chunkResults = await Promise.all(
    chunks.map((chunk) => {
      let query = admin
        .from("spaces")
        .select(SPACE_SEARCH_SELECT)
        .eq("status", PUBLISHED_STATUS)
        .is("deleted_at", null)
        .eq("venues.status", PUBLISHED_STATUS)
        .is("venues.deleted_at", null)
        .in("id", chunk);

      if (q) {
        query = query.textSearch("search_vector", q, {
          type: "websearch",
          config: "portuguese",
        });
      }

      return query;
    }),
  );

  const rows: Record<string, unknown>[] = [];
  for (const { data, error } of chunkResults) {
    if (error) {
      console.error("fetchPublishedSpacesForIds error", error);
      continue;
    }
    rows.push(...((data ?? []) as Record<string, unknown>[]));
  }

  return rows;
}

export async function handleSearchRoute(
  ctx: ApiContext,
  action: string,
): Promise<Response> {
  const admin = createAdminClient();

  switch (action) {
    case "cities":
    case "places": {
      const { data, error } = await admin.from("places").select("*");
      if (error) return emptyResponse(500);
      const cities = (data ?? []).map((p) => ({
        Name: p.name,
        Top: Number(p.top_coord),
        Left: Number(p.left_coord),
        Bottom: Number(p.bottom_coord),
        Right: Number(p.right_coord),
      }));
      return jsonResponse(cities);
    }

    case "attributes": {
      const { data: spaces } = await admin
        .from("spaces")
        .select("attributes")
        .eq("status", PUBLISHED_STATUS)
        .is("deleted_at", null);
      const attrs = new Set<string>();
      (spaces ?? []).forEach((s) => {
        (s.attributes as string[] | null)?.forEach((a) => attrs.add(a));
      });
      return jsonResponse([...attrs].sort());
    }

    case "v2":
    case "": {
      const page = parseInt(ctx.query.get("page") ?? "1", 10);
      const pageSize = Math.min(
        parseInt(ctx.query.get("pageSize") ?? "20", 10),
        100,
      );
      const from = (page - 1) * pageSize;
      const searchMode = ctx.query.get("mode");
      const today = new Date().toISOString().slice(0, 10);

      const qualifyingSpaceIds = await fetchQualifyingSpaceIds(admin);
      if (qualifyingSpaceIds.size === 0) {
        return jsonResponse({
          data: [],
          pagination: { page, pageSize },
          totalResults: 0,
        });
      }

      const q = ctx.query.get("q");
      const rows = await fetchPublishedSpacesForIds(
        admin,
        [...qualifyingSpaceIds],
        q,
      );

      const highlightsBySpace = new Map<
        string,
        { recommended: boolean; priority: number; from_date: string | null }
      >();
      if (searchMode) {
        const { data: highlights } = await admin
          .from("highlights")
          .select("space_id, recommended, priority, from_date")
          .is("deleted_at", null)
          .eq("mode", searchMode)
          .lte("from_date", today)
          .gte("to_date", today);
        for (const h of highlights ?? []) {
          highlightsBySpace.set(h.space_id as string, {
            recommended: Boolean(h.recommended),
            priority: Number(h.priority ?? 0),
            from_date: h.from_date ? String(h.from_date).slice(0, 10) : null,
          });
        }
      }

      const spaceIds = rows.map((row) => row.id as string);
      let qualifyingRows = rows;

      if (searchMode) {
        qualifyingRows.sort((a, b) => {
          const ha = highlightsBySpace.get(a.id as string);
          const hb = highlightsBySpace.get(b.id as string);
          const priorityDiff = (hb?.priority ?? 0) - (ha?.priority ?? 0);
          if (priorityDiff !== 0) return priorityDiff;
          const fromDiff = String(hb?.from_date ?? "").localeCompare(
            String(ha?.from_date ?? ""),
          );
          if (fromDiff !== 0) return fromDiff;
          return String(b.created_at ?? "").localeCompare(
            String(a.created_at ?? ""),
          );
        });
      }

      const totalResults = qualifyingRows.length;
      const pagedRows = qualifyingRows.slice(from, from + pageSize);

      const metricsBySpace = await loadPackMetricsForSpaceIds(
        admin,
        pagedRows.map((row) => row.id as string),
      );

      const pagePhotoIds = new Set<string>();
      for (const row of pagedRows) {
        const venue = row.venues as unknown as {
          primary_photo?: string | null;
          photos?: string[] | null;
        };
        collectPhotoIds(
          {
            primary_photo: row.primary_photo as string | null | undefined,
            photos: row.photos as string[] | null | undefined,
          },
          venue,
        ).forEach((id) => pagePhotoIds.add(id));
      }
      const photoUrlById = await resolvePhotoUrlMap(admin, [...pagePhotoIds]);

      const items = pagedRows.map((row) => {
        const venue = row.venues as unknown as Record<string, unknown> & {
          primary_photo?: string | null;
          photos?: string[] | null;
        };
        const photoIds = collectPhotoIds(
          {
            primary_photo: row.primary_photo as string | null | undefined,
            photos: row.photos as string[] | null | undefined,
          },
          venue,
        );
        const photoURLs = photoIds
          .map((id) => photoUrlById.get(id))
          .filter((url): url is string => !!url);

        const metrics = metricsBySpace.get(row.id as string) ?? {
          capacity: 0,
          price: { min: null, pax: null, hour: null },
        };

        const highlight = highlightsBySpace.get(row.id as string);

        return mapSearchRow(
          {
            space_id: row.id,
            space_name: row.name,
            venue_id: venue.id,
            venue_name: venue.name,
            country: venue.country,
            street1: venue.street1,
            street2: venue.street2,
            postal_code: venue.postal_code,
            city: venue.city,
            latitude: venue.latitude,
            longitude: venue.longitude,
            created_at: row.created_at,
          },
          photoURLs,
          metrics,
          highlight,
        );
      });

      if (action === "" || action === "v2") {
        return jsonResponse({
          data: items,
          pagination: { page, pageSize },
          totalResults,
        });
      }

      return jsonResponse(items);
    }

    default:
      return emptyResponse(404);
  }
}

export async function handleVenuesRoute(
  ctx: ApiContext,
  action: string,
  isPublic: boolean,
): Promise<Response> {
  const admin = createAdminClient();

  if (ctx.request.method === "GET" && !action) {
    let query = admin.from("venues").select("*").is("deleted_at", null);
    if (isPublic) {
      query = query.eq("status", PUBLISHED_STATUS);
    } else if (ctx.session) {
      query = query.eq("owner_id", ctx.session.user_id);
    } else {
      return unauthorized();
    }
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) return emptyResponse(500);
    return jsonResponse((data ?? []).map(mapVenue));
  }

  if (ctx.request.method === "GET" && action) {
    let query = admin.from("venues").select("*").eq("id", action).is("deleted_at", null);
    if (isPublic) query = query.eq("status", PUBLISHED_STATUS);
    const { data, error } = await query.maybeSingle();
    if (error || !data) return emptyResponse(404);
    if (!isPublic && ctx.session?.user_id !== data.owner_id && !ctx.session) {
      return unauthorized();
    }
    return jsonResponse(mapVenue(data));
  }

  if (ctx.request.method === "POST" && !action) {
    const session = requireSession(ctx);
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const { data, error } = await admin
      .from("venues")
      .insert({
        owner_id: session.user_id,
        created_at: new Date().toISOString(),
        journey: parseJourneyInt(body.journey),
        status: 0,
      })
      .select()
      .single();
    if (error) {
      console.error("venue insert error", error);
      return emptyResponse(500);
    }
    return jsonResponse(mapVenue(data), 201);
  }

  if (ctx.request.method === "PATCH" && action && !action.includes("/")) {
    const session = requireSession(ctx);
    const row = await loadOwnedRow(admin, "venues", action);
    if (!row || !canManageRow(ctx, row)) return emptyResponse(404);
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const update = venueUpdateFromBody(body);
    if (Object.keys(update).length === 0) return jsonResponse(mapVenue(row));
    update.updated_at = new Date().toISOString();
    const { data, error } = await admin
      .from("venues")
      .update(update)
      .eq("id", action)
      .select()
      .single();
    if (error) {
      console.error("venue update error", error);
      return emptyResponse(500);
    }
    return jsonResponse(mapVenue(data));
  }

  if (action.endsWith("/status") && ctx.request.method === "PUT") {
    if (!ctx.session?.roles.includes("admin")) return emptyResponse(403);
    const venueId = action.slice(0, -"/status".length);
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const status = parseStatusInt(body.status);
    if (status === undefined) return emptyResponse(400);
    const { data, error } = await admin
      .from("venues")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", venueId)
      .is("deleted_at", null)
      .select()
      .single();
    if (error || !data) return emptyResponse(404);
    return jsonResponse(mapVenue(data));
  }

  if (ctx.request.method === "DELETE" && action && !action.includes("/")) {
    const session = requireSession(ctx);
    const row = await loadOwnedRow(admin, "venues", action);
    if (!row || !canManageRow(ctx, row)) return emptyResponse(404);
    const { error } = await admin
      .from("venues")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", action);
    if (error) return emptyResponse(500);
    return emptyResponse(200);
  }

  return emptyResponse(501);
}

export async function handleSpacesRoute(
  ctx: ApiContext,
  action: string,
  isPublic: boolean,
): Promise<Response> {
  const admin = createAdminClient();

  if (ctx.request.method === "GET" && action.endsWith("/availability")) {
    const spaceId = action.replace(/\/availability$/, "");
    return handleSpaceAvailability(admin, spaceId, ctx);
  }

  if (ctx.request.method === "GET" && !action) {
    let query = admin.from("spaces").select("*").is("deleted_at", null);
    const venueID = ctx.query.get("venueID");
    if (venueID) query = query.eq("venue_id", venueID);
    if (isPublic) {
      query = query.eq("status", PUBLISHED_STATUS);
    } else if (ctx.session) {
      query = query.eq("owner_id", ctx.session.user_id);
    } else {
      return unauthorized();
    }
    const { data, error } = await query.order("created_at", { ascending: false });
    if (error) return emptyResponse(500);
    return jsonResponse((data ?? []).map(mapSpace));
  }

  if (ctx.request.method === "GET" && action && action !== "availability") {
    const { data, error } = await admin
      .from("spaces")
      .select("*")
      .eq("id", action)
      .is("deleted_at", null)
      .maybeSingle();
    if (error || !data) return emptyResponse(404);
    if (isPublic && data.status !== PUBLISHED_STATUS) return emptyResponse(404);
    return jsonResponse(mapSpace(data));
  }

  if (ctx.request.method === "POST" && !action) {
    const session = requireSession(ctx);
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const venueId = body.venueID ?? body.venue_id;
    if (!venueId) return emptyResponse(400);

    const venue = await loadOwnedRow(admin, "venues", String(venueId));
    if (!venue || !canManageRow(ctx, venue)) return emptyResponse(404);

    const { data, error } = await admin
      .from("spaces")
      .insert({
        owner_id: session.user_id,
        venue_id: venueId,
        created_at: new Date().toISOString(),
        journey: parseJourneyInt(venue.journey),
        status: 0,
      })
      .select()
      .single();
    if (error) {
      console.error("space insert error", error);
      return emptyResponse(500);
    }
    return jsonResponse(mapSpace(data), 201);
  }

  if (ctx.request.method === "PATCH" && action && !action.includes("/")) {
    requireSession(ctx);
    const row = await loadOwnedRow(admin, "spaces", action);
    if (!row || !canManageRow(ctx, row)) return emptyResponse(404);
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const update = spaceUpdateFromBody(body);
    if (Object.keys(update).length === 0) return jsonResponse(mapSpace(row));
    update.updated_at = new Date().toISOString();
    const { data, error } = await admin
      .from("spaces")
      .update(update)
      .eq("id", action)
      .select()
      .single();
    if (error) {
      console.error("space update error", error);
      return emptyResponse(500);
    }
    return jsonResponse(mapSpace(data));
  }

  if (action.endsWith("/status") && ctx.request.method === "PUT") {
    if (!ctx.session?.roles.includes("admin")) return emptyResponse(403);
    const spaceId = action.slice(0, -"/status".length);
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const status = parseStatusInt(body.status);
    if (status === undefined) return emptyResponse(400);
    const { data, error } = await admin
      .from("spaces")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", spaceId)
      .is("deleted_at", null)
      .select()
      .single();
    if (error || !data) return emptyResponse(404);
    return jsonResponse(mapSpace(data));
  }

  if (action.endsWith("/submit") && ctx.request.method === "POST") {
    requireSession(ctx);
    const spaceId = action.slice(0, -"/submit".length);
    const row = await loadOwnedRow(admin, "spaces", spaceId);
    if (!row || !canManageRow(ctx, row)) return emptyResponse(404);
    const { data, error } = await admin
      .from("spaces")
      .update({ status: 1, updated_at: new Date().toISOString() })
      .eq("id", spaceId)
      .select()
      .single();
    if (error || !data) return emptyResponse(500);
    return jsonResponse(mapSpace(data));
  }

  if (ctx.request.method === "DELETE" && action && !action.includes("/")) {
    requireSession(ctx);
    const row = await loadOwnedRow(admin, "spaces", action);
    if (!row || !canManageRow(ctx, row)) return emptyResponse(404);
    const { error } = await admin
      .from("spaces")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", action);
    if (error) return emptyResponse(500);
    return emptyResponse(200);
  }

  return emptyResponse(501);
}

function parseDateParam(value: string | null, fallbackDays: number): Date {
  if (value) {
    const parsed = new Date(`${value}T00:00:00.000Z`);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  const base = new Date();
  base.setUTCHours(0, 0, 0, 0);
  base.setUTCDate(base.getUTCDate() + fallbackDays);
  return base;
}

// Computes per-day available hour intervals for a space by merging the
// price schedules of all packs linked to it (mirrors be-main Availabilities).
async function handleSpaceAvailability(
  admin: ReturnType<typeof createAdminClient>,
  spaceId: string,
  ctx: ApiContext,
): Promise<Response> {
  const from = parseDateParam(ctx.query.get("from"), -3);
  const to = parseDateParam(ctx.query.get("to"), 7);

  const { data, error } = await admin
    .from("packs_spaces")
    .select("packs(prices, deleted_at)")
    .eq("space_id", spaceId);
  if (error) return emptyResponse(500);

  const packs = (data ?? [])
    .map((row) => row.packs as unknown as { prices: unknown; deleted_at: string | null })
    .filter((pack) => pack && !pack.deleted_at);

  const result: { date: string; hours: { from: string; to: string }[] }[] = [];
  for (
    let d = new Date(from);
    d.getTime() < to.getTime();
    d = new Date(d.getTime() + 24 * 60 * 60 * 1000)
  ) {
    const intervals = packs.flatMap((pack) =>
      packIntervalsForDate(pack.prices as never, d),
    );
    const merged = mergeIntervals(intervals);
    result.push({
      date: d.toISOString().slice(0, 10),
      hours: merged.map((interval) => ({
        from: formatGoDuration(interval.from),
        to: formatGoDuration(interval.to),
      })),
    });
  }

  return jsonResponse(result);
}

// Builds a pricing filter from the pack search query params, or null when the
// search is not fully specified (no date/start/end/people).
function parsePriceFilter(ctx: ApiContext): PriceFilter | null {
  const dateStr = ctx.query.get("date");
  const startStr = ctx.query.get("start");
  const endStr = ctx.query.get("end");
  const numPersons = ctx.query.get("num_persons");
  if (!dateStr || !startStr || !endStr || !numPersons) return null;

  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;

  const extras = ctx.query.get("extras");
  const extraParamsRaw = ctx.query.get("extra_params");
  const parsedExtraParams = parseExtraParamsQuery(extraParamsRaw);
  return {
    date,
    start: parseGoDuration(startStr),
    end: parseGoDuration(endStr),
    pax: parseInt(numPersons, 10),
    extraIDs: extras ? extras.split(",").filter(Boolean) : [],
    extraParams: extraParamsMap(parsedExtraParams),
  };
}

export async function handlePacksRoute(
  ctx: ApiContext,
  action: string,
  isPublic: boolean,
): Promise<Response> {
  const admin = createAdminClient();

  if (action.startsWith("space/")) {
    const spaceId = action.replace("space/", "");
    const { data, error } = await admin
      .from("packs_spaces")
      .select("packs(*)")
      .eq("space_id", spaceId);
    if (error) return emptyResponse(500);

    let rawPacks = (data ?? [])
      .map((row) => row.packs as unknown as Record<string, unknown>)
      .filter(Boolean)
      .filter((pack) => !pack.deleted_at);

    // Public visitors only see published packs; owners/admins see all.
    if (isPublic) {
      rawPacks = rawPacks.filter((pack) => pack.status === PUBLISHED_STATUS);
    }

    const filter = parsePriceFilter(ctx);

    const packs = rawPacks.map((raw) => {
      const mapped = { ...mapPack(raw), spaceIDs: [spaceId] };
      if (!filter) return mapped;
      return {
        ...mapped,
        price: computePackPrice(raw as never, filter),
        unavailabilityReason: packUnavailabilityReason(raw as never, filter),
      };
    });
    return jsonResponse(packs);
  }

  if (ctx.request.method === "GET" && !action) {
    let query = admin.from("packs").select("*").is("deleted_at", null);
    if (isPublic) query = query.eq("status", PUBLISHED_STATUS);
    else if (ctx.session) query = query.eq("owner_id", ctx.session.user_id);
    else return unauthorized();
    const { data, error } = await query;
    if (error) return emptyResponse(500);
    return jsonResponse((data ?? []).map(mapPack));
  }

  if (ctx.request.method === "GET" && action) {
    const { data, error } = await admin
      .from("packs")
      .select("*")
      .eq("id", action)
      .is("deleted_at", null)
      .maybeSingle();
    if (error || !data) return emptyResponse(404);
    const spaceIDs = await packSpaceIds(admin, action);
    return jsonResponse(mapPackResponse(data as Record<string, unknown>, spaceIDs));
  }

  if (ctx.request.method === "POST" && !action) {
    const session = requireSession(ctx);
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const spaceId = body.spaceID ?? body.space_id;
    if (!spaceId) return emptyResponse(400);

    const space = await loadOwnedRow(admin, "spaces", String(spaceId));
    if (!space || !canManageRow(ctx, space)) return emptyResponse(404);

    const { data: pack, error } = await admin
      .from("packs")
      .insert({
        owner_id: session.user_id,
        created_at: new Date().toISOString(),
        journey: parseJourneyInt(space.journey),
        status: 0,
        prices: [],
        capacities: [],
        extras: [],
      })
      .select()
      .single();
    if (error) {
      console.error("pack insert error", error);
      return emptyResponse(500);
    }

    const { error: linkError } = await admin
      .from("packs_spaces")
      .insert({ pack_id: pack.id, space_id: spaceId });
    if (linkError) {
      console.error("packs_spaces insert error", linkError);
      return emptyResponse(500);
    }

    return jsonResponse({ ...mapPack(pack), spaceIDs: [spaceId] }, 201);
  }

  if (ctx.request.method === "PATCH" && action && !action.includes("/")) {
    requireSession(ctx);
    const row = await loadOwnedRow(admin, "packs", action);
    if (!row || !canManageRow(ctx, row)) return emptyResponse(404);
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const update = packUpdateFromBody(body);
    if (
      update.upfront_percentage !== undefined &&
      !ctx.session?.roles.includes("admin")
    ) {
      delete update.upfront_percentage;
    }
    if (Object.keys(update).length === 0) {
      const spaceIDs = await packSpaceIds(admin, action);
      return jsonResponse(
        mapPackResponse(row as Record<string, unknown>, spaceIDs),
      );
    }
    update.updated_at = new Date().toISOString();
    const { data, error } = await admin
      .from("packs")
      .update(update)
      .eq("id", action)
      .select()
      .single();
    if (error) {
      console.error("pack update error", error);
      return emptyResponse(500);
    }
    const spaceIDs = await packSpaceIds(admin, action);
    return jsonResponse(
      mapPackResponse(data as Record<string, unknown>, spaceIDs),
    );
  }

  if (action.endsWith("/status") && ctx.request.method === "PUT") {
    if (!ctx.session?.roles.includes("admin")) return emptyResponse(403);
    const packId = action.slice(0, -"/status".length);
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const status = parseStatusInt(body.status);
    if (status === undefined) return emptyResponse(400);
    const { data, error } = await admin
      .from("packs")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", packId)
      .is("deleted_at", null)
      .select()
      .single();
    if (error || !data) return emptyResponse(404);
    return jsonResponse(mapPack(data));
  }

  if (ctx.request.method === "DELETE" && action && !action.includes("/")) {
    requireSession(ctx);
    const row = await loadOwnedRow(admin, "packs", action);
    if (!row || !canManageRow(ctx, row)) return emptyResponse(404);
    const { error } = await admin
      .from("packs")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", action);
    if (error) return emptyResponse(500);
    return emptyResponse(200);
  }

  return emptyResponse(501);
}

export async function handleReviewsRoute(
  ctx: ApiContext,
  action: string,
): Promise<Response> {
  const admin = createAdminClient();

  if (action === "stats" && ctx.request.method === "GET") {
    const entity = ctx.query.get("entity");
    let query = admin.from("review").select("rating");
    if (entity) query = query.eq("entity", entity);
    const { data, error } = await query;
    if (error) return emptyResponse(500);
    const ratings = data ?? [];
    const avg =
      ratings.length > 0
        ? ratings.reduce((s, r) => s + (r.rating ?? 0), 0) / ratings.length
        : 0;
    return jsonResponse({ count: ratings.length, average: avg });
  }

  if (ctx.request.method === "GET" && !action) {
    const entity = ctx.query.get("entity");
    let query = admin.from("review").select("*").order("created_at", { ascending: false });
    if (entity) query = query.eq("entity", entity);
    const { data, error } = await query;
    if (error) return emptyResponse(500);
    return jsonResponse(data ?? []);
  }

  return emptyResponse(501);
}

function goDurationToInterval(value: string): string {
  return `${parseGoDuration(value)} seconds`;
}

export async function handleBookingsRoute(
  ctx: ApiContext,
  action: string,
): Promise<Response> {
  const admin = createAdminClient();

  if (action === "events" && ctx.request.method === "GET") {
    const spaceIds = ctx.query.getAll("space_id");
    let query = admin
      .from("bookings")
      .select("event_date, start_at, end_at")
      .in("status", [
        "inProgress",
        "preConfirmed",
        "confirmed",
        "cancellationRequested",
      ]);
    if (spaceIds.length > 0) query = query.in("space_id", spaceIds);
    const dateFrom = ctx.query.get("date_from");
    if (dateFrom) query = query.gte("event_date", dateFrom);
    const { data, error } = await query;
    if (error) return jsonResponse([]);
    return jsonResponse(
      (data ?? []).map((b) => ({
        date: String(b.event_date).slice(0, 10),
        start: intervalToGoDuration(b.start_at),
        end: intervalToGoDuration(b.end_at),
      })),
    );
  }

  if (action.endsWith("/checkout") && ctx.request.method === "POST") {
    if (!ctx.session) return unauthorized();
    const bookingId = action.slice(0, -"/checkout".length);
    const body = (ctx.body ?? {}) as Record<string, unknown>;

    const { data: existing, error: fetchError } = await admin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("user_id", ctx.session.user_id)
      .maybeSingle();
    if (fetchError || !existing) return emptyResponse(404);

    const update = bookingUpdateFromBody(body);
    update.status = "inProgress";

    const startSeconds = parseGoDuration(intervalToGoDuration(existing.start_at));
    const endSeconds = parseGoDuration(intervalToGoDuration(existing.end_at));

    if (
      await hasBookingOverlap(admin, {
        spaceId: String(existing.space_id),
        eventDate: String(existing.event_date).slice(0, 10),
        startSeconds,
        endSeconds,
        excludeId: bookingId,
      })
    ) {
      return alreadyBookedResponse();
    }

    const { error: updateError } = await admin
      .from("bookings")
      .update(update)
      .eq("id", bookingId)
      .eq("user_id", ctx.session.user_id);
    if (updateError) return emptyResponse(500);

    const merged = { ...existing, ...update };
    const amount = bookingPaymentAmount(merged);
    const currency = String(merged.currency ?? "eur");
    const contactEmail =
      String(merged.contact_email ?? "") || ctx.session.email || "";

    const { data: payment, error: paymentError } = await admin
      .from("payments")
      .insert({
        created_at: new Date().toISOString(),
        user_id: ctx.session.user_id,
        booking_id: bookingId,
        provider: "stripe",
        status: "pending",
      })
      .select()
      .single();
    if (paymentError || !payment) return emptyResponse(500);

    try {
      const checkout = await createBookingCheckoutSession({
        paymentId: payment.id as string,
        bookingId,
        contactEmail,
        currency,
        amount,
      });

      await admin
        .from("payments")
        .update({
          external_id: checkout.sessionId,
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.id);

      return jsonResponse({
        paymentID: payment.id,
        clientSecret: checkout.clientSecret,
      });
    } catch (err) {
      console.error("checkout error", err);
      await admin.from("bookings").update({ status: "draft" }).eq("id", bookingId);
      await admin
        .from("payments")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", payment.id);
      return emptyResponse(500);
    }
  }

  if (action.endsWith("/cancel") && ctx.request.method === "POST") {
    if (!ctx.session) return unauthorized();
    const bookingId = action.slice(0, -"/cancel".length);

    const { data: booking, error } = await admin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .maybeSingle();
    if (error || !booking) return emptyResponse(404);

    const isOwner = booking.user_id === ctx.session.user_id;
    const isAdmin = ctx.session.roles.includes("admin");
    if (!isOwner && !isAdmin) return unauthorized();

    let nextStatus: string | null = null;
    const status = String(booking.status ?? "draft");

    if (isAdmin) {
      nextStatus = status === "cancellationRequested" ? "cancelled" : "cancelled";
    } else if (isOwner) {
      if (status === "draft" || status === "inProgress") {
        nextStatus = "abandoned";
      } else if (status === "confirmed") {
        nextStatus = "cancellationRequested";
      }
    }

    if (!nextStatus) return emptyResponse(403);

    const { error: updateError } = await admin
      .from("bookings")
      .update({
        status: nextStatus,
        cancelled_by: isAdmin ? "admin" : "customer",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId);
    if (updateError) return emptyResponse(500);
    return emptyResponse(200);
  }

  if (action.endsWith("/status") && ctx.request.method === "PUT") {
    if (!ctx.session?.roles.includes("admin")) return emptyResponse(403);
    const bookingId = action.slice(0, -"/status".length);
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const status = body.status ? String(body.status) : null;
    if (!status) return emptyResponse(400);

    const { error } = await admin
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", bookingId);
    if (error) return emptyResponse(500);
    return emptyResponse(200);
  }

  if (ctx.request.method === "GET" && !action) {
    if (!ctx.session) return unauthorized();
    const isAdmin = ctx.session.roles.includes("admin");
    let query = admin.from("bookings").select("*");
    if (!isAdmin) query = query.eq("user_id", ctx.session.user_id);

    const spaceIds = ctx.query.getAll("space_id");
    if (spaceIds.length > 0) query = query.in("space_id", spaceIds);
    const dateFrom = ctx.query.get("date_from");
    if (dateFrom) query = query.gte("event_date", dateFrom);
    const dateTo = ctx.query.get("date_to");
    if (dateTo) query = query.lte("event_date", dateTo);

    const { data, error } = await query.order("created_at", {
      ascending: false,
    });
    if (error) return emptyResponse(500);
    return jsonResponse((data ?? []).map(mapBooking));
  }

  if (ctx.request.method === "GET" && action && !action.includes("/")) {
    if (!ctx.session) return unauthorized();
    const { data, error } = await admin
      .from("bookings")
      .select("*")
      .eq("id", action)
      .maybeSingle();
    if (error || !data) return emptyResponse(404);
    return jsonResponse(mapBooking(data));
  }

  if (ctx.request.method === "POST" && !action) {
    if (!ctx.session) return unauthorized();
    await ensureProfile(admin, ctx.session.user_id);
    const body = (ctx.body ?? {}) as Record<string, unknown>;

    const spaceId = String(body.spaceID ?? "");
    const packId = body.packID ? String(body.packID) : null;
    if (!spaceId) return emptyResponse(400);

    const kind = bookingKindToInt(body.kind ?? "internal");
    const dateStr = body.date ? String(body.date) : null;
    const startStr = body.start ? String(body.start) : null;
    const endStr = body.end ? String(body.end) : null;

    if (dateStr && startStr && endStr) {
      const overlaps = await hasBookingOverlap(admin, {
        spaceId,
        eventDate: dateStr,
        startSeconds: parseGoDuration(startStr),
        endSeconds: parseGoDuration(endStr),
      });
      if (overlaps) return alreadyBookedResponse();
    }

    let totalAmount = 0;
    let commission = 0;
    let freeCancellation: string | null = null;
    let upfrontAmount = 0;
    let upfrontPercentage = 100;
    let currency = "eur";

    // For internal (RINU) bookings with a pack, compute the price server-side.
    if (packId && dateStr && startStr && endStr) {
      const { data: pack } = await admin
        .from("packs")
        .select("*")
        .eq("id", packId)
        .maybeSingle();
      const { data: space } = await admin
        .from("spaces")
        .select("venue_id")
        .eq("id", spaceId)
        .maybeSingle();
      const venueId = space?.venue_id;
      const { data: venue } = venueId
        ? await admin
            .from("venues")
            .select("commission, currency")
            .eq("id", venueId)
            .maybeSingle()
        : { data: null };

      if (pack) {
        const extraIDs = parseExtraIDs(body);
        const extraParams = extraParamsMap(parseExtraParams(body));
        const filter: PriceFilter = {
          date: new Date(dateStr),
          start: parseGoDuration(startStr),
          end: parseGoDuration(endStr),
          pax: body.numPeople != null ? Number(body.numPeople) : null,
          extraIDs,
          extraParams,
        };
        const price = computePackPrice(pack as never, filter);
        totalAmount = price?.value ?? 0;

        const period = String(pack.cancellation_period ?? "");
        const payment = computePackPaymentBreakdown({
          totalAmount,
          cancellationPeriod: period,
          upfrontPercentage: Number(pack.upfront_percentage ?? 20),
          eventDate: new Date(dateStr),
        });
        freeCancellation = payment.freeCancellationUntil
          .toISOString()
          .slice(0, 10);
        upfrontAmount = payment.todayAmount;
        upfrontPercentage = payment.upfrontPercentage;

        commission = (totalAmount * Number(venue?.commission ?? 0)) / 100;
        currency = String(venue?.currency ?? "eur");
      }
    } else if (body.totalAmount != null) {
      totalAmount = Number(body.totalAmount);
      upfrontAmount = totalAmount;
    }

    const extraIDs = parseExtraIDs(body);
    const extraParams = parseExtraParams(body);

    const insert: Record<string, unknown> = {
      user_id: ctx.session.user_id,
      space_id: spaceId,
      pack_id: packId,
      created_at: new Date().toISOString(),
      status: body.status ? String(body.status) : "draft",
      kind,
      num_people: body.numPeople != null ? Number(body.numPeople) : null,
      layout: body.layout ?? null,
      notes: body.notes ?? null,
      event_date: dateStr,
      start_at: startStr ? goDurationToInterval(startStr) : null,
      end_at: endStr ? goDurationToInterval(endStr) : null,
      total_amount: totalAmount,
      commission,
      free_cancellation: freeCancellation,
      upfront_amount: upfrontAmount,
      upfront_percentage: upfrontPercentage,
      currency,
      timezone: "Europe/Lisbon",
      contact_name: body.contactName ?? null,
      contact_email: body.contactEmail ?? null,
      contact_phone_extension:
        body.contactPhoneExtension != null
          ? Number(body.contactPhoneExtension)
          : null,
      contact_phone_number:
        body.contactPhoneNumber != null
          ? Number(body.contactPhoneNumber)
          : null,
      extra_ids: extraIDs,
      extra_params: extraParams,
    };

    const { data, error } = await admin
      .from("bookings")
      .insert(insert)
      .select()
      .single();
    if (error) {
      console.error("booking insert error", error);
      return emptyResponse(500);
    }
    return jsonResponse(mapBooking(data), 201);
  }

  if (ctx.request.method === "PATCH" && action) {
    if (!ctx.session) return unauthorized();
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (body.status != null) update.status = String(body.status);
    if (body.notes != null) update.notes = body.notes;
    if (body.layout != null) update.layout = body.layout;
    if (body.billingName != null) update.billing_name = body.billingName;
    if (body.billingVat != null) update.billing_vat = body.billingVat;
    if (body.billingVAT != null) update.billing_vat = body.billingVAT;
    if (body.billingAddress != null) update.billing_address = body.billingAddress;
    if (body.billingPostCode != null)
      update.billing_postal_code = body.billingPostCode;
    if (body.billingCity != null) update.billing_city = body.billingCity;
    if (body.billingCountry != null) update.billing_country = body.billingCountry;
    if (body.contactName != null) update.contact_name = body.contactName;
    if (body.contactEmail != null) update.contact_email = body.contactEmail;
    if (body.contactPhoneExtension != null)
      update.contact_phone_extension = Number(body.contactPhoneExtension);
    if (body.contactPhoneNumber != null)
      update.contact_phone_number = Number(body.contactPhoneNumber);

    const { data, error } = await admin
      .from("bookings")
      .update(update)
      .eq("id", action)
      .eq("user_id", ctx.session.user_id)
      .select()
      .single();
    if (error || !data) return emptyResponse(500);
    return jsonResponse(mapBooking(data));
  }

  return emptyResponse(501);
}

type DashboardItem = {
  id: string;
  reference: string;
  venue: string;
  space: string;
  pack: string;
  type: "venue" | "space" | "pack";
  commission?: number;
  status: string;
  journey: string;
  modifiedAt: string;
};

// Returns the combined venues/spaces/packs list used by the admin dashboard
// and host status table (mirrors be-main dashboard List).
export async function handleDashboardRoute(ctx: ApiContext): Promise<Response> {
  if (!ctx.session) return unauthorized();
  const admin = createAdminClient();

  const isAdmin = ctx.session.roles.includes("admin");
  const ownerId = ctx.session.user_id;

  const typeFilter = ctx.query.get("type"); // venue | space | pack
  const statusFilter = ctx.query.get("status");
  const journeyFilter = ctx.query.get("journey");
  const q = (ctx.query.get("q") ?? "").toLowerCase();
  const page = Math.max(parseInt(ctx.query.get("page") ?? "1", 10), 1);
  const pageSize = Math.min(
    Math.max(parseInt(ctx.query.get("page_size") ?? "20", 10), 1),
    100,
  );

  const scopeOwner = <T>(query: T): T => {
    if (isAdmin) return query;
    return (query as { eq: (c: string, v: string) => T }).eq(
      "owner_id",
      ownerId,
    );
  };

  const items: DashboardItem[] = [];

  if (!typeFilter || typeFilter === "venue") {
    const { data } = await scopeOwner(
      admin
        .from("venues")
        .select("id, reference, name, status, journey, commission, created_at, updated_at, owner_id")
        .is("deleted_at", null),
    );
    for (const v of data ?? []) {
      items.push({
        id: v.id,
        reference: v.reference ?? "",
        venue: v.name ?? "",
        space: "",
        pack: "",
        type: "venue",
        commission: v.commission ?? undefined,
        status: mapStatus(v.status),
        journey: mapJourney(v.journey),
        modifiedAt: v.updated_at ?? v.created_at,
      });
    }
  }

  if (!typeFilter || typeFilter === "space") {
    const { data } = await scopeOwner(
      admin
        .from("spaces")
        .select("id, reference, name, status, journey, created_at, updated_at, owner_id, venues(name)")
        .is("deleted_at", null),
    );
    for (const s of data ?? []) {
      const venue = s.venues as unknown as { name?: string } | null;
      items.push({
        id: s.id,
        reference: s.reference ?? "",
        venue: venue?.name ?? "",
        space: s.name ?? "",
        pack: "",
        type: "space",
        status: mapStatus(s.status),
        journey: mapJourney(s.journey),
        modifiedAt: s.updated_at ?? s.created_at,
      });
    }
  }

  if (!typeFilter || typeFilter === "pack") {
    const { data } = await scopeOwner(
      admin
        .from("packs")
        .select(
          "id, reference, name, status, journey, created_at, updated_at, owner_id, packs_spaces(spaces(name, venues(name)))",
        )
        .is("deleted_at", null),
    );
    for (const p of data ?? []) {
      const link = (
        p.packs_spaces as unknown as {
          spaces?: { name?: string; venues?: { name?: string } | null } | null;
        }[]
      )?.[0];
      const space = link?.spaces;
      const venue = space?.venues;
      items.push({
        id: p.id,
        reference: p.reference ?? "",
        venue: venue?.name ?? "",
        space: space?.name ?? "",
        pack: p.name ?? "",
        type: "pack",
        status: mapStatus(p.status),
        journey: mapJourney(p.journey),
        modifiedAt: p.updated_at ?? p.created_at,
      });
    }
  }

  let filtered = items;
  if (statusFilter) {
    const statusStr = mapStatus(
      Number.isNaN(Number(statusFilter)) ? statusFilter : Number(statusFilter),
    );
    filtered = filtered.filter((i) => i.status === statusStr);
  }
  if (journeyFilter) {
    const journeyStr = mapJourney(
      Number.isNaN(Number(journeyFilter))
        ? journeyFilter
        : Number(journeyFilter),
    );
    filtered = filtered.filter((i) => i.journey === journeyStr);
  }
  if (q) {
    filtered = filtered.filter(
      (i) =>
        i.venue.toLowerCase().includes(q) ||
        i.space.toLowerCase().includes(q) ||
        i.pack.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q),
    );
  }

  filtered.sort(
    (a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime(),
  );

  const start = (page - 1) * pageSize;
  return jsonResponse(filtered.slice(start, start + pageSize));
}

export async function handleUsersRoute(
  ctx: ApiContext,
  action: string,
): Promise<Response> {
  if (!ctx.session) return unauthorized();
  const admin = createAdminClient();

  if (action === "list" && ctx.request.method === "GET") {
    const { data, error } = await admin.from("profiles").select("*");
    if (error) return emptyResponse(500);
    return jsonResponse(data ?? []);
  }

  if (ctx.request.method === "GET" && !action) {
    const { data, error } = await admin
      .from("profiles")
      .select("*")
      .eq("id", ctx.session.user_id)
      .maybeSingle();
    if (error || !data) return emptyResponse(404);
    return jsonResponse(data);
  }

  return emptyResponse(501);
}

export async function handleQuoteRoute(
  ctx: ApiContext,
  action: string,
  isPublic: boolean,
): Promise<Response> {
  const admin = createAdminClient();

  if (ctx.request.method === "POST" && !action) {
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const { error } = await admin.from("quote").insert({
      ...body,
      user_id: ctx.session?.user_id ?? null,
      created_at: new Date().toISOString(),
    });
    if (error) return emptyResponse(500);
    return emptyResponse(201);
  }

  if (ctx.request.method === "GET" && ctx.session) {
    const { data, error } = await admin
      .from("quote")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return emptyResponse(500);
    return jsonResponse(data ?? []);
  }

  if (isPublic) return emptyResponse(401);
  return emptyResponse(501);
}

export async function handleContactRoute(
  ctx: ApiContext,
  action: string,
): Promise<Response> {
  const admin = createAdminClient();

  if (ctx.request.method === "POST" && !action) {
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const { error } = await admin.from("contact_request").insert({
      ...body,
      user_id: ctx.session?.user_id ?? null,
      created_at: new Date().toISOString(),
    });
    if (error) return emptyResponse(500);
    return emptyResponse(201);
  }

  if (ctx.request.method === "GET" && ctx.session) {
    const { data, error } = await admin
      .from("contact_request")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return emptyResponse(500);
    return jsonResponse(data ?? []);
  }

  return emptyResponse(501);
}

function mapWatchlist(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    spaces: Array.isArray(row.spaces) ? (row.spaces as string[]) : [],
  };
}

async function getOrCreateDefaultWatchlist(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
) {
  const { data, error } = await admin
    .from("watchlist")
    .select("*")
    .eq("user_id", userId)
    .eq("name", "default")
    .maybeSingle();
  if (error) return { error };
  if (data) return { data };

  const { data: created, error: insertError } = await admin
    .from("watchlist")
    .insert({
      user_id: userId,
      name: "default",
      spaces: [],
      created_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (insertError) return { error: insertError };
  return { data: created };
}

export async function handleWatchlistRoute(
  ctx: ApiContext,
  action: string,
): Promise<Response> {
  if (!ctx.session) return unauthorized();
  const admin = createAdminClient();
  const userId = ctx.session.user_id;

  if (ctx.request.method === "GET" && action === "default") {
    const result = await getOrCreateDefaultWatchlist(admin, userId);
    if (result.error || !result.data) return emptyResponse(500);
    return jsonResponse(mapWatchlist(result.data as Record<string, unknown>));
  }

  if (ctx.request.method === "POST" && action === "default/add") {
    const result = await getOrCreateDefaultWatchlist(admin, userId);
    if (result.error || !result.data) return emptyResponse(500);
    const body = (ctx.body ?? {}) as { spaces?: string[] };
    const toAdd = body.spaces ?? [];
    const current = Array.isArray(result.data.spaces)
      ? (result.data.spaces as string[])
      : [];
    const updated = [...new Set([...current, ...toAdd])];
    const { data, error } = await admin
      .from("watchlist")
      .update({ spaces: updated, updated_at: new Date().toISOString() })
      .eq("id", result.data.id)
      .select()
      .single();
    if (error || !data) return emptyResponse(500);
    return jsonResponse(mapWatchlist(data as Record<string, unknown>));
  }

  if (ctx.request.method === "DELETE" && action.startsWith("default/")) {
    const spaceId = action.slice("default/".length);
    if (!spaceId) return emptyResponse(400);
    const { data: existing, error: fetchError } = await admin
      .from("watchlist")
      .select("*")
      .eq("user_id", userId)
      .eq("name", "default")
      .maybeSingle();
    if (fetchError) return emptyResponse(500);
    if (!existing) return emptyResponse(404);
    const current = Array.isArray(existing.spaces)
      ? (existing.spaces as string[])
      : [];
    const updated = current.filter((id) => id !== spaceId);
    const { data, error } = await admin
      .from("watchlist")
      .update({ spaces: updated, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
      .select()
      .single();
    if (error || !data) return emptyResponse(500);
    return jsonResponse(mapWatchlist(data as Record<string, unknown>));
  }

  if (ctx.request.method === "GET" && action) {
    const { data, error } = await admin
      .from("watchlist")
      .select("*")
      .eq("user_id", userId)
      .eq("id", action)
      .maybeSingle();
    if (error || !data) return emptyResponse(404);
    return jsonResponse(mapWatchlist(data as Record<string, unknown>));
  }

  return emptyResponse(501);
}

export async function handleHighlightsRoute(
  ctx: ApiContext,
  action: string,
): Promise<Response> {
  const admin = createAdminClient();

  if (ctx.request.method === "GET" && !action) {
    const { data, error } = await admin
      .from("highlights")
      .select("*")
      .is("deleted_at", null)
      .order("priority", { ascending: false });
    if (error) return emptyResponse(500);
    return jsonResponse((data ?? []).map(mapHighlight));
  }

  if (ctx.request.method === "GET" && action && !action.includes("/")) {
    const { data, error } = await admin
      .from("highlights")
      .select("*")
      .eq("id", action)
      .is("deleted_at", null)
      .maybeSingle();
    if (error || !data) return emptyResponse(404);
    return jsonResponse(mapHighlight(data));
  }

  if (action.startsWith("space/") && ctx.request.method === "GET") {
    const spaceId = action.replace("space/", "");
    const { data, error } = await admin
      .from("highlights")
      .select("*")
      .eq("space_id", spaceId)
      .is("deleted_at", null);
    if (error) return emptyResponse(500);
    return jsonResponse((data ?? []).map(mapHighlight));
  }

  if (ctx.request.method === "POST" && !action) {
    if (!ctx.session?.roles.includes("admin")) return emptyResponse(403);
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const { data, error } = await admin
      .from("highlights")
      .insert({
        created_at: new Date().toISOString(),
        space_id: body.spaceID,
        from_date: body.from,
        to_date: body.to,
        priority: body.priority != null ? Number(body.priority) : 0,
        mode: body.mode,
        recommended: Boolean(body.recommended),
      })
      .select()
      .single();
    if (error) return emptyResponse(500);
    return jsonResponse(mapHighlight(data), 201);
  }

  if (ctx.request.method === "PUT" && action && !action.includes("/")) {
    if (!ctx.session?.roles.includes("admin")) return emptyResponse(403);
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const { data, error } = await admin
      .from("highlights")
      .update({
        updated_at: new Date().toISOString(),
        space_id: body.spaceID,
        from_date: body.from,
        to_date: body.to,
        priority: body.priority != null ? Number(body.priority) : 0,
        mode: body.mode,
        recommended: Boolean(body.recommended),
      })
      .eq("id", action)
      .select()
      .single();
    if (error || !data) return emptyResponse(500);
    return jsonResponse(mapHighlight(data));
  }

  return emptyResponse(501);
}

export async function handlePhotosRoute(
  ctx: ApiContext,
  action: string,
): Promise<Response> {
  const admin = createAdminClient();

  if (ctx.request.method === "GET" && action) {
    const { data, error } = await admin
      .from("photos")
      .select("*")
      .eq("id", action)
      .maybeSingle();
    if (error || !data) return emptyResponse(404);
    return jsonResponse(mapPhoto(data));
  }

  if (ctx.request.method === "POST" && action === "list") {
    const body = (ctx.body ?? {}) as { ids?: string[] };
    const ids = body.ids ?? [];
    if (ids.length === 0) return jsonResponse([]);
    const { data, error } = await admin.from("photos").select("*").in("id", ids);
    if (error) return emptyResponse(500);
    const byId = new Map((data ?? []).map((row) => [row.id as string, mapPhoto(row)]));
    return jsonResponse(ids.map((id) => byId.get(id)).filter(Boolean));
  }

  if (ctx.request.method === "GET" && !action) {
    const ids = ctx.query.getAll("id");
    if (ids.length === 0) return jsonResponse([]);
    const { data, error } = await admin.from("photos").select("*").in("id", ids);
    if (error) return emptyResponse(500);
    return jsonResponse((data ?? []).map(mapPhoto));
  }

  return emptyResponse(501);
}

export async function handlePaymentsRoute(
  ctx: ApiContext,
  action: string,
): Promise<Response> {
  if (!ctx.session) return unauthorized();
  const admin = createAdminClient();

  if (action.endsWith("/cancel") && ctx.request.method === "PUT") {
    const paymentId = action.slice(0, -"/cancel".length);
    const { data: payment, error } = await admin
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .maybeSingle();
    if (error || !payment) return emptyResponse(404);

    const { data: booking } = await admin
      .from("bookings")
      .select("id, user_id, status")
      .eq("id", payment.booking_id)
      .maybeSingle();
    if (!booking || booking.user_id !== ctx.session.user_id) {
      return emptyResponse(404);
    }

    if (payment.status === "paid") return emptyResponse(400);

    if (payment.status !== "cancelled") {
      await admin
        .from("payments")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentId);
    }

    if (booking.status === "inProgress") {
      await admin
        .from("bookings")
        .update({
          status: "draft",
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id);
    }

    return emptyResponse(200);
  }

  if (ctx.request.method === "GET" && action && !action.includes("/")) {
    const { data: payment, error } = await admin
      .from("payments")
      .select("*")
      .eq("id", action)
      .maybeSingle();
    if (error || !payment) return emptyResponse(404);

    const { data: booking } = await admin
      .from("bookings")
      .select("user_id")
      .eq("id", payment.booking_id)
      .maybeSingle();
    if (!booking || booking.user_id !== ctx.session.user_id) {
      return emptyResponse(404);
    }

    return jsonResponse(mapPayment(payment));
  }

  return emptyResponse(501);
}

export async function handleIcalRoute(
  ctx: ApiContext,
  action: string,
): Promise<Response> {
  return emptyResponse(501);
}

export async function handleEmailRoute(ctx: ApiContext): Promise<Response> {
  return emptyResponse(501);
}

export async function handleConversationRoute(): Promise<Response> {
  return emptyResponse(501);
}
