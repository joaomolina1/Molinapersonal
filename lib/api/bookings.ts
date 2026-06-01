import type { SupabaseClient } from "@supabase/supabase-js";
import { intervalToGoDuration, parseGoDuration } from "@lib/api/serialize";
import { parseExtraParamsQuery } from "@lib/extras/quantities";

const BLOCKING_STATUSES = ["inProgress", "confirmed", "cancellationRequested"];

export function alreadyBookedResponse() {
  return Response.json(
    { id: "already_booked", message: "there's a booking for that date/time" },
    { status: 400 },
  );
}

function intervalsOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return endA >= startB && startA <= endB;
}

export async function hasBookingOverlap(
  admin: SupabaseClient,
  params: {
    spaceId: string;
    eventDate: string;
    startSeconds: number;
    endSeconds: number;
    excludeId?: string;
  },
): Promise<boolean> {
  let query = admin
    .from("bookings")
    .select("id, start_at, end_at")
    .eq("space_id", params.spaceId)
    .eq("event_date", params.eventDate)
    .in("status", BLOCKING_STATUSES);

  if (params.excludeId) {
    query = query.neq("id", params.excludeId);
  }

  const { data, error } = await query;
  if (error || !data?.length) return false;

  return data.some((row) => {
    const start = parseGoDuration(intervalToGoDuration(row.start_at));
    const end = parseGoDuration(intervalToGoDuration(row.end_at));
    return intervalsOverlap(
      params.startSeconds,
      params.endSeconds,
      start,
      end,
    );
  });
}

export function bookingUpdateFromBody(
  body: Record<string, unknown>,
): Record<string, unknown> {
  const update: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
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
  return update;
}

export async function ensureProfile(
  admin: SupabaseClient,
  userId: string,
): Promise<void> {
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  if (!data) {
    await admin.from("profiles").upsert({
      id: userId,
      name: "",
      roles: ["customer"],
      created_at: new Date().toISOString(),
    });
  }
}

export function bookingPaymentAmount(row: Record<string, unknown>): number {
  const upfront = Number(row.upfront_amount ?? 0);
  if (upfront > 0) return upfront;
  return Number(row.total_amount ?? 0);
}

export function parseExtraParams(body: Record<string, unknown>) {
  if (Array.isArray(body.extraParams)) {
    return body.extraParams
      .map((item) => {
        const row = item as Record<string, unknown>;
        const id = row.id != null ? String(row.id) : "";
        if (!id) return null;
        return {
          id,
          hours: row.hours != null ? Number(row.hours) : null,
          pax: row.pax != null ? Number(row.pax) : null,
        };
      })
      .filter((item): item is { id: string; hours: number | null; pax: number | null } => !!item);
  }
  return parseExtraParamsQuery(
    typeof body.extra_params === "string" ? body.extra_params : undefined,
  );
}

export function parseExtraIDs(body: Record<string, unknown>): string[] {
  if (Array.isArray(body.extraIDs)) {
    return body.extraIDs.map(String).filter(Boolean);
  }
  if (Array.isArray(body.extras)) {
    return body.extras.map(String).filter(Boolean);
  }
  if (typeof body.extras === "string" && body.extras.trim()) {
    return body.extras.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [];
}
