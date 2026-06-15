import type { ApiContext } from "@lib/api/context";
import {
  emptyResponse,
  errorResponse,
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
  mapEventHubQuoteLead,
  mapEventHubContactLead,
  mapContactPack,
  parseQualityScore,
  countDistinctSpacesFromQuotePackRows,
  mapQuotePack,
  mapPackLookup,
  isQuoteStatus,
  mapJourney,
  mapPack,
  mapSubscription,
  mapPayment,
  mapAttachment,
  mapPhoto,
  mapSubscriptionRow,
  mapTestimonial,
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
  importGoogleReviews,
  parseBulkTestimonials,
  testimonialInsertFromBody,
} from "@lib/api/testimonials";
import {
  createBookingCheckoutSession,
  createSubscriptionCheckoutSession,
  createBillingPortalSession,
  type SubscriptionPlan,
  type SubscriptionInterval,
} from "@lib/stripe/checkout";
import { computePackPaymentBreakdown } from "@lib/payment/upfront";
import {
  extraParamsMap,
  parseExtraParamsQuery,
} from "@lib/extras/quantities";
import {
  buildPriceFilterFromQuote,
  computeLeadPackPrice,
  mapPackPreviewForAdmin,
  parseLeadPackExtrasBody,
} from "@lib/api/leadPricing";
import {
  filterLeadRows,
  parseAssignedAdminIds,
  parseLeadListQuery,
  validateAssignedAdminIds,
} from "@lib/api/leadList";
import {
  insertLeadPack,
  isLeadPackLimitError,
  leadPackSelect,
  MAX_LEAD_PACKS,
  patchLeadPack,
} from "@lib/api/leadPacks";
import {
  findProfileByEmail,
  mapVenueCollaboratorRows,
  requireOwnerPaidVenueForCollaborators,
  validateCollaboratorCandidate,
} from "@lib/api/venueCollaboratorsApi";
import {
  canManagePackRow,
  canManageSpaceRow,
  canManageVenueRow,
  getAccessibleVenueIds,
  getPackIdsForVenueIds,
  isVenueOwner,
  canManageVenueResources,
  venueAccessRole,
} from "@lib/api/venueAccess";

const PUBLISHED_STATUS = 2;

function mapSearchRow(
  row: Record<string, unknown>,
  photoURLs: string[],
  metrics: {
    capacity: number;
    price: { min: number | null; pax: number | null; hour: number | null };
  },
  highlight?: { recommended?: boolean; priority?: number; from_date?: string | null },
  subscription: string = "basic",
) {
  return {
    id: row.space_id,
    status: "active",
    venueID: row.venue_id,
    subscription,
    spaceName: row.space_name,
    venueName: row.venue_name,
    createdAt: row.created_at,
    journey: row.journey ?? "venues",
    attributes: row.attributes ?? [],
    description: row.description ?? "",
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
    highlighted: !!highlight,
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

const SPACE_SEARCH_SELECT = `
  id,
  name,
  description,
  photos,
  primary_photo,
  created_at,
  venue_id,
  journey,
  attributes,
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
      const venueID = ctx.query.get("venueID");
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

      let qualifyingRows = rows;

      // Spaces and services are different journeys; regular search only
      // shows venues unless services are explicitly requested.
      const journeyParam = ctx.query.get("journey");
      const wantedJourney = journeyParam === "services" ? "services" : "venues";
      if (journeyParam !== "all") {
        qualifyingRows = qualifyingRows.filter(
          (row) => mapJourney(row.journey) === wantedJourney,
        );
      }

      const eventType = ctx.query.get("eventType");
      const attributeFilters = ctx.query
        .getAll("attributes")
        .flatMap((value) => value.split(","))
        .filter(Boolean);
      const requiredAttributes = [
        ...new Set([...(eventType ? [eventType] : []), ...attributeFilters]),
      ];
      if (requiredAttributes.length > 0) {
        qualifyingRows = qualifyingRows.filter((row) => {
          const spaceAttributes = (row.attributes as string[] | null) ?? [];
          return requiredAttributes.every((attribute) =>
            spaceAttributes.includes(attribute),
          );
        });
      }

      if (venueID) {
        qualifyingRows = qualifyingRows.filter(
          (row) => row.venue_id === venueID,
        );
      }

      // Geographic bounds (from a selected city): keep venues whose
      // coordinates fall inside the box. Used by the homepage search and
      // the event builder's zone question.
      const top = parseFloat(ctx.query.get("top") ?? "");
      const bottom = parseFloat(ctx.query.get("bottom") ?? "");
      const left = parseFloat(ctx.query.get("left") ?? "");
      const right = parseFloat(ctx.query.get("right") ?? "");
      const hasBounds =
        !Number.isNaN(top) &&
        !Number.isNaN(bottom) &&
        !Number.isNaN(left) &&
        !Number.isNaN(right);
      if (hasBounds) {
        qualifyingRows = qualifyingRows.filter((row) => {
          const venue = row.venues as unknown as {
            latitude?: number | null;
            longitude?: number | null;
          };
          const lat = Number(venue?.latitude ?? 0);
          const lng = Number(venue?.longitude ?? 0);
          if (!lat || !lng) return false;
          return lat <= top && lat >= bottom && lng >= left && lng <= right;
        });
      }

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
            journey: mapJourney(row.journey),
            attributes: (row.attributes as string[] | null) ?? [],
            description: String(row.description ?? "").slice(0, 600),
          },
          photoURLs,
          metrics,
          highlight,
          mapSubscription(venue.subscription),
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

  const collabSearchMatch = action.match(/^collaborators\/search$/);
  const collabListMatch = action.match(/^([^/]+)\/collaborators$/);
  const collabDeleteMatch = action.match(/^([^/]+)\/collaborators\/([^/]+)$/);
  const ownerTransferMatch = action.match(/^([^/]+)\/owner$/);

  // PATCH /venues/:id/owner — admin reassigns a venue (and its spaces/packs)
  // to another user.
  if (ctx.request.method === "PATCH" && ownerTransferMatch) {
    if (!requireAdmin(ctx)) return emptyResponse(403);
    const venueId = ownerTransferMatch[1];
    const body = (ctx.body ?? {}) as { ownerId?: unknown };
    const ownerId = String(body.ownerId ?? "");
    if (!ownerId) return emptyResponse(400);

    const { data: owner } = await admin
      .from("profiles")
      .select("id")
      .eq("id", ownerId)
      .maybeSingle();
    if (!owner) return errorResponse("Utilizador não encontrado", 404);

    const { data: venue } = await admin
      .from("venues")
      .select("id")
      .eq("id", venueId)
      .maybeSingle();
    if (!venue) return emptyResponse(404);

    const now = new Date().toISOString();
    const { error: venueError } = await admin
      .from("venues")
      .update({ owner_id: ownerId, updated_at: now })
      .eq("id", venueId);
    if (venueError) return emptyResponse(500);

    await admin
      .from("spaces")
      .update({ owner_id: ownerId, updated_at: now })
      .eq("venue_id", venueId);

    const { data: spaceRows } = await admin
      .from("spaces")
      .select("id")
      .eq("venue_id", venueId);
    const spaceIds = (spaceRows ?? []).map((row) => row.id as string);
    if (spaceIds.length > 0) {
      const { data: links } = await admin
        .from("packs_spaces")
        .select("pack_id")
        .in("space_id", spaceIds);
      const packIds = [
        ...new Set((links ?? []).map((link) => link.pack_id as string)),
      ];
      if (packIds.length > 0) {
        await admin
          .from("packs")
          .update({ owner_id: ownerId, updated_at: now })
          .in("id", packIds);
      }
    }

    return emptyResponse(200);
  }

  // GET /venues/collaborators/search?email= — find existing RINU user (venue owners)
  if (ctx.request.method === "GET" && collabSearchMatch) {
    if (!ctx.session) return unauthorized();
    const email = (ctx.query.get("email") ?? "").trim();
    if (!email || !email.includes("@")) return emptyResponse(400);

    try {
      const profile = await findProfileByEmail(admin, email);
      if (!profile) return emptyResponse(404);
      if (profile.id === ctx.session.user_id) {
        return errorResponse("Não pode adicionar-se a si próprio", 400);
      }
      return jsonResponse({
        userID: profile.id,
        email: profile.email,
        name: profile.name,
      });
    } catch {
      return emptyResponse(500);
    }
  }

  // GET /venues/:venueId/collaborators
  if (ctx.request.method === "GET" && collabListMatch) {
    if (!ctx.session) return unauthorized();
    const venueId = collabListMatch[1];
    const venue = await loadOwnedRow(admin, "venues", venueId);
    const gate = await requireOwnerPaidVenueForCollaborators(
      admin,
      ctx,
      venueId,
      venue,
    );
    if (gate) return gate;

    const { data, error } = await admin
      .from("venue_collaborators")
      .select("id, venue_id, user_id, created_at")
      .eq("venue_id", venueId)
      .order("created_at", { ascending: true });
    if (error) return emptyResponse(500);
    return jsonResponse(await mapVenueCollaboratorRows(admin, data ?? []));
  }

  // POST /venues/:venueId/collaborators  { email }
  if (ctx.request.method === "POST" && collabListMatch) {
    if (!ctx.session) return unauthorized();
    const venueId = collabListMatch[1];
    const venue = await loadOwnedRow(admin, "venues", venueId);
    const gate = await requireOwnerPaidVenueForCollaborators(
      admin,
      ctx,
      venueId,
      venue,
    );
    if (gate) return gate;

    const body = (ctx.body ?? {}) as { email?: string };
    const email = (body.email ?? "").trim();
    if (!email) return emptyResponse(400);

    let profile;
    try {
      profile = await findProfileByEmail(admin, email);
    } catch {
      return emptyResponse(500);
    }
    if (!profile) {
      return errorResponse(
        "Este email não tem conta na RINU. O utilizador tem de se registar primeiro.",
        404,
      );
    }
    const blocked = validateCollaboratorCandidate(
      ctx,
      profile,
      String(venue!.owner_id),
    );
    if (blocked) return blocked;

    const { data, error } = await admin
      .from("venue_collaborators")
      .insert({
        venue_id: venueId,
        user_id: profile.id,
        created_by: ctx.session.user_id,
      })
      .select("id, venue_id, user_id, created_at")
      .single();
    if (error) {
      if (error.code === "23505") {
        return errorResponse("Este utilizador já tem acesso a este local", 409);
      }
      return emptyResponse(500);
    }
    return jsonResponse(
      {
        id: data.id,
        venueID: data.venue_id,
        userID: data.user_id,
        email: profile.email,
        name: profile.name,
        createdAt: data.created_at,
      },
      201,
    );
  }

  // DELETE /venues/:venueId/collaborators/:userId
  if (ctx.request.method === "DELETE" && collabDeleteMatch) {
    if (!ctx.session) return unauthorized();
    const venueId = collabDeleteMatch[1];
    const userId = collabDeleteMatch[2];
    if (!(await isVenueOwner(admin, ctx, venueId))) return emptyResponse(403);
    const { error } = await admin
      .from("venue_collaborators")
      .delete()
      .eq("venue_id", venueId)
      .eq("user_id", userId);
    if (error) return emptyResponse(500);
    return emptyResponse(204);
  }

  if (ctx.request.method === "GET" && !action) {
    if (isPublic) {
      const { data, error } = await admin
        .from("venues")
        .select("*")
        .is("deleted_at", null)
        .eq("status", PUBLISHED_STATUS)
        .order("created_at", { ascending: false });
      if (error) return emptyResponse(500);
      return jsonResponse((data ?? []).map(mapVenue));
    }
    if (!ctx.session) return unauthorized();
    const venueIds = await getAccessibleVenueIds(admin, ctx);
    if (venueIds.length === 0) return jsonResponse([]);
    const { data, error } = await admin
      .from("venues")
      .select("*")
      .in("id", venueIds)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
    if (error) return emptyResponse(500);
    return jsonResponse(
      (data ?? []).map((row) => ({
        ...mapVenue(row),
        accessRole: venueAccessRole(ctx, row),
      })),
    );
  }

  if (ctx.request.method === "GET" && action && !action.includes("/")) {
    let query = admin.from("venues").select("*").eq("id", action).is("deleted_at", null);
    if (isPublic) query = query.eq("status", PUBLISHED_STATUS);
    const { data, error } = await query.maybeSingle();
    if (error || !data) return emptyResponse(404);
    if (!isPublic) {
      if (!ctx.session) return unauthorized();
      if (!(await canManageVenueResources(admin, ctx, action))) {
        return emptyResponse(404);
      }
    }
    return jsonResponse({
      ...mapVenue(data),
      accessRole: isPublic ? undefined : venueAccessRole(ctx, data),
    });
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
    if (!row || !(await canManageVenueRow(admin, ctx, row, { ownerOnly: true }))) {
      return emptyResponse(404);
    }
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
    if (!row || !(await canManageVenueRow(admin, ctx, row, { ownerOnly: true }))) {
      return emptyResponse(404);
    }
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
    const venueID = ctx.query.get("venueID");
    if (isPublic) {
      let query = admin.from("spaces").select("*").is("deleted_at", null);
      query = query.eq("status", PUBLISHED_STATUS);
      if (venueID) query = query.eq("venue_id", venueID);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) return emptyResponse(500);
      return jsonResponse((data ?? []).map(mapSpace));
    }
    if (!ctx.session) return unauthorized();
    if (venueID) {
      if (!(await canManageVenueResources(admin, ctx, venueID))) {
        return emptyResponse(404);
      }
      const { data, error } = await admin
        .from("spaces")
        .select("*")
        .eq("venue_id", venueID)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (error) return emptyResponse(500);
      return jsonResponse((data ?? []).map(mapSpace));
    }
    const venueIds = await getAccessibleVenueIds(admin, ctx);
    if (venueIds.length === 0) return jsonResponse([]);
    const { data, error } = await admin
      .from("spaces")
      .select("*")
      .in("venue_id", venueIds)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });
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
    if (!venue || !(await canManageVenueRow(admin, ctx, venue))) {
      return emptyResponse(404);
    }

    const { data, error } = await admin
      .from("spaces")
      .insert({
        owner_id: venue.owner_id,
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
    if (!row || !(await canManageSpaceRow(admin, ctx, row))) {
      return emptyResponse(404);
    }
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
    if (!row || !(await canManageSpaceRow(admin, ctx, row))) {
      return emptyResponse(404);
    }
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
    if (!row || !(await canManageSpaceRow(admin, ctx, row))) {
      return emptyResponse(404);
    }
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

      try {
        return {
          ...mapped,
          price: computePackPrice(raw as never, filter),
          unavailabilityReason: packUnavailabilityReason(raw as never, filter),
        };
      } catch (error) {
        console.error("pack pricing error", { spaceId, packId: raw.id, error });
        return {
          ...mapped,
          unavailabilityReason: "dateStartEnd",
        };
      }
    });
    return jsonResponse(packs);
  }

  if (ctx.request.method === "GET" && !action) {
    if (isPublic) {
      const { data, error } = await admin
        .from("packs")
        .select("*")
        .is("deleted_at", null)
        .eq("status", PUBLISHED_STATUS);
      if (error) return emptyResponse(500);
      return jsonResponse((data ?? []).map(mapPack));
    }
    if (!ctx.session) return unauthorized();
    const venueIds = await getAccessibleVenueIds(admin, ctx);
    const packIds = await getPackIdsForVenueIds(admin, venueIds);
    const ownedQuery = admin
      .from("packs")
      .select("*")
      .eq("owner_id", ctx.session.user_id)
      .is("deleted_at", null);
    const { data: ownedPacks } = await ownedQuery;
    const idSet = new Set([
      ...(ownedPacks ?? []).map((p) => p.id as string),
      ...packIds,
    ]);
    if (idSet.size === 0) return jsonResponse([]);
    const { data, error } = await admin
      .from("packs")
      .select("*")
      .in("id", [...idSet])
      .is("deleted_at", null);
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
    if (
      !isPublic &&
      ctx.session &&
      !(await canManagePackRow(admin, ctx, data as Record<string, unknown>))
    ) {
      return emptyResponse(404);
    }
    const spaceIDs = await packSpaceIds(admin, action);
    return jsonResponse(mapPackResponse(data as Record<string, unknown>, spaceIDs));
  }

  if (ctx.request.method === "POST" && !action) {
    requireSession(ctx);
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const spaceId = body.spaceID ?? body.space_id;
    if (!spaceId) return emptyResponse(400);

    const space = await loadOwnedRow(admin, "spaces", String(spaceId));
    if (!space || !(await canManageSpaceRow(admin, ctx, space))) {
      return emptyResponse(404);
    }

    const { data: pack, error } = await admin
      .from("packs")
      .insert({
        owner_id: space.owner_id,
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
    if (!row || !(await canManagePackRow(admin, ctx, row))) {
      return emptyResponse(404);
    }
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
    if (!row || !(await canManagePackRow(admin, ctx, row))) {
      return emptyResponse(404);
    }
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

export async function handleTestimonialsRoute(
  ctx: ApiContext,
  action: string,
  isPublic: boolean,
): Promise<Response> {
  const admin = createAdminClient();
  const isAdmin = !isPublic && !!ctx.session?.roles.includes("admin");

  if (ctx.request.method === "GET" && !action) {
    let query = admin
      .from("testimonials")
      .select("*")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });
    if (!isAdmin) query = query.eq("published", true);
    const { data, error } = await query;
    if (error) return emptyResponse(500);
    return jsonResponse((data ?? []).map(mapTestimonial));
  }

  if (!isAdmin) return emptyResponse(403);

  if (ctx.request.method === "POST" && !action) {
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const insert = testimonialInsertFromBody(body);
    if (!insert) return errorResponse("Dados inválidos", 400);
    const { data, error } = await admin
      .from("testimonials")
      .insert({ ...insert, created_at: new Date().toISOString() })
      .select()
      .single();
    if (error) return emptyResponse(500);
    return jsonResponse(mapTestimonial(data), 201);
  }

  if (ctx.request.method === "POST" && action === "import/google") {
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const result = await importGoogleReviews(admin, String(body.input ?? ""));
    if ("error" in result) return errorResponse(result.error, result.status);
    return jsonResponse(result);
  }

  if (ctx.request.method === "POST" && action === "import/bulk") {
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const parsed = parseBulkTestimonials(body);
    if (!parsed) return errorResponse("Lista de testemunhos inválida", 400);
    let imported = 0;
    let skipped = parsed.invalid;
    for (const row of parsed.rows) {
      const { error } = await admin
        .from("testimonials")
        .insert({ ...row, created_at: new Date().toISOString() });
      // Unique index on (source, source_id) makes re-imports idempotent.
      if (error?.code === "23505") skipped += 1;
      else if (error) return emptyResponse(500);
      else imported += 1;
    }
    return jsonResponse({ imported, skipped, total: parsed.rows.length + parsed.invalid });
  }

  if (ctx.request.method === "PUT" && action && !action.includes("/")) {
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const update = testimonialInsertFromBody(body);
    if (!update) return errorResponse("Dados inválidos", 400);
    const { data, error } = await admin
      .from("testimonials")
      .update({ ...update, updated_at: new Date().toISOString() })
      .eq("id", action)
      .select()
      .single();
    if (error || !data) return emptyResponse(500);
    return jsonResponse(mapTestimonial(data));
  }

  if (ctx.request.method === "DELETE" && action && !action.includes("/")) {
    const { error } = await admin
      .from("testimonials")
      .delete()
      .eq("id", action);
    if (error) return emptyResponse(500);
    return emptyResponse(204);
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

    const mapProviderContact = (
      venue:
        | {
            name?: string | null;
            contact_email?: string | null;
            contact_phone_extension?: number | null;
            contact_phone_number?: number | null;
            street1?: string | null;
            street2?: string | null;
            postal_code?: string | null;
            city?: string | null;
          }
        | null
        | undefined,
    ) => {
      if (!venue) return null;
      const email = venue.contact_email ? String(venue.contact_email) : null;
      const phoneNumber =
        venue.contact_phone_number != null
          ? Number(venue.contact_phone_number)
          : null;
      // No usable contact info → let the client hide the section entirely.
      if (!email && !phoneNumber) return null;
      return {
        name: venue.name ? String(venue.name) : null,
        email,
        phoneExtension:
          venue.contact_phone_extension != null
            ? Number(venue.contact_phone_extension)
            : null,
        phoneNumber,
        street1: venue.street1 ? String(venue.street1) : null,
        street2: venue.street2 ? String(venue.street2) : null,
        postalCode: venue.postal_code ? String(venue.postal_code) : null,
        city: venue.city ? String(venue.city) : null,
      };
    };

    const VENUE_CONTACT_SELECT =
      "name, contact_email, contact_phone_extension, contact_phone_number, street1, street2, postal_code, city";

    const { data: spaceRow } = await admin
      .from("spaces")
      .select(`venues(${VENUE_CONTACT_SELECT})`)
      .eq("id", data.space_id)
      .maybeSingle();
    const provider = mapProviderContact(
      spaceRow?.venues as unknown as Parameters<typeof mapProviderContact>[0],
    );

    const { data: servicePackRows } = await admin
      .from("booking_packs")
      .select(
        `pack_id, space_id, amount, extra_ids, extra_params, packs(*), spaces(name, venues(${VENUE_CONTACT_SELECT}))`,
      )
      .eq("booking_id", action)
      .order("created_at", { ascending: true });

    // Re-derive each service pack's extras breakdown (description + value)
    // from the stored selection so the booking screens can list them.
    const serviceFilterDate = new Date(String(data.event_date));
    const serviceStart = parseGoDuration(intervalToGoDuration(data.start_at));
    const serviceEnd = parseGoDuration(intervalToGoDuration(data.end_at));
    const servicePax =
      data.num_people != null ? Number(data.num_people) : null;

    const servicePacks = (servicePackRows ?? []).map((row) => {
      const space = row.spaces as unknown as {
        name?: string;
        venues?: Parameters<typeof mapProviderContact>[0];
      } | null;
      const packRow = row.packs as unknown as Record<string, unknown> | null;
      const extraIDs = (row.extra_ids as string[] | null) ?? [];
      const extraParamsArr = (row.extra_params as
        | { id: string; hours?: number | null; pax?: number | null }[]
        | null) ?? [];

      let extras: { id: string; description: string; value: number }[] = [];
      if (packRow && extraIDs.length > 0) {
        const extraParamsMapped: Record<
          string,
          { hours?: number; pax?: number }
        > = {};
        for (const param of extraParamsArr) {
          extraParamsMapped[param.id] = {
            ...(param.hours != null ? { hours: param.hours } : {}),
            ...(param.pax != null ? { pax: param.pax } : {}),
          };
        }
        try {
          const price = computePackPrice(packRow as never, {
            date: serviceFilterDate,
            start: serviceStart,
            end: serviceEnd,
            pax: servicePax,
            extraIDs,
            extraParams: extraParamsMapped,
          });
          extras = price?.extras ?? [];
        } catch {
          extras = [];
        }
      }

      return {
        packID: String(row.pack_id),
        spaceID: row.space_id ? String(row.space_id) : null,
        packName: String(packRow?.name ?? ""),
        spaceName: String(space?.name ?? ""),
        amount: Number(row.amount ?? 0),
        extraIDs,
        extraParams: extraParamsArr,
        extras,
        provider: mapProviderContact(space?.venues),
      };
    });

    return jsonResponse({ ...mapBooking(data), provider, servicePacks });
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

    // Additional service packs (multi-pack booking): price each one with the
    // same event filter and add it to the booking total.
    type ServicePackInsert = {
      pack_id: string;
      space_id: string | null;
      amount: number;
      extra_ids: string[];
      extra_params: ReturnType<typeof parseExtraParams>;
    };
    const servicePackInserts: ServicePackInsert[] = [];
    const rawServicePacks = Array.isArray(body.servicePacks)
      ? (body.servicePacks as Record<string, unknown>[])
      : [];

    if (rawServicePacks.length > 0 && dateStr && startStr && endStr) {
      for (const rawServicePack of rawServicePacks.slice(0, MAX_LEAD_PACKS)) {
        if (typeof rawServicePack !== "object" || rawServicePack === null) {
          continue;
        }
        const servicePackId = String(rawServicePack.packID ?? "");
        if (!servicePackId || servicePackId === packId) continue;

        const { data: servicePack } = await admin
          .from("packs")
          .select("*")
          .eq("id", servicePackId)
          .is("deleted_at", null)
          .maybeSingle();
        if (!servicePack || servicePack.status !== PUBLISHED_STATUS) {
          return errorResponse("service_pack_unavailable", 409);
        }

        const serviceExtraIDs = parseExtraIDs(rawServicePack);
        const serviceExtraParams = parseExtraParams(rawServicePack);
        const serviceFilter: PriceFilter = {
          date: new Date(dateStr),
          start: parseGoDuration(startStr),
          end: parseGoDuration(endStr),
          pax: body.numPeople != null ? Number(body.numPeople) : null,
          extraIDs: serviceExtraIDs,
          extraParams: extraParamsMap(serviceExtraParams),
        };

        let servicePrice: ReturnType<typeof computePackPrice> = null;
        try {
          servicePrice = computePackPrice(servicePack as never, serviceFilter);
        } catch {
          servicePrice = null;
        }
        if (
          !servicePrice?.value ||
          packUnavailabilityReason(servicePack as never, serviceFilter)
        ) {
          return errorResponse("service_pack_unavailable", 409);
        }

        const serviceSpaceIds = await packSpaceIds(admin, servicePackId);
        servicePackInserts.push({
          pack_id: servicePackId,
          space_id: serviceSpaceIds[0] ?? null,
          amount: servicePrice.value,
          extra_ids: serviceExtraIDs,
          extra_params: serviceExtraParams,
        });
      }
    }

    const servicePacksAmount = servicePackInserts.reduce(
      (sum, servicePack) => sum + servicePack.amount,
      0,
    );

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
        const mainAmount = price?.value ?? 0;
        // The upfront percentage of the main pack applies to the whole
        // booking, including attached service packs.
        totalAmount = mainAmount + servicePacksAmount;

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

        commission = (mainAmount * Number(venue?.commission ?? 0)) / 100;
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

    if (servicePackInserts.length > 0) {
      const { error: servicePacksError } = await admin
        .from("booking_packs")
        .insert(
          servicePackInserts.map((servicePack) => ({
            booking_id: data.id,
            ...servicePack,
          })),
        );
      if (servicePacksError) {
        // The price already includes the services; a booking without the
        // attached rows would charge for services it does not record.
        console.error("booking packs insert error", servicePacksError);
        await admin.from("bookings").delete().eq("id", data.id);
        return emptyResponse(500);
      }
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

  const userRolesMatch = action.match(/^([^/]+)\/roles$/);
  if (ctx.request.method === "PATCH" && userRolesMatch) {
    if (!requireAdmin(ctx)) return emptyResponse(403);
    const userId = userRolesMatch[1];
    const body = (ctx.body ?? {}) as { roles?: unknown };
    if (!Array.isArray(body.roles)) return emptyResponse(400);
    const allowed = new Set([
      "customer",
      "vendor",
      "host",
      "admin",
      "comercial",
    ]);
    const roles = [...new Set(body.roles.map(String))].filter((role) =>
      allowed.has(role),
    );
    // "Comercial" users are admins that quote requests can be assigned to.
    if (roles.includes("comercial") && !roles.includes("admin")) {
      roles.push("admin");
    }
    const { error } = await admin
      .from("profiles")
      .update({ roles, updated_at: new Date().toISOString() })
      .eq("id", userId);
    if (error) return emptyResponse(500);
    return jsonResponse({ id: userId, roles });
  }

  const userEmailMatch = action.match(/^([^/]+)\/email$/);
  if (ctx.request.method === "PATCH" && userEmailMatch) {
    if (!requireAdmin(ctx)) return emptyResponse(403);
    const userId = userEmailMatch[1];
    const body = (ctx.body ?? {}) as { email?: unknown };
    const email = String(body.email ?? "").trim();
    if (!email || !email.includes("@")) return emptyResponse(400);
    const { error } = await admin.auth.admin.updateUserById(userId, {
      email,
      email_confirm: true,
    });
    if (error) return errorResponse("Não foi possível alterar o email", 400);
    return emptyResponse(200);
  }

  return emptyResponse(501);
}

function requireAdmin(ctx: ApiContext): boolean {
  return !!ctx.session?.roles.includes("admin");
}

async function loadQuotePackRows(
  admin: ReturnType<typeof createAdminClient>,
  quoteId: string,
) {
  const { data, error } = await admin
    .from("quote_packs")
    .select(leadPackSelect("quote_id"))
    .eq("quote_id", quoteId)
    .order("created_at", { ascending: true });
  if (error) return { error, rows: null as null };
  return {
    error: null,
    rows: (data ?? []) as unknown as Record<string, unknown>[],
  };
}

async function handleAdminLeadPackPreview(
  admin: ReturnType<typeof createAdminClient>,
  body: Record<string, unknown>,
): Promise<Response> {
  const packId = String(body.packID ?? "");
  const leadType = body.leadType === "contact" ? "contact" : "quote";
  const leadId = String(body.leadId ?? "");
  if (!packId || !leadId) return emptyResponse(400);

  const { data: pack, error: packError } = await admin
    .from("packs")
    .select(
      "*, packs_spaces(spaces(id, name, venues(id, name)))",
    )
    .eq("id", packId)
    .maybeSingle();
  if (packError) return emptyResponse(500);
  if (!pack) return emptyResponse(404);

  const { extraIDs, extraParams } = parseLeadPackExtrasBody(body);
  let filter: PriceFilter | null = null;

  if (leadType === "quote") {
    const { data: quote, error } = await admin
      .from("quote")
      .select("event_date, start_at, end_at, num_people")
      .eq("id", leadId)
      .maybeSingle();
    if (error || !quote) return emptyResponse(404);
    filter = buildPriceFilterFromQuote(quote, extraIDs, extraParams);
  }

  const { price, reason } = computeLeadPackPrice(
    pack as Record<string, unknown>,
    filter,
  );

  return jsonResponse({
    lookup: mapPackLookup(pack as Record<string, unknown>),
    pack: mapPackPreviewForAdmin(pack as Record<string, unknown>),
    price,
    priceReason: reason,
  });
}

export async function handleQuoteRoute(
  ctx: ApiContext,
  action: string,
  isPublic: boolean,
): Promise<Response> {
  const admin = createAdminClient();

  if (ctx.request.method === "POST" && !action) {
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const { packs, ...quoteFields } = body;
    const { data: quote, error } = await admin
      .from("quote")
      .insert({
        ...quoteFields,
        user_id: ctx.session?.user_id ?? null,
        created_at: new Date().toISOString(),
        status: "new",
      })
      .select("id")
      .single();
    if (error || !quote) return emptyResponse(500);

    // Event builder requests can attach the selected packs to the new lead.
    if (Array.isArray(packs)) {
      for (const rawPack of packs.slice(0, MAX_LEAD_PACKS)) {
        if (typeof rawPack !== "object" || rawPack === null) continue;
        const packBody = rawPack as Record<string, unknown>;
        const packId = String(packBody.packID ?? "");
        if (!packId) continue;
        const { error: packError } = await insertLeadPack(admin, {
          table: "quote_packs",
          parentKey: "quote_id",
          parentId: String(quote.id),
          packId,
          createdBy: ctx.session?.user_id ?? null,
          body: packBody,
        });
        if (packError) {
          console.error("quote pack insert error", packError);
        }
      }
    }

    return jsonResponse({ id: quote.id }, 201);
  }

  if (ctx.request.method === "GET" && !action && ctx.session) {
    if (!requireAdmin(ctx)) return emptyResponse(403);
    const listQuery = parseLeadListQuery(ctx);
    const { data, error } = await admin
      .from("quote")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return emptyResponse(500);
    const rows = filterLeadRows(
      (data ?? []) as Record<string, unknown>[],
      listQuery,
      ctx.session.user_id,
      "quote",
    );
    return jsonResponse(rows);
  }

  // GET /quote/:id
  if (
    ctx.request.method === "GET" &&
    action &&
    !action.includes("/")
  ) {
    if (!requireAdmin(ctx)) return emptyResponse(403);
    const { data, error } = await admin
      .from("quote")
      .select("*")
      .eq("id", action)
      .maybeSingle();
    if (error) return emptyResponse(500);
    if (!data) return emptyResponse(404);
    return jsonResponse(data);
  }

  // POST /quote/pack-preview — pack + extras + price for a lead
  if (ctx.request.method === "POST" && action === "pack-preview") {
    if (!requireAdmin(ctx)) return emptyResponse(403);
    return handleAdminLeadPackPreview(
      admin,
      (ctx.body ?? {}) as Record<string, unknown>,
    );
  }

  const packLookupMatch = action.match(/^pack-lookup\/([^/]+)$/);

  // GET /quote/pack-lookup/:packId — admin preview for associating any pack
  if (ctx.request.method === "GET" && packLookupMatch) {
    if (!requireAdmin(ctx)) return emptyResponse(403);
    const packId = packLookupMatch[1];
    const { data: pack, error } = await admin
      .from("packs")
      .select(
        "id, name, reference, deleted_at, packs_spaces(spaces(id, name, venues(id, name)))",
      )
      .eq("id", packId)
      .maybeSingle();
    if (error) return emptyResponse(500);
    if (!pack) return emptyResponse(404);
    return jsonResponse(mapPackLookup(pack as Record<string, unknown>));
  }

  const quotePacksMatch = action.match(/^([^/]+)\/packs$/);
  const quotePackDeleteMatch = action.match(/^([^/]+)\/packs\/([^/]+)$/);

  // GET /quote/:id/packs
  if (ctx.request.method === "GET" && quotePacksMatch) {
    if (!requireAdmin(ctx)) return emptyResponse(403);
    const quoteId = quotePacksMatch[1];
    const { error, rows } = await loadQuotePackRows(admin, quoteId);
    if (error) return emptyResponse(500);
    return jsonResponse((rows ?? []).map((row) => mapQuotePack(row)));
  }

  // POST /quote/:id/packs  { packID, extraIDs?, extraParams? }
  if (ctx.request.method === "POST" && quotePacksMatch) {
    if (!requireAdmin(ctx)) return emptyResponse(403);
    const quoteId = quotePacksMatch[1];
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const packId = String(body.packID ?? "");
    if (!packId) return emptyResponse(400);

    const { data, error } = await insertLeadPack(admin, {
      table: "quote_packs",
      parentKey: "quote_id",
      parentId: quoteId,
      packId,
      createdBy: ctx.session!.user_id,
      body,
    });
    if (error?.code === "limit") {
      return errorResponse(String(error.message), 409);
    }
    if (error?.code === "404") return emptyResponse(404);
    if (error) {
      if (error.code === "23505") {
        return errorResponse("Este pack já está associado ao pedido", 409);
      }
      if (isLeadPackLimitError(error)) {
        return errorResponse(
          `Um pedido pode ter no máximo ${MAX_LEAD_PACKS} packs associados`,
          409,
        );
      }
      return emptyResponse(500);
    }
    return jsonResponse(
      mapQuotePack(data! as unknown as Record<string, unknown>),
      201,
    );
  }

  // PATCH /quote/:id/packs/:packId  { status?, extraIDs?, extraParams? }
  if (ctx.request.method === "PATCH" && quotePackDeleteMatch) {
    if (!requireAdmin(ctx)) return emptyResponse(403);
    const quoteId = quotePackDeleteMatch[1];
    const packId = quotePackDeleteMatch[2];
    const body = (ctx.body ?? {}) as Record<string, unknown>;

    const { data, error } = await patchLeadPack(admin, {
      table: "quote_packs",
      parentKey: "quote_id",
      parentId: quoteId,
      packId,
      body,
    });
    if (error?.code === "400") return emptyResponse(400);
    if (error || !data) return emptyResponse(500);
    return jsonResponse(
      mapQuotePack(data as unknown as Record<string, unknown>),
    );
  }

  // DELETE /quote/:id/packs/:packId
  if (ctx.request.method === "DELETE" && quotePackDeleteMatch) {
    if (!requireAdmin(ctx)) return emptyResponse(403);
    const quoteId = quotePackDeleteMatch[1];
    const packId = quotePackDeleteMatch[2];

    const { error } = await admin
      .from("quote_packs")
      .delete()
      .eq("quote_id", quoteId)
      .eq("pack_id", packId);
    if (error) return emptyResponse(500);
    return emptyResponse(204);
  }

  // PATCH /quote/:id  { status }
  if (
    ctx.request.method === "PATCH" &&
    action &&
    !action.includes("/")
  ) {
    if (!requireAdmin(ctx)) return emptyResponse(403);
    const body = (ctx.body ?? {}) as {
      status?: string;
      qualityScore?: unknown;
      assignedAdminIds?: unknown;
    };
    const update: Record<string, unknown> = {};
    if (body.status !== undefined) {
      if (!isQuoteStatus(body.status)) return emptyResponse(400);
      update.status = body.status;
    }
    if (body.qualityScore !== undefined) {
      const score = parseQualityScore(body.qualityScore);
      if (score === undefined) return emptyResponse(400);
      update.quality_score = score;
    }
    const assignedAdminIds = parseAssignedAdminIds(body);
    if (assignedAdminIds === null) return emptyResponse(400);
    if (assignedAdminIds !== undefined) {
      if (!(await validateAssignedAdminIds(admin, assignedAdminIds))) {
        return emptyResponse(400);
      }
      update.assigned_admin_ids = assignedAdminIds;
    }
    if (Object.keys(update).length === 0) return emptyResponse(400);

    const { data, error } = await admin
      .from("quote")
      .update(update)
      .eq("id", action)
      .select()
      .maybeSingle();
    if (error || !data) return emptyResponse(500);
    return jsonResponse(data);
  }

  if (isPublic) return emptyResponse(401);
  return emptyResponse(501);
}

async function loadOwnerPremiumExpertPackIds(
  admin: ReturnType<typeof createAdminClient>,
  ownerId: string,
): Promise<{ packIds: string[]; hasPaidTier: boolean }> {
  const { data: venues } = await admin
    .from("venues")
    .select("id, subscription")
    .eq("owner_id", ownerId)
    .is("deleted_at", null);

  const paidVenueIds = (venues ?? [])
    .filter((v) => {
      const tier = mapSubscription(v.subscription);
      return tier === "premium" || tier === "expert";
    })
    .map((v) => v.id as string);

  if (paidVenueIds.length === 0) {
    return { packIds: [], hasPaidTier: false };
  }

  const { data: spaces } = await admin
    .from("spaces")
    .select("id")
    .in("venue_id", paidVenueIds)
    .is("deleted_at", null);

  const spaceIds = (spaces ?? []).map((s) => s.id as string);
  if (spaceIds.length === 0) {
    return { packIds: [], hasPaidTier: true };
  }

  const { data: packLinks } = await admin
    .from("packs_spaces")
    .select("pack_id")
    .in("space_id", spaceIds);

  const packIds = [
    ...new Set((packLinks ?? []).map((l) => l.pack_id as string)),
  ];
  return { packIds, hasPaidTier: true };
}

function mapQuotePackLinkToEventHubPack(row: Record<string, unknown>) {
  const pack = row.packs as Record<string, unknown> | undefined;
  const links = pack?.packs_spaces as
    | { spaces?: Record<string, unknown> & { venues?: Record<string, unknown> } }[]
    | undefined;
  const link = links?.[0];
  const space = link?.spaces;
  const venue = space?.venues;

  return {
    packID: String(row.pack_id),
    packName: pack ? String(pack.name ?? "") : "",
    packReference: pack ? String(pack.reference ?? "") : "",
    spaceID: space ? String(space.id ?? "") : "",
    spaceName: space ? String(space.name ?? "") : "",
    venueID: venue ? String(venue.id ?? "") : "",
    venueName: venue ? String(venue.name ?? "") : "",
    status: String(row.status ?? "suggested"),
  };
}

function emptyEventHubListResponse(page: number, pageSize: number) {
  return jsonResponse({
    data: [],
    pagination: { page, pageSize },
    totalResults: 0,
  });
}

type LeadAggregate = { spaceCount: number; decided: boolean };

async function loadLeadAssociatedAggregates(
  admin: ReturnType<typeof createAdminClient>,
  table: "quote_packs" | "contact_packs",
  parentColumn: "quote_id" | "contact_id",
  parentIds: string[],
): Promise<Map<string, LeadAggregate>> {
  const result = new Map<string, LeadAggregate>();
  if (parentIds.length === 0) return result;

  const { data, error } = await admin
    .from(table)
    .select(
      `${parentColumn}, pack_id, status, packs(packs_spaces(spaces(id)))`,
    )
    .in(parentColumn, parentIds);
  if (error) return result;

  const rowsByParent = new Map<
    string,
    { packs?: Record<string, unknown>; status?: string }[]
  >();
  for (const row of data ?? []) {
    const parentId = (row as Record<string, unknown>)[parentColumn] as string;
    const list = rowsByParent.get(parentId) ?? [];
    list.push({
      packs: row.packs as unknown as Record<string, unknown> | undefined,
      status: (row as Record<string, unknown>).status as string | undefined,
    });
    rowsByParent.set(parentId, list);
  }

  for (const parentId of parentIds) {
    const rows = rowsByParent.get(parentId) ?? [];
    result.set(parentId, {
      spaceCount: countDistinctSpacesFromQuotePackRows(rows),
      decided: rows.some((r) => r.status === "won"),
    });
  }

  return result;
}

const loadQuoteAssociatedAggregates = (
  admin: ReturnType<typeof createAdminClient>,
  quoteIds: string[],
) => loadLeadAssociatedAggregates(admin, "quote_packs", "quote_id", quoteIds);

const loadContactAssociatedAggregates = (
  admin: ReturnType<typeof createAdminClient>,
  contactIds: string[],
) =>
  loadLeadAssociatedAggregates(
    admin,
    "contact_packs",
    "contact_id",
    contactIds,
  );

export async function handleEventHubRoute(
  ctx: ApiContext,
  action: string,
): Promise<Response> {
  if (!ctx.session) return unauthorized();
  const admin = createAdminClient();
  const ownerId = ctx.session.user_id;

  const { packIds, hasPaidTier } = await loadOwnerPremiumExpertPackIds(
    admin,
    ownerId,
  );

  if (!hasPaidTier && !ctx.session.roles.includes("admin")) {
    return emptyResponse(403);
  }

  const page = Math.max(parseInt(ctx.query.get("page") ?? "1", 10), 1);
  const pageSize = Math.min(
    Math.max(parseInt(ctx.query.get("page_size") ?? "20", 10), 1),
    100,
  );
  const statusFilter = ctx.query.get("status");

  const quoteDetailMatch = action.match(/^quote\/([^/]+)$/);
  const contactDetailMatch = action.match(/^contact\/([^/]+)$/);

  async function eventHubDetail(
    leadType: "quote" | "contact",
    leadId: string,
  ): Promise<Response> {
    if (packIds.length === 0) return emptyResponse(404);

    const packTable = leadType === "quote" ? "quote_packs" : "contact_packs";
    const parentColumn = leadType === "quote" ? "quote_id" : "contact_id";
    const leadTable = leadType === "quote" ? "quote" : "contact_request";

    const { data: associations, error: assocError } = await admin
      .from(packTable)
      .select(
        `${parentColumn}, pack_id, status, packs(id, name, reference, packs_spaces(spaces(id, name, venues(id, name))))`,
      )
      .eq(parentColumn, leadId)
      .in("pack_id", packIds);
    if (assocError) return emptyResponse(500);
    if (!associations?.length) return emptyResponse(404);

    const matched = associations.map((row) =>
      mapQuotePackLinkToEventHubPack(row),
    );

    const { data: allAssociations, error: allAssocError } = await admin
      .from(packTable)
      .select(`${parentColumn}, pack_id, status, packs(packs_spaces(spaces(id)))`)
      .eq(parentColumn, leadId);
    if (allAssocError) return emptyResponse(500);

    const associatedSpaceCount = countDistinctSpacesFromQuotePackRows(
      (allAssociations ?? []).map((row) => ({
        packs: row.packs as unknown as Record<string, unknown> | undefined,
      })),
    );
    const decided = (allAssociations ?? []).some(
      (row) => (row as Record<string, unknown>).status === "won",
    );

    const { data: lead, error } = await admin
      .from(leadTable)
      .select("*")
      .eq("id", leadId)
      .maybeSingle();
    if (error || !lead) return emptyResponse(404);

    return jsonResponse(
      leadType === "quote"
        ? mapEventHubQuoteLead(lead, matched, associatedSpaceCount, decided)
        : mapEventHubContactLead(lead, matched, associatedSpaceCount, decided),
    );
  }

  if (ctx.request.method === "GET" && quoteDetailMatch) {
    return eventHubDetail("quote", quoteDetailMatch[1]);
  }

  if (ctx.request.method === "GET" && contactDetailMatch) {
    return eventHubDetail("contact", contactDetailMatch[1]);
  }

  // GET /event-hub — list (quotes + contacts, merged by created_at)
  if (ctx.request.method === "GET" && !action) {
    if (packIds.length === 0) {
      return emptyEventHubListResponse(page, pageSize);
    }

    const { data: quoteAssociations, error: quoteAssocError } = await admin
      .from("quote_packs")
      .select(
        "quote_id, pack_id, status, packs(id, name, reference, packs_spaces(spaces(id, name, venues(id, name))))",
      )
      .in("pack_id", packIds);
    if (quoteAssocError) return emptyResponse(500);

    const { data: contactAssociations, error: contactAssocError } =
      await admin
        .from("contact_packs")
        .select(
          "contact_id, pack_id, status, packs(id, name, reference, packs_spaces(spaces(id, name, venues(id, name))))",
        )
        .in("pack_id", packIds);
    if (contactAssocError) return emptyResponse(500);

    const byQuote = new Map<
      string,
      ReturnType<typeof mapQuotePackLinkToEventHubPack>[]
    >();
    for (const row of quoteAssociations ?? []) {
      const quoteId = row.quote_id as string;
      const pack = mapQuotePackLinkToEventHubPack(row);
      const list = byQuote.get(quoteId) ?? [];
      list.push(pack);
      byQuote.set(quoteId, list);
    }

    const byContact = new Map<
      string,
      ReturnType<typeof mapQuotePackLinkToEventHubPack>[]
    >();
    for (const row of contactAssociations ?? []) {
      const contactId = row.contact_id as string;
      const pack = mapQuotePackLinkToEventHubPack(row);
      const list = byContact.get(contactId) ?? [];
      list.push(pack);
      byContact.set(contactId, list);
    }

    const quoteIds = [...byQuote.keys()];
    const contactIds = [...byContact.keys()];

    if (quoteIds.length === 0 && contactIds.length === 0) {
      return emptyEventHubListResponse(page, pageSize);
    }

    type LeadRef = {
      leadType: "quote" | "contact";
      id: string;
      createdAt: string;
      status: string;
    };
    const refs: LeadRef[] = [];

    if (quoteIds.length > 0) {
      let q = admin
        .from("quote")
        .select("id, created_at, status")
        .in("id", quoteIds);
      if (statusFilter && isQuoteStatus(statusFilter)) {
        q = q.eq("status", statusFilter);
      }
      const { data } = await q;
      for (const row of data ?? []) {
        refs.push({
          leadType: "quote",
          id: row.id as string,
          createdAt: row.created_at as string,
          status: row.status as string,
        });
      }
    }

    if (contactIds.length > 0) {
      let q = admin
        .from("contact_request")
        .select("id, created_at, status")
        .in("id", contactIds);
      if (statusFilter && isQuoteStatus(statusFilter)) {
        q = q.eq("status", statusFilter);
      }
      const { data } = await q;
      for (const row of data ?? []) {
        refs.push({
          leadType: "contact",
          id: row.id as string,
          createdAt: row.created_at as string,
          status: row.status as string,
        });
      }
    }

    refs.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const totalResults = refs.length;
    const from = (page - 1) * pageSize;
    const pageRefs = refs.slice(from, from + pageSize);

    const pageQuoteIds = pageRefs
      .filter((r) => r.leadType === "quote")
      .map((r) => r.id);
    const pageContactIds = pageRefs
      .filter((r) => r.leadType === "contact")
      .map((r) => r.id);

    const quoteAggregates = await loadQuoteAssociatedAggregates(
      admin,
      pageQuoteIds,
    );
    const contactAggregates = await loadContactAssociatedAggregates(
      admin,
      pageContactIds,
    );

    const quotesById = new Map<string, Record<string, unknown>>();
    if (pageQuoteIds.length > 0) {
      const { data: quotes } = await admin
        .from("quote")
        .select("*")
        .in("id", pageQuoteIds);
      for (const q of quotes ?? []) {
        quotesById.set(q.id as string, q);
      }
    }

    const contactsById = new Map<string, Record<string, unknown>>();
    if (pageContactIds.length > 0) {
      const { data: contacts } = await admin
        .from("contact_request")
        .select("*")
        .in("id", pageContactIds);
      for (const c of contacts ?? []) {
        contactsById.set(c.id as string, c);
      }
    }

    const data: Record<string, unknown>[] = [];
    for (const ref of pageRefs) {
      if (ref.leadType === "quote") {
        const quote = quotesById.get(ref.id);
        if (!quote) continue;
        const agg = quoteAggregates.get(ref.id);
        data.push(
          mapEventHubQuoteLead(
            quote,
            byQuote.get(ref.id) ?? [],
            agg?.spaceCount ?? 0,
            agg?.decided ?? false,
          ) as Record<string, unknown>,
        );
        continue;
      }
      const contact = contactsById.get(ref.id);
      if (!contact) continue;
      const agg = contactAggregates.get(ref.id);
      data.push(
        mapEventHubContactLead(
          contact,
          byContact.get(ref.id) ?? [],
          agg?.spaceCount ?? 0,
          agg?.decided ?? false,
        ) as Record<string, unknown>,
      );
    }

    return jsonResponse({
      data,
      pagination: { page, pageSize },
      totalResults,
    });
  }

  return emptyResponse(501);
}

async function loadContactPackRows(
  admin: ReturnType<typeof createAdminClient>,
  contactId: string,
) {
  const { data, error } = await admin
    .from("contact_packs")
    .select(leadPackSelect("contact_id"))
    .eq("contact_id", contactId)
    .order("created_at", { ascending: true });
  if (error) return { error, rows: null as null };
  return {
    error: null,
    rows: (data ?? []) as unknown as Record<string, unknown>[],
  };
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
      status: "new",
    });
    if (error) return emptyResponse(500);
    return emptyResponse(201);
  }

  if (ctx.request.method === "GET" && !action && ctx.session) {
    if (!requireAdmin(ctx)) return emptyResponse(403);
    const listQuery = parseLeadListQuery(ctx);
    const { data, error } = await admin
      .from("contact_request")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return emptyResponse(500);
    const rows = filterLeadRows(
      (data ?? []) as Record<string, unknown>[],
      listQuery,
      ctx.session.user_id,
      "contact",
    );
    return jsonResponse(rows);
  }

  const contactPacksMatch = action.match(/^([^/]+)\/packs$/);
  const contactPackDeleteMatch = action.match(/^([^/]+)\/packs\/([^/]+)$/);

  // GET /contact/:id/packs
  if (ctx.request.method === "GET" && contactPacksMatch) {
    if (!requireAdmin(ctx)) return emptyResponse(403);
    const contactId = contactPacksMatch[1];
    const { error, rows } = await loadContactPackRows(admin, contactId);
    if (error) return emptyResponse(500);
    return jsonResponse((rows ?? []).map((row) => mapContactPack(row)));
  }

  // POST /contact/:id/packs  { packID, extraIDs?, extraParams? }
  if (ctx.request.method === "POST" && contactPacksMatch) {
    if (!requireAdmin(ctx)) return emptyResponse(403);
    const contactId = contactPacksMatch[1];
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const packId = String(body.packID ?? "");
    if (!packId) return emptyResponse(400);

    const { data, error } = await insertLeadPack(admin, {
      table: "contact_packs",
      parentKey: "contact_id",
      parentId: contactId,
      packId,
      createdBy: ctx.session!.user_id,
      body,
    });
    if (error?.code === "limit") {
      return errorResponse(String(error.message), 409);
    }
    if (error?.code === "404") return emptyResponse(404);
    if (error) {
      if (error.code === "23505") {
        return errorResponse("Este pack já está associado ao pedido", 409);
      }
      if (isLeadPackLimitError(error)) {
        return errorResponse(
          `Um pedido pode ter no máximo ${MAX_LEAD_PACKS} packs associados`,
          409,
        );
      }
      return emptyResponse(500);
    }
    return jsonResponse(
      mapContactPack(data! as unknown as Record<string, unknown>),
      201,
    );
  }

  // PATCH /contact/:id/packs/:packId  { status?, extraIDs?, extraParams? }
  if (ctx.request.method === "PATCH" && contactPackDeleteMatch) {
    if (!requireAdmin(ctx)) return emptyResponse(403);
    const contactId = contactPackDeleteMatch[1];
    const packId = contactPackDeleteMatch[2];
    const body = (ctx.body ?? {}) as Record<string, unknown>;

    const { data, error } = await patchLeadPack(admin, {
      table: "contact_packs",
      parentKey: "contact_id",
      parentId: contactId,
      packId,
      body,
    });
    if (error?.code === "400") return emptyResponse(400);
    if (error || !data) return emptyResponse(500);
    return jsonResponse(
      mapContactPack(data as unknown as Record<string, unknown>),
    );
  }

  // DELETE /contact/:id/packs/:packId
  if (ctx.request.method === "DELETE" && contactPackDeleteMatch) {
    if (!requireAdmin(ctx)) return emptyResponse(403);
    const contactId = contactPackDeleteMatch[1];
    const packId = contactPackDeleteMatch[2];

    const { error } = await admin
      .from("contact_packs")
      .delete()
      .eq("contact_id", contactId)
      .eq("pack_id", packId);
    if (error) return emptyResponse(500);
    return emptyResponse(204);
  }

  // PATCH /contact/:id  { status, qualityScore }
  if (
    ctx.request.method === "PATCH" &&
    action &&
    !action.includes("/")
  ) {
    if (!requireAdmin(ctx)) return emptyResponse(403);
    const body = (ctx.body ?? {}) as {
      status?: string;
      qualityScore?: unknown;
      assignedAdminIds?: unknown;
    };
    const update: Record<string, unknown> = {};
    if (body.status !== undefined) {
      if (!isQuoteStatus(body.status)) return emptyResponse(400);
      update.status = body.status;
    }
    if (body.qualityScore !== undefined) {
      const score = parseQualityScore(body.qualityScore);
      if (score === undefined) return emptyResponse(400);
      update.quality_score = score;
    }
    const assignedAdminIds = parseAssignedAdminIds(body);
    if (assignedAdminIds === null) return emptyResponse(400);
    if (assignedAdminIds !== undefined) {
      if (!(await validateAssignedAdminIds(admin, assignedAdminIds))) {
        return emptyResponse(400);
      }
      update.assigned_admin_ids = assignedAdminIds;
    }
    if (Object.keys(update).length === 0) return emptyResponse(400);

    const { data, error } = await admin
      .from("contact_request")
      .update(update)
      .eq("id", action)
      .select()
      .maybeSingle();
    if (error || !data) return emptyResponse(500);
    return jsonResponse(data);
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

// Resolves the subscription tier ('premium' | 'expert') of the venue that owns
// a given space, so a highlight can be tagged with it. Returns null for basic.
async function resolveHighlightPlan(
  admin: ReturnType<typeof createAdminClient>,
  spaceId: unknown,
): Promise<string | null> {
  if (!spaceId) return null;
  const { data } = await admin
    .from("spaces")
    .select("venues!inner(subscription)")
    .eq("id", String(spaceId))
    .maybeSingle();
  const venues = data?.venues as
    | { subscription?: unknown }
    | { subscription?: unknown }[]
    | undefined;
  const venue = Array.isArray(venues) ? venues[0] : venues;
  const plan = mapSubscription(venue?.subscription);
  return plan === "premium" || plan === "expert" ? plan : null;
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
    const plan =
      body.plan !== undefined
        ? (body.plan as string | null) || null
        : await resolveHighlightPlan(admin, body.spaceID);
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
        plan,
      })
      .select()
      .single();
    if (error) return emptyResponse(500);
    return jsonResponse(mapHighlight(data), 201);
  }

  if (ctx.request.method === "PUT" && action && !action.includes("/")) {
    if (!ctx.session?.roles.includes("admin")) return emptyResponse(403);
    const body = (ctx.body ?? {}) as Record<string, unknown>;
    const plan =
      body.plan !== undefined
        ? (body.plan as string | null) || null
        : await resolveHighlightPlan(admin, body.spaceID);
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
        plan,
      })
      .eq("id", action)
      .select()
      .single();
    if (error || !data) return emptyResponse(500);
    return jsonResponse(mapHighlight(data));
  }

  return emptyResponse(501);
}

// --- Subscriptions -------------------------------------------------------

const PLAN_LIMITS: Record<
  SubscriptionPlan,
  { offer: number; home: number; lockMonths: number }
> = {
  premium: { offer: 1, home: 0, lockMonths: 3 },
  expert: { offer: 3, home: 1, lockMonths: 1 },
};

const SEARCH_PRIORITY: Record<SubscriptionPlan, number> = {
  premium: 50,
  expert: 100,
};
const HOME_PRIORITY = 100;

function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

function addMonthsISODate(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

function isLocked(lockedUntil: unknown): boolean {
  if (!lockedUntil) return false;
  return String(lockedUntil).slice(0, 10) > todayISODate();
}

async function loadActiveSubscriptionForVenue(
  admin: ReturnType<typeof createAdminClient>,
  venueId: string,
) {
  const { data } = await admin
    .from("subscriptions")
    .select("*")
    .eq("venue_id", venueId)
    .neq("status", "canceled")
    .maybeSingle();
  return data;
}

export async function handleSubscriptionsRoute(
  ctx: ApiContext,
  action: string,
): Promise<Response> {
  if (!ctx.session) return unauthorized();
  const admin = createAdminClient();
  const ownerId = ctx.session.user_id;

  // GET /subscriptions — admin list of all subscriptions
  if (ctx.request.method === "GET" && !action) {
    if (!ctx.session.roles.includes("admin")) return emptyResponse(403);

    const { data, error } = await admin
      .from("subscriptions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return emptyResponse(500);

    const rows = data ?? [];
    const venueIds = [...new Set(rows.map((r) => r.venue_id as string))];
    const ownerIds = [...new Set(rows.map((r) => r.owner_id as string))];

    const { data: venues } = venueIds.length
      ? await admin
          .from("venues")
          .select("id, name, reference, subscription")
          .in("id", venueIds)
      : { data: [] };

    const venueById = new Map(
      (venues ?? []).map((v) => [v.id as string, v]),
    );

    const ownerEmails = new Map<string, string>();
    await Promise.all(
      ownerIds.map(async (id) => {
        const { data: userData } = await admin.auth.admin.getUserById(id);
        if (userData?.user?.email) ownerEmails.set(id, userData.user.email);
      }),
    );

    return jsonResponse(
      rows.map((row) => {
        const venue = venueById.get(row.venue_id as string);
        return {
          ...mapSubscriptionRow(row),
          venueName: venue?.name ?? "",
          venueReference: venue?.reference ?? "",
          ownerEmail: ownerEmails.get(row.owner_id as string) ?? "",
        };
      }),
    );
  }

  // GET /subscriptions/venue/:venueID -> current subscription (or null)
  if (ctx.request.method === "GET" && action.startsWith("venue/")) {
    const venueId = action.replace("venue/", "");
    const sub = await loadActiveSubscriptionForVenue(admin, venueId);
    if (!sub) return jsonResponse(null);
    if (sub.owner_id !== ownerId && !ctx.session.roles.includes("admin")) {
      return emptyResponse(403);
    }
    return jsonResponse(mapSubscriptionRow(sub));
  }

  // GET /subscriptions/featured/venue/:venueID
  if (ctx.request.method === "GET" && action.startsWith("featured/venue/")) {
    const venueId = action.replace("featured/venue/", "");
    const sub = await loadActiveSubscriptionForVenue(admin, venueId);
    if (!sub) return jsonResponse([]);
    const { data } = await admin
      .from("highlights")
      .select("id, space_id, mode, locked_until, priority")
      .eq("subscription_id", sub.id)
      .is("deleted_at", null);
    return jsonResponse(
      (data ?? []).map((h) => ({
        id: h.id,
        spaceID: h.space_id,
        mode: h.mode,
        lockedUntil: h.locked_until ? String(h.locked_until).slice(0, 10) : null,
        priority: h.priority,
      })),
    );
  }

  // POST /subscriptions/checkout  { venueID, plan, interval }
  if (ctx.request.method === "POST" && action === "checkout") {
    const body = (ctx.body ?? {}) as {
      venueID?: string;
      plan?: string;
      interval?: string;
    };
    const venueId = body.venueID;
    const plan = body.plan as SubscriptionPlan;
    const interval = (body.interval as SubscriptionInterval) || "month";

    if (!venueId || (plan !== "premium" && plan !== "expert")) {
      return emptyResponse(400);
    }
    if (interval !== "month" && interval !== "year") {
      return emptyResponse(400);
    }

    const { data: venue } = await admin
      .from("venues")
      .select("id, owner_id")
      .eq("id", venueId)
      .maybeSingle();
    if (!venue) return emptyResponse(404);
    if (venue.owner_id !== ownerId) return emptyResponse(403);

    // Reuse an existing Stripe customer for this owner if we have one.
    const { data: existingCustomer } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("owner_id", ownerId)
      .not("stripe_customer_id", "is", null)
      .limit(1)
      .maybeSingle();

    try {
      const { clientSecret } = await createSubscriptionCheckoutSession({
        venueId,
        ownerId,
        plan,
        interval,
        customerEmail: ctx.session.email,
        customerId: existingCustomer?.stripe_customer_id ?? undefined,
      });
      return jsonResponse({ clientSecret });
    } catch (err) {
      console.error("subscription checkout error", err);
      return emptyResponse(500);
    }
  }

  // POST /subscriptions/portal  { venueID }
  if (ctx.request.method === "POST" && action === "portal") {
    const body = (ctx.body ?? {}) as { venueID?: string };
    if (!body.venueID) return emptyResponse(400);
    const sub = await loadActiveSubscriptionForVenue(admin, body.venueID);
    if (!sub) return emptyResponse(404);
    if (sub.owner_id !== ownerId) return emptyResponse(403);
    if (!sub.stripe_customer_id) return emptyResponse(400);
    try {
      const { url } = await createBillingPortalSession({
        customerId: sub.stripe_customer_id as string,
      });
      return jsonResponse({ url });
    } catch (err) {
      console.error("billing portal error", err);
      return emptyResponse(500);
    }
  }

  // POST /subscriptions/featured  { venueID, spaceIDs[], homeSpaceID? }
  if (ctx.request.method === "POST" && action === "featured") {
    const body = (ctx.body ?? {}) as {
      venueID?: string;
      spaceIDs?: string[];
      homeSpaceID?: string | null;
    };
    const venueId = body.venueID;
    if (!venueId) return emptyResponse(400);

    const sub = await loadActiveSubscriptionForVenue(admin, venueId);
    if (!sub) return emptyResponse(404);
    if (sub.owner_id !== ownerId) return emptyResponse(403);
    if (sub.status !== "active") {
      return errorResponse("Subscription is not active", 400);
    }

    const plan = sub.plan as SubscriptionPlan;
    const limits = PLAN_LIMITS[plan];
    const desiredSpaceIds = Array.from(
      new Set((body.spaceIDs ?? []).filter(Boolean)),
    );

    if (desiredSpaceIds.length > limits.offer) {
      return errorResponse(
        `O plano ${plan} permite no máximo ${limits.offer} espaço(s) em destaque`,
        400,
      );
    }

    const homeSpaceId =
      limits.home > 0 && body.homeSpaceID ? body.homeSpaceID : null;
    if (homeSpaceId && !desiredSpaceIds.includes(homeSpaceId)) {
      return errorResponse(
        "O espaço da Página Inicial tem de estar entre os espaços em destaque",
        400,
      );
    }

    // Validate the spaces belong to this venue.
    if (desiredSpaceIds.length > 0) {
      const { data: spaces } = await admin
        .from("spaces")
        .select("id")
        .eq("venue_id", venueId)
        .in("id", desiredSpaceIds)
        .is("deleted_at", null);
      const validIds = new Set((spaces ?? []).map((s) => s.id as string));
      if (validIds.size !== desiredSpaceIds.length) {
        return errorResponse("Espaço inválido para esta venue", 400);
      }
    }

    // Load current featured highlights for this subscription.
    const { data: current } = await admin
      .from("highlights")
      .select("id, space_id, mode, locked_until")
      .eq("subscription_id", sub.id)
      .is("deleted_at", null);
    const currentRows = current ?? [];

    const reconcileMode = async (
      mode: "search" | "home",
      desired: string[],
      priority: number,
    ): Promise<Response | null> => {
      const rows = currentRows.filter((r) => r.mode === mode);
      const currentIds = new Set(rows.map((r) => r.space_id as string));
      const desiredSet = new Set(desired);

      // Spaces being removed must not be locked.
      for (const row of rows) {
        if (
          !desiredSet.has(row.space_id as string) &&
          isLocked(row.locked_until)
        ) {
          return errorResponse(
            `Um dos espaços em destaque ainda está bloqueado até ${String(
              row.locked_until,
            ).slice(0, 10)}`,
            409,
          );
        }
      }

      // Soft-delete removed.
      const toRemove = rows.filter(
        (r) => !desiredSet.has(r.space_id as string),
      );
      for (const row of toRemove) {
        await admin
          .from("highlights")
          .update({ deleted_at: new Date().toISOString() })
          .eq("id", row.id);
      }

      // Insert added (re-locks for the plan's lock period).
      const toAdd = desired.filter((id) => !currentIds.has(id));
      for (const spaceId of toAdd) {
        await admin.from("highlights").insert({
          created_at: new Date().toISOString(),
          space_id: spaceId,
          subscription_id: sub.id,
          from_date: todayISODate(),
          to_date: sub.current_period_end
            ? String(sub.current_period_end).slice(0, 10)
            : addMonthsISODate(12),
        priority,
        mode,
        recommended: true,
        plan,
        locked_until: addMonthsISODate(limits.lockMonths),
      });
      }
      return null;
    };

    const searchError = await reconcileMode(
      "search",
      desiredSpaceIds,
      SEARCH_PRIORITY[plan],
    );
    if (searchError) return searchError;

    if (limits.home > 0) {
      const homeError = await reconcileMode(
        "home",
        homeSpaceId ? [homeSpaceId] : [],
        HOME_PRIORITY,
      );
      if (homeError) return homeError;
    }

    const { data: updated } = await admin
      .from("highlights")
      .select("id, space_id, mode, locked_until, priority")
      .eq("subscription_id", sub.id)
      .is("deleted_at", null);
    return jsonResponse(
      (updated ?? []).map((h) => ({
        id: h.id,
        spaceID: h.space_id,
        mode: h.mode,
        lockedUntil: h.locked_until ? String(h.locked_until).slice(0, 10) : null,
        priority: h.priority,
      })),
    );
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

  if (ctx.request.method === "DELETE" && action) {
    if (!ctx.session) return unauthorized();

    const { data, error } = await admin
      .from("photos")
      .select("*")
      .eq("id", action)
      .maybeSingle();
    if (error || !data) return emptyResponse(404);
    if (data.owner_id !== ctx.session.user_id) return emptyResponse(403);

    const { error: deleteError } = await admin
      .from("photos")
      .delete()
      .eq("id", action);
    if (deleteError) return emptyResponse(500);

    return emptyResponse(204);
  }

  return emptyResponse(501);
}

const ATTACHMENTS_BUCKET = "attachments";
const MAX_ATTACHMENT_BYTES = 20 * 1024 * 1024;

function attachmentExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? (parts.pop()?.toLowerCase() ?? "") : "";
}

function storagePathFromAttachmentUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${ATTACHMENTS_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length));
}

export async function handleAttachmentsRoute(
  ctx: ApiContext,
  action: string,
): Promise<Response> {
  const admin = createAdminClient();

  if (ctx.request.method === "GET" && action) {
    const { data, error } = await admin
      .from("attachments")
      .select("*")
      .eq("id", action)
      .maybeSingle();
    if (error || !data) return emptyResponse(404);
    return jsonResponse(mapAttachment(data));
  }

  if (ctx.request.method === "POST" && action === "list") {
    const body = (ctx.body ?? {}) as { ids?: string[] };
    const ids = body.ids ?? [];
    if (ids.length === 0) return jsonResponse([]);
    const { data, error } = await admin
      .from("attachments")
      .select("*")
      .in("id", ids);
    if (error) return emptyResponse(500);
    const byId = new Map(
      (data ?? []).map((row) => [row.id as string, mapAttachment(row)]),
    );
    return jsonResponse(ids.map((id) => byId.get(id)).filter(Boolean));
  }

  if (ctx.request.method === "GET" && !action) {
    const ids = ctx.query.getAll("id");
    if (ids.length === 0) return jsonResponse([]);
    const { data, error } = await admin
      .from("attachments")
      .select("*")
      .in("id", ids);
    if (error) return emptyResponse(500);
    return jsonResponse((data ?? []).map(mapAttachment));
  }

  if (ctx.request.method === "POST" && !action) {
    if (!ctx.session) return unauthorized();

    const file = ctx.form?.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return emptyResponse(400);
    }
    if (file.size > MAX_ATTACHMENT_BYTES) {
      return emptyResponse(413);
    }

    const id = crypto.randomUUID();
    const ext = attachmentExtension(file.name);
    const path = `${ctx.session.user_id}/${id}${ext ? `.${ext}` : ""}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await admin.storage
      .from(ATTACHMENTS_BUCKET)
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (uploadError) {
      console.error("attachment upload error", uploadError);
      return emptyResponse(500);
    }

    const { data: publicUrl } = admin.storage
      .from(ATTACHMENTS_BUCKET)
      .getPublicUrl(path);

    const row = {
      id,
      owner_id: ctx.session.user_id,
      created_at: new Date().toISOString(),
      url: publicUrl.publicUrl,
      extension: ext,
      filename: file.name,
    };

    const { data, error } = await admin
      .from("attachments")
      .insert(row)
      .select()
      .single();
    if (error) {
      console.error("attachment insert error", error);
      await admin.storage.from(ATTACHMENTS_BUCKET).remove([path]);
      return emptyResponse(500);
    }

    return jsonResponse(mapAttachment(data), 201);
  }

  if (ctx.request.method === "DELETE" && action) {
    if (!ctx.session) return unauthorized();

    const { data, error } = await admin
      .from("attachments")
      .select("*")
      .eq("id", action)
      .maybeSingle();
    if (error || !data) return emptyResponse(404);
    if (data.owner_id !== ctx.session.user_id) return emptyResponse(403);

    const storagePath = storagePathFromAttachmentUrl(String(data.url));
    if (storagePath) {
      await admin.storage.from(ATTACHMENTS_BUCKET).remove([storagePath]);
    }

    const { error: deleteError } = await admin
      .from("attachments")
      .delete()
      .eq("id", action);
    if (deleteError) return emptyResponse(500);

    return emptyResponse(204);
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
