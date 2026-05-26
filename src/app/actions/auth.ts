"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

async function getOrigin() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "http";
  return `${proto}://${host}`;
}

export async function googleLoginAction() {
  const supabase = await createSupabaseServerClient();
  const origin = await getOrigin();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error || !data?.url) {
    redirect(
      `/login?error=${encodeURIComponent(error?.message ?? "Não foi possível iniciar o login com Google.")}`,
    );
  }

  redirect(data.url);
}

export async function registerAction(formData: FormData) {
  const name = getString(formData, "name");
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  if (!email || !password) {
    redirect("/register?error=Preenche+email+e+password");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: name,
      },
    },
  });

  if (error) {
    redirect(`/register?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect(
    "/login?message=Conta+criada.+Se+tiveres+confirmacao+de+email+ativa,+valida+o+email+antes+de+entrar.",
  );
}

export async function loginAction(formData: FormData) {
  const email = getString(formData, "email");
  const password = getString(formData, "password");

  if (!email || !password) {
    redirect("/login?error=Preenche+email+e+password");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login?message=Terminaste+sessao");
}
