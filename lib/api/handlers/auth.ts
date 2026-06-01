import type { ApiContext } from "@lib/api/context";
import {
  emptyResponse,
  errorResponse,
  formGet,
  jsonResponse,
  unauthorized,
} from "@lib/api/context";
import { buildApiSession, isAdmin } from "@lib/auth/session";
import { createSupabaseServerClient } from "@lib/supabase/server";
import { createAdminClient } from "@lib/db";
import { optionalEnvValue } from "@lib/env";

export async function handleAuthRoute(
  ctx: ApiContext,
  action: string,
): Promise<Response> {
  const supabase = await createSupabaseServerClient();
  const admin = createAdminClient();

  switch (action) {
    case "session": {
      if (ctx.request.method !== "GET") return emptyResponse(405);
      if (!ctx.session) return unauthorized();
      return jsonResponse(ctx.session);
    }

    case "login": {
      if (ctx.request.method !== "POST") return emptyResponse(405);
      const username = formGet(ctx.form, "username");
      const password = formGet(ctx.form, "password");
      if (!username || !password) return emptyResponse(400);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: username,
        password,
      });
      if (error || !data.session) return unauthorized();

      const apiSession = await buildApiSession(data.session);
      if (!apiSession) return unauthorized();
      return jsonResponse(apiSession);
    }

    case "logout": {
      if (ctx.request.method !== "POST") return emptyResponse(405);
      await supabase.auth.signOut();
      return emptyResponse(200);
    }

    case "register": {
      if (ctx.request.method !== "POST") return emptyResponse(405);
      const name = formGet(ctx.form, "name");
      const username = formGet(ctx.form, "username");
      const password = formGet(ctx.form, "password");
      const role = formGet(ctx.form, "role") || "customer";
      const kind = formGet(ctx.form, "kind");
      const code = formGet(ctx.form, "code");
      const birthMonth = formGet(ctx.form, "month_of_birth");

      if (!name || !username || !password || !kind) {
        return emptyResponse(400);
      }

      const enableInvite = process.env.NEXT_PUBLIC_ENABLE_INVITE_CODE === "1";
      const inviteCode = optionalEnvValue(process.env.INVITE_CODE);
      if (enableInvite && inviteCode && code !== inviteCode) {
        return errorResponse("Invalid invite code", 400);
      }

      const roles = role.split(",").map((r) => r.trim()).filter(Boolean);
      let dateOfBirth: string | null = null;
      if (birthMonth) {
        const month = parseInt(birthMonth, 10);
        if (month >= 1 && month <= 12) {
          dateOfBirth = `2000-${String(month).padStart(2, "0")}-01`;
        }
      }

      // Email confirmation is opt-in via NEXT_PUBLIC_ENABLE_EMAIL_VALIDATION.
      // When disabled (default for the relaunch), create the user directly via
      // the Admin API with the email pre-confirmed. This avoids the strict
      // default SMTP rate limits that block sign-ups.
      const requireConfirmation =
        process.env.NEXT_PUBLIC_ENABLE_EMAIL_VALIDATION === "1";

      const { data: created, error: createError } =
        await admin.auth.admin.createUser({
          email: username,
          password,
          email_confirm: !requireConfirmation,
          user_metadata: { name, roles, kind, date_of_birth: dateOfBirth },
        });

      if (createError) {
        const msg = createError.message.toLowerCase();
        if (msg.includes("already") || msg.includes("registered")) {
          return errorResponse("User already exists", 400);
        }
        console.error("register createUser error", createError);
        return emptyResponse(500);
      }

      if (created.user) {
        await admin.from("profiles").upsert({
          id: created.user.id,
          name,
          roles,
          kind,
          date_of_birth: dateOfBirth,
          created_at: new Date().toISOString(),
        });

        if (requireConfirmation) {
          const siteUrl =
            optionalEnvValue(process.env.NEXT_PUBLIC_SITE_URL) ??
            "http://localhost:3000";
          await supabase.auth.resend({
            type: "signup",
            email: username,
            options: { emailRedirectTo: `${siteUrl}/auth/callback` },
          });
        }
      }

      return emptyResponse(201);
    }

    case "confirm": {
      if (ctx.request.method !== "POST") return emptyResponse(405);
      const username = formGet(ctx.form, "username");
      const otp = formGet(ctx.form, "otp");
      if (!username || !otp) return emptyResponse(400);

      const { error } = await supabase.auth.verifyOtp({
        email: username,
        token: otp,
        type: "email",
      });
      if (error) return unauthorized();
      return emptyResponse(200);
    }

    case "change-password": {
      if (ctx.request.method !== "POST") return emptyResponse(405);
      if (!ctx.session) return unauthorized();
      const oldPwd = formGet(ctx.form, "old");
      const newPwd = formGet(ctx.form, "new");
      if (!oldPwd || !newPwd) return emptyResponse(400);

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: ctx.session.email,
        password: oldPwd,
      });
      if (signInError) return unauthorized();

      const { error } = await supabase.auth.updateUser({ password: newPwd });
      if (error) return emptyResponse(500);

      const { data } = await supabase.auth.getSession();
      if (!data.session) return unauthorized();
      const apiSession = await buildApiSession(data.session);
      return jsonResponse(apiSession);
    }

    case "request-reset-password": {
      if (ctx.request.method !== "POST") return emptyResponse(405);
      const username = formGet(ctx.form, "username");
      if (!username) return emptyResponse(400);
      const siteUrl =
        optionalEnvValue(process.env.NEXT_PUBLIC_SITE_URL) ??
        "http://localhost:3000";
      await supabase.auth.resetPasswordForEmail(username, {
        redirectTo: `${siteUrl}/auth/callback?type=recovery`,
      });
      return emptyResponse(200);
    }

    case "reset-password": {
      if (ctx.request.method !== "POST") return emptyResponse(405);
      const username = formGet(ctx.form, "username");
      const password = formGet(ctx.form, "password");
      const otp = formGet(ctx.form, "otp");
      if (!username || !password || !otp) return emptyResponse(400);

      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: username,
        token: otp,
        type: "recovery",
      });
      if (verifyError) return unauthorized();

      const { error } = await supabase.auth.updateUser({ password });
      if (error) return emptyResponse(500);

      const { data: signInData, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: username,
          password,
        });
      if (signInError || !signInData.session) return unauthorized();
      const apiSession = await buildApiSession(signInData.session);
      return jsonResponse(apiSession);
    }

    case "access": {
      if (ctx.request.method !== "GET") return emptyResponse(405);
      const code = ctx.query.get("code");
      const inviteCode = optionalEnvValue(process.env.INVITE_CODE);
      if (!code || !inviteCode || code !== inviteCode) {
        return unauthorized();
      }
      return emptyResponse(200);
    }

    case "admin/confirm": {
      if (ctx.request.method !== "POST") return emptyResponse(405);
      if (!ctx.session || !isAdmin(ctx.session.roles)) return emptyResponse(403);
      const userId = formGet(ctx.form, "user");
      if (!userId) return emptyResponse(400);
      const { data: authUser } = await admin.auth.admin.getUserById(userId);
      if (!authUser.user) return errorResponse("User not found", 400);
      await admin.auth.admin.updateUserById(userId, { email_confirm: true });
      return emptyResponse(200);
    }

    case "admin/reset-password": {
      if (ctx.request.method !== "POST") return emptyResponse(405);
      if (!ctx.session || !isAdmin(ctx.session.roles)) return emptyResponse(403);
      const userId = formGet(ctx.form, "user");
      const newPwd = formGet(ctx.form, "new");
      if (!userId || !newPwd) return emptyResponse(400);
      const { error } = await admin.auth.admin.updateUserById(userId, {
        password: newPwd,
      });
      if (error) return errorResponse("User not found", 400);
      return emptyResponse(200);
    }

    case "admin/generate-token": {
      if (ctx.request.method !== "POST") return emptyResponse(405);
      if (!ctx.session || !isAdmin(ctx.session.roles)) return emptyResponse(403);
      return emptyResponse(501);
    }

    default:
      return emptyResponse(404);
  }
}
