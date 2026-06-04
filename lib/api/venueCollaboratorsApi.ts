import type { ApiContext } from "@lib/api/context";
import { errorResponse, emptyResponse } from "@lib/api/context";
import { isPaidVenueTier, isVenueOwner } from "@lib/api/venueAccess";
import type { createAdminClient } from "@lib/db";

type AdminClient = ReturnType<typeof createAdminClient>;

export type ProfileByEmailRow = {
  id: string;
  email: string;
  name: string;
};

export async function findProfileByEmail(
  admin: AdminClient,
  email: string,
): Promise<ProfileByEmailRow | null> {
  const { data, error } = await admin.rpc("find_profile_by_email", {
    p_email: email,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : null;
  if (!row?.id) return null;
  const { data: userData } = await admin.auth.admin.getUserById(row.id);
  return {
    id: row.id,
    email: userData?.user?.email ?? email,
    name: row.name ?? "",
  };
}

export async function mapVenueCollaboratorRows(
  admin: AdminClient,
  rows: Record<string, unknown>[],
) {
  const mapped = await Promise.all(
    rows.map(async (row) => {
      const userId = String(row.user_id);
      const { data: userData } = await admin.auth.admin.getUserById(userId);
      return {
        id: String(row.id),
        venueID: String(row.venue_id),
        userID: userId,
        email: userData?.user?.email ?? "",
        name: "",
        createdAt: row.created_at ? String(row.created_at) : null,
      };
    }),
  );

  const userIds = mapped.map((m) => m.userID);
  if (userIds.length === 0) return mapped;

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, name")
    .in("id", userIds);

  const names = new Map(
    (profiles ?? []).map((p) => [p.id as string, (p.name as string) ?? ""]),
  );

  return mapped.map((m) => ({
    ...m,
    name: names.get(m.userID) ?? m.name,
  }));
}

export async function requireOwnerPaidVenueForCollaborators(
  admin: AdminClient,
  ctx: ApiContext,
  venueId: string,
  venue: Record<string, unknown> | null,
): Promise<Response | null> {
  if (!(await isVenueOwner(admin, ctx, venueId))) {
    return emptyResponse(403);
  }
  if (!venue || !isPaidVenueTier(venue.subscription)) {
    return errorResponse(
      "Colaboradores só estão disponíveis em locais Premium ou Expert",
      400,
    );
  }
  return null;
}

export function validateCollaboratorCandidate(
  ctx: ApiContext,
  profile: ProfileByEmailRow,
  venueOwnerId: string,
): Response | null {
  if (profile.id === ctx.session!.user_id) {
    return errorResponse("Não pode adicionar-se a si próprio", 400);
  }
  if (profile.id === venueOwnerId) {
    return errorResponse("O proprietário do local já tem acesso total", 400);
  }
  return null;
}
