import config from "@/_utils/config";
import { Session } from "./session";
import { captureMessage } from "./sentry";

function resolveApiBaseUrl() {
  const configured = config.apiUrl ?? "/api";
  if (configured.startsWith("http")) return configured.replace(/\/$/, "");

  if (typeof window !== "undefined") {
    return configured.startsWith("/") ? configured : `/${configured}`;
  }

  const site =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const path = configured.startsWith("/") ? configured : `/${configured}`;
  return `${site.replace(/\/$/, "")}${path}`;
}

type ApiService =
  | "auth"
  | "venues"
  | "spaces"
  | "packs"
  | "photos"
  | "attachments"
  | "search"
  | "dashboard"
  | "users"
  | "bookings"
  | "payments"
  | "watchlist"
  | "highlights"
  | "subscriptions"
  | "ical"
  | "reviews"
  | "testimonials"
  | "quote"
  | "event-hub"
  | "contact"
  | "conversation"
  | "public/venues"
  | "public/spaces"
  | "public/packs"
  | "public/search"
  | "public/testimonials";

export const getFetchApiForSession =
  (session: Session | undefined | null) =>
  async <T = any>(
    service: ApiService,
    endpoint: string | null = "",
    params: Omit<RequestInit, "body"> & { body?: any } = { method: "GET" },
    options: {
      contentType?: "json" | "form" | "form-data";
      tokenAuthenticated?: boolean;
      cookieAuthenticated?: boolean;
    } = {
      contentType: "json",
      tokenAuthenticated: true,
      cookieAuthenticated: false,
    },
    query?: Record<string, string | number | boolean | undefined | string[]>,
    version: string = "v1",
  ) => {
    if (params?.body) {
      if (options.contentType === "json") {
        params.body = JSON.stringify(params.body);

        params.headers = {
          ...params.headers,
          "Content-Type": "application/json",
        };
      }

      if (options.contentType === "form") {
        params.body = new URLSearchParams(
          params.body as Record<string, string>,
        );

        params.headers = {
          ...params.headers,
          "Content-Type": "application/x-www-form-urlencoded",
        };
      }

      if (options.contentType === "form-data") {
        const formData = new FormData();

        for (const key in params.body) {
          formData.append(key, params.body[key] as string | Blob);
        }

        params.body = formData;
      }
    }

    if (options.tokenAuthenticated && session) {
      params.headers = {
        ...params.headers,
        Authorization: `Bearer ${session.token}`,
      };
    }

    if (options.cookieAuthenticated) {
      params.credentials = "include";
    }

    const baseUrl = `${resolveApiBaseUrl()}/${service}/${version}`;

    let url = endpoint
      ? endpoint[0] === "?"
        ? `${baseUrl}${endpoint}`
        : `${baseUrl}/${endpoint}`
      : baseUrl;

    if (query) {
      const searchParams = new URLSearchParams();

      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach((valueEntry) => {
              searchParams.append(key, valueEntry);
            });
          } else {
            searchParams.set(key, value.toString());
          }
        }
      });

      url += `?${searchParams.toString()}`;
    }

    const res = await fetch(url, {
      ...params,
      signal: params.signal ?? AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      const text = await res.text();

      if (
        ![401, 402, 403].includes(res.status) &&
        // The GET /search throws a lot of 500 so let's not flood sentry
        !(res.status === 500 && url.includes("/search")) &&
        typeof window !== "undefined"
      ) {
        captureMessage(
          `Fetch API Error - ${res.status} ${params.method ?? "GET"} ${url}`,
          (context) => {
            context.setLevel("error");
            context.setExtra("request-body", params.body);
            context.setExtra("response-body", text);

            return context;
          },
        );
      }

      return Promise.reject(new Error(`API Error - ${res.status} - ${text}`));
    }

    try {
      return (await res.json()) as T;
    } catch {
      return null as T;
    }
  };

export type FetchApi = ReturnType<typeof getFetchApiForSession>;
