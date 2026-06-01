import type { NextRequest } from "next/server";
import type { Session } from "@supabase/supabase-js";
import type { ApiSession } from "@lib/auth/session";
import { createAdminClient } from "@lib/db";
import { createSupabaseServerClient } from "@lib/supabase/server";
import { buildApiSession } from "@lib/auth/session";

export type ApiContext = {
  request: NextRequest;
  params: Record<string, string>;
  query: URLSearchParams;
  session: ApiSession | null;
  body: unknown;
  form: FormData | null;
  version: string;
};

export async function parseFormBody(request: NextRequest): Promise<FormData> {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    return request.formData();
  }
  if (contentType.includes("application/x-www-form-urlencoded")) {
    const text = await request.text();
    const params = new URLSearchParams(text);
    const form = new FormData();
    params.forEach((value, key) => form.append(key, value));
    return form;
  }
  return new FormData();
}

export async function parseJsonBody(request: NextRequest): Promise<unknown> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return null;
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function sessionFromBearer(
  request: NextRequest,
): Promise<ApiSession | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  const token = header.slice("Bearer ".length).trim();
  if (!token) return null;

  const admin = createAdminClient();
  const { data, error } = await admin.auth.getUser(token);
  if (error || !data.user) return null;

  const stub: Session = {
    access_token: token,
    refresh_token: "",
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: data.user,
  };

  return buildApiSession(stub);
}

export async function createApiContext(
  request: NextRequest,
  params: Record<string, string> = {},
): Promise<ApiContext> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  let session = data.session ? await buildApiSession(data.session) : null;
  if (!session) {
    session = await sessionFromBearer(request);
  }

  const contentType = request.headers.get("content-type") ?? "";
  let form: FormData | null = null;
  let body: unknown = null;

  if (
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    request.method !== "DELETE"
  ) {
    if (
      contentType.includes("form") ||
      contentType.includes("multipart")
    ) {
      form = await parseFormBody(request);
    } else if (contentType.includes("json")) {
      body = await parseJsonBody(request);
    }
  }

  return {
    request,
    params,
    query: request.nextUrl.searchParams,
    session,
    body,
    form,
    version: params.version ?? "v1",
  };
}

export function formGet(form: FormData | null, key: string): string {
  const value = form?.get(key);
  return typeof value === "string" ? value : "";
}

export function jsonResponse(data: unknown, status = 200) {
  return Response.json(data, { status });
}

export function emptyResponse(status = 200) {
  return new Response(null, { status });
}

export function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export function unauthorized() {
  return emptyResponse(401);
}

export function forbidden() {
  return emptyResponse(403);
}

export function notFound() {
  return emptyResponse(404);
}

export function requireSession(ctx: ApiContext): ApiSession {
  if (!ctx.session) throw new Error("Unauthorized");
  return ctx.session;
}
