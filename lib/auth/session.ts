import type { Session } from "@supabase/supabase-js";
import { createAdminClient } from "@lib/db";
import { createSupabaseServerClient } from "@lib/supabase/server";

export type Role = "customer" | "vendor" | "admin" | "comercial";

export type ApiSession = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  roles: Role[];
  token: string;
  expiry: string;
  profileComplete: boolean;
  photoURL: string | null;
};

export async function getProfile(userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, name, roles, kind, date_of_birth, photo_url")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function buildApiSession(
  session: Session,
): Promise<ApiSession | null> {
  if (!session.user?.id || !session.access_token) return null;

  const profile = await getProfile(session.user.id);
  const roles = (profile?.roles ?? ["customer"]) as Role[];

  // OAuth sign-ups may have an empty kind until complete-profile runs.
  // Admins are exempt — they are granted server-side and must not be forced
  // through the registration modal (which would overwrite roles).
  const profileComplete = isProfileComplete(profile, roles);

  return {
    id: session.user.id,
    user_id: session.user.id,
    name: profile?.name ?? session.user.user_metadata?.name ?? "",
    email: session.user.email ?? "",
    roles,
    token: session.access_token,
    expiry: new Date(session.expires_at! * 1000).toISOString(),
    profileComplete,
    photoURL: (profile?.photo_url as string | null | undefined) ?? null,
  };
}

export async function getServerApiSession(): Promise<ApiSession | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  return buildApiSession(data.session);
}

export function hasRole(roles: Role[] | string[] | null | undefined, role: Role) {
  return (roles ?? []).includes(role);
}

export function isAdmin(roles: Role[] | string[] | null | undefined) {
  return hasRole(roles, "admin");
}

export function isProfileComplete(
  profile: { kind?: string | null } | null | undefined,
  roles: Role[] | string[] | null | undefined,
): boolean {
  return !!profile?.kind || isAdmin(roles);
}

/** Set customer/vendor from kind; never drop privileged roles (e.g. admin). */
export function mergeProfileRoles(
  currentRoles: Role[] | string[] | null | undefined,
  kind: string,
): Role[] {
  const base: Role = kind === "vendor" ? "vendor" : "customer";
  const preserved = (currentRoles ?? []).filter(
    (r): r is Role => r === "admin",
  );
  return [...new Set<Role>([base, ...preserved])];
}
