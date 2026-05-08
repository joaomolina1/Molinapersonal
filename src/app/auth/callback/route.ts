import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";
  const errorDesc =
    url.searchParams.get("error_description") ?? url.searchParams.get("error");

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ?? url.origin;

  if (errorDesc) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDesc)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Resposta inválida do provedor.")}`,
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  return NextResponse.redirect(
    `${origin}${next.startsWith("/") ? next : `/${next}`}`,
  );
}
