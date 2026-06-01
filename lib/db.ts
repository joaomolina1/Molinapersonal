import { createClient } from "@supabase/supabase-js";
import { requireEnvValue } from "@lib/env";

const supabaseUrl = requireEnvValue(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);
const serviceRoleKey = requireEnvValue(
  "SUPABASE_SERVICE_ROLE_KEY",
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

/** Server-side Supabase client with service role (bypasses RLS). */
export function createAdminClient() {
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
