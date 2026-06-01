import type { Session } from "@supabase/supabase-js";
import { createAdminClient } from "@lib/db";
import { createSupabaseServerClient } from "@lib/supabase/server";

export type Role = "customer" | "vendor" | "admin";

export type ApiSession = {
  id: string;
  user_id: string;
  name: string;
  email: string;
  roles: Role[];
  token: string;
  expiry: string;
};

export async function getProfile(userId: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id, name, roles, kind, date_of_birth")
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

  return {
    id: session.user.id,
    user_id: session.user.id,
    name: profile?.name ?? session.user.user_metadata?.name ?? "",
    email: session.user.email ?? "",
    roles,
    token: session.access_token,
    expiry: new Date(session.expires_at! * 1000).toISOString(),
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
