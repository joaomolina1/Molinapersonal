import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { requireEnvValue } from "@lib/env";

const supabaseUrl = requireEnvValue(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);
const supabaseAnonKey = requireEnvValue(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options as CookieOptions);
        });
        if (headers) {
          for (const [key, value] of Object.entries(headers)) {
            response.headers.set(key, value);
          }
        }
      },
    },
  });

  await supabase.auth.getUser();
  return response;
}
