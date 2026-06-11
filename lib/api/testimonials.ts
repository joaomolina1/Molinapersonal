import { optionalEnvValue } from "@lib/env";
import type { createAdminClient } from "@lib/db";

type AdminClient = ReturnType<typeof createAdminClient>;

export function googlePlacesApiKey(): string | undefined {
  return (
    optionalEnvValue(process.env.GOOGLE_PLACES_API_KEY) ??
    optionalEnvValue(process.env.GOOGLE_MAPS_API_KEY) ??
    optionalEnvValue(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY)
  );
}

export function testimonialInsertFromBody(
  body: Record<string, unknown>,
): Record<string, unknown> | null {
  const authorName = String(body.authorName ?? "").trim();
  const text = String(body.text ?? "").trim();
  if (!authorName || !text) return null;

  const rating =
    body.rating != null && body.rating !== "" ? Number(body.rating) : null;
  if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
    return null;
  }

  return {
    author_name: authorName,
    author_detail: String(body.authorDetail ?? "").trim() || null,
    text,
    rating,
    photo_url: String(body.photoURL ?? "").trim() || null,
    published: body.published === undefined ? true : Boolean(body.published),
    priority: body.priority != null ? Number(body.priority) : 0,
  };
}

const MAX_BULK_ITEMS = 500;

// Accepts both our own shape ({ authorName, text, rating }) and the raw
// Google Places review shape ({ author_name, text, rating, time }) so
// exports from scrapers can be pasted as-is.
export function parseBulkTestimonials(body: Record<string, unknown>): {
  rows: Record<string, unknown>[];
  invalid: number;
} | null {
  const items = body.items;
  if (!Array.isArray(items) || items.length === 0) return null;
  if (items.length > MAX_BULK_ITEMS) return null;

  const rows: Record<string, unknown>[] = [];
  let invalid = 0;

  for (const item of items) {
    if (typeof item !== "object" || item === null) {
      invalid += 1;
      continue;
    }
    const raw = item as Record<string, unknown>;
    const row = testimonialInsertFromBody({
      authorName: raw.authorName ?? raw.author_name ?? raw.author,
      authorDetail: raw.authorDetail ?? raw.author_detail,
      text: raw.text ?? raw.comment ?? raw.review,
      rating: raw.rating,
      photoURL: raw.photoURL ?? raw.profile_photo_url,
      published: raw.published,
      priority: raw.priority,
    });
    if (!row) {
      invalid += 1;
      continue;
    }
    row.source = String(raw.source ?? "google");
    if (raw.time != null || raw.sourceID != null) {
      row.source_id =
        raw.sourceID != null
          ? String(raw.sourceID)
          : `bulk:${String(raw.author_name ?? raw.authorName)}:${String(raw.time)}`;
    }
    rows.push(row);
  }

  return { rows, invalid };
}

type GoogleReview = {
  author_name?: string;
  rating?: number;
  text?: string;
  time?: number;
  profile_photo_url?: string;
};

async function resolvePlaceId(
  input: string,
  key: string,
): Promise<{ placeId: string | null; error?: string }> {
  const trimmed = input.trim();
  if (!trimmed) return { placeId: null, error: "Indique um Place ID ou nome" };

  // Google Place IDs ("ChIJ...", "GhIJ...", "Ei...") can be used directly.
  if (/^(ChIJ|GhIJ|Ei|E[a-z])[\w-]+$/.test(trimmed) && !trimmed.includes(" ")) {
    return { placeId: trimmed };
  }

  // Maps URLs sometimes carry the place_id as a query param.
  const urlMatch = trimmed.match(/place_id[=:]([\w-]+)/);
  if (urlMatch) return { placeId: urlMatch[1] };

  const params = new URLSearchParams({
    input: trimmed,
    inputtype: "textquery",
    fields: "place_id,name",
    language: "pt",
    key,
  });
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?${params}`,
  );
  if (!res.ok) return { placeId: null, error: "Erro a contactar a API Google" };
  const data = (await res.json()) as {
    status?: string;
    candidates?: { place_id?: string }[];
    error_message?: string;
  };
  const placeId = data.candidates?.[0]?.place_id ?? null;
  if (!placeId) {
    return {
      placeId: null,
      error: data.error_message || `Local não encontrado (${data.status})`,
    };
  }
  return { placeId };
}

export async function importGoogleReviews(
  admin: AdminClient,
  input: string,
): Promise<
  | { error: string; status: number }
  | { placeName: string; imported: number; skipped: number; total: number }
> {
  const key = googlePlacesApiKey();
  if (!key) {
    return {
      error:
        "Nenhuma chave da API Google configurada (GOOGLE_PLACES_API_KEY)",
      status: 503,
    };
  }

  const { placeId, error: resolveError } = await resolvePlaceId(input, key);
  if (!placeId) return { error: resolveError ?? "Local inválido", status: 400 };

  const params = new URLSearchParams({
    place_id: placeId,
    fields: "name,rating,user_ratings_total,reviews",
    language: "pt",
    reviews_sort: "newest",
    reviews_no_translations: "true",
    key,
  });
  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params}`,
  );
  if (!res.ok) {
    return { error: "Erro a contactar a API Google", status: 502 };
  }
  const data = (await res.json()) as {
    status?: string;
    error_message?: string;
    result?: { name?: string; reviews?: GoogleReview[] };
  };
  if (data.status !== "OK" || !data.result) {
    return {
      error: data.error_message || `Resposta inválida da API Google (${data.status})`,
      status: 502,
    };
  }

  const placeName = data.result.name ?? placeId;
  const reviews = (data.result.reviews ?? []).filter(
    (review) => review.author_name && review.text,
  );
  if (reviews.length === 0) {
    return { placeName, imported: 0, skipped: 0, total: 0 };
  }

  const sourceIds = reviews.map(
    (review) => `google:${placeId}:${review.time}:${review.author_name}`,
  );
  const { data: existing } = await admin
    .from("testimonials")
    .select("source_id")
    .in("source_id", sourceIds);
  const existingIds = new Set(
    (existing ?? []).map((row) => String(row.source_id)),
  );

  const rows = reviews
    .map((review, index) => ({ review, sourceId: sourceIds[index] }))
    .filter(({ sourceId }) => !existingIds.has(sourceId))
    .map(({ review, sourceId }) => ({
      created_at: new Date().toISOString(),
      author_name: String(review.author_name),
      author_detail: `Review Google · ${placeName}`,
      text: String(review.text),
      rating: review.rating != null ? Number(review.rating) : null,
      source: "google",
      source_id: sourceId,
      photo_url: review.profile_photo_url ?? null,
      published: true,
      priority: 0,
    }));

  if (rows.length > 0) {
    const { error } = await admin.from("testimonials").insert(rows);
    if (error) {
      return { error: "Erro ao guardar os testemunhos", status: 500 };
    }
  }

  return {
    placeName,
    imported: rows.length,
    skipped: reviews.length - rows.length,
    total: reviews.length,
  };
}
