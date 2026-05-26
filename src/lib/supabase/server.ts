import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireEnvValue } from "@/lib/env";

const supabaseUrl = requireEnvValue(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);
const supabaseAnonKey = requireEnvValue(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet, _headers) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Cookie writes can fail in some Server Component render contexts;
            // `proxy.ts` refresh still applies cookies on the next navigation.
          }
        },
      },
    },
  );
}
