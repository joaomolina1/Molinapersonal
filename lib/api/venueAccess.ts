import type { ApiContext } from "@lib/api/context";
import { mapSubscription } from "@lib/api/serialize";
import type { createAdminClient } from "@lib/db";

export type VenueAccessRole = "owner" | "collaborator";

type AdminClient = ReturnType<typeof createAdminClient>;

export function isPaidVenueTier(subscription: unknown): boolean {
  const tier = mapSubscription(subscription);
  return tier === "premium" || tier === "expert";
}

export async function loadVenueAccessRow(
  admin: AdminClient,
  venueId: string,
): Promise<{ owner_id: string; subscription: unknown } | null> {
  const { data, error } = await admin
    .from("venues")
    .select("owner_id, subscription")
    .eq("id", venueId)
    .is("deleted_at", null)
    .maybeSingle();
  if (error || !data) return null;
  return data as { owner_id: string; subscription: unknown };
}

export async function isVenueOwner(
  admin: AdminClient,
  ctx: ApiContext,
  venueId: string,
): Promise<boolean> {
  if (!ctx.session) return false;
  if (ctx.session.roles.includes("admin")) return true;
  const venue = await loadVenueAccessRow(admin, venueId);
  return venue?.owner_id === ctx.session.user_id;
}

export async function hasVenueCollaboratorAccess(
  admin: AdminClient,
  ctx: ApiContext,
  venueId: string,
): Promise<boolean> {
  if (!ctx.session) return false;
  const venue = await loadVenueAccessRow(admin, venueId);
  if (!venue || !isPaidVenueTier(venue.subscription)) return false;

  const { data } = await admin
    .from("venue_collaborators")
    .select("id")
    .eq("venue_id", venueId)
    .eq("user_id", ctx.session.user_id)
    .maybeSingle();

  return !!data;
}

export async function canManageVenueResources(
  admin: AdminClient,
  ctx: ApiContext,
  venueId: string,
): Promise<boolean> {
  if (!ctx.session) return false;
  if (ctx.session.roles.includes("admin")) return true;
  if (await isVenueOwner(admin, ctx, venueId)) return true;
  return hasVenueCollaboratorAccess(admin, ctx, venueId);
}

export async function getAccessibleVenueIds(
  admin: AdminClient,
  ctx: ApiContext,
): Promise<string[]> {
  if (!ctx.session) return [];
  if (ctx.session.roles.includes("admin")) {
    const { data } = await admin
      .from("venues")
      .select("id")
      .is("deleted_at", null);
    return (data ?? []).map((v) => v.id as string);
  }

  const userId = ctx.session.user_id;
  const ids = new Set<string>();

  const { data: owned } = await admin
    .from("venues")
    .select("id")
    .eq("owner_id", userId)
    .is("deleted_at", null);
  for (const v of owned ?? []) ids.add(v.id as string);

  const { data: collabRows } = await admin
    .from("venue_collaborators")
    .select("venue_id, venues!inner(subscription)")
    .eq("user_id", userId);

  for (const row of collabRows ?? []) {
    const venue = row.venues as { subscription?: unknown } | null;
    if (venue && isPaidVenueTier(venue.subscription)) {
      ids.add(row.venue_id as string);
    }
  }

  return [...ids];
}

export async function getPackIdsForVenueIds(
  admin: AdminClient,
  venueIds: string[],
): Promise<string[]> {
  if (venueIds.length === 0) return [];

  const { data: spaces } = await admin
    .from("spaces")
    .select("id")
    .in("venue_id", venueIds)
    .is("deleted_at", null);
  const spaceIds = (spaces ?? []).map((s) => s.id as string);
  if (spaceIds.length === 0) return [];

  const { data: links } = await admin
    .from("packs_spaces")
    .select("pack_id")
    .in("space_id", spaceIds);

  return [...new Set((links ?? []).map((l) => l.pack_id as string))];
}

export async function canManagePackRow(
  admin: AdminClient,
  ctx: ApiContext,
  row: Record<string, unknown>,
): Promise<boolean> {
  if (!ctx.session) return false;
  if (ctx.session.roles.includes("admin")) return true;
  if (row.owner_id === ctx.session.user_id) return true;

  const packId = String(row.id);
  const { data: links } = await admin
    .from("packs_spaces")
    .select("spaces(venue_id)")
    .eq("pack_id", packId);

  for (const link of links ?? []) {
    const venueId = (link.spaces as { venue_id?: string } | null)?.venue_id;
    if (venueId && (await canManageVenueResources(admin, ctx, venueId))) {
      return true;
    }
  }
  return false;
}

export async function canManageSpaceRow(
  admin: AdminClient,
  ctx: ApiContext,
  row: Record<string, unknown>,
): Promise<boolean> {
  return canManageVenueResources(admin, ctx, String(row.venue_id));
}

export async function canManageVenueRow(
  admin: AdminClient,
  ctx: ApiContext,
  row: Record<string, unknown>,
  options?: { ownerOnly?: boolean },
): Promise<boolean> {
  if (!ctx.session) return false;
  if (ctx.session.roles.includes("admin")) return true;
  if (options?.ownerOnly) {
    return row.owner_id === ctx.session.user_id;
  }
  return canManageVenueResources(admin, ctx, String(row.id));
}

export async function revokeVenueCollaborators(
  admin: AdminClient,
  venueId: string,
): Promise<void> {
  await admin.from("venue_collaborators").delete().eq("venue_id", venueId);
}

export function venueAccessRole(
  ctx: ApiContext,
  row: Record<string, unknown>,
): VenueAccessRole | null {
  if (!ctx.session) return null;
  if (ctx.session.roles.includes("admin")) return "owner";
  if (row.owner_id === ctx.session.user_id) return "owner";
  return "collaborator";
}
