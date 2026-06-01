import type { NextRequest } from "next/server";
import { createApiContext, emptyResponse, unauthorized } from "@lib/api/context";
import { handleAuthRoute } from "@lib/api/handlers/auth";
import {
  handleBookingsRoute,
  handleContactRoute,
  handleConversationRoute,
  handleDashboardRoute,
  handleEmailRoute,
  handleHighlightsRoute,
  handleIcalRoute,
  handlePacksRoute,
  handlePaymentsRoute,
  handlePhotosRoute,
  handleQuoteRoute,
  handleReviewsRoute,
  handleSearchRoute,
  handleSpacesRoute,
  handleUsersRoute,
  handleVenuesRoute,
  handleWatchlistRoute,
} from "@lib/api/handlers/index";

export async function dispatchApi(
  request: NextRequest,
  service: string,
  version: string,
  pathSegments: string[],
  isPublic = false,
): Promise<Response> {
  const action = pathSegments.join("/");
  const ctx = await createApiContext(request, { service, version, action });

  try {
    switch (service) {
      case "auth":
        return handleAuthRoute(ctx, action);
      case "search":
        return handleSearchRoute(ctx, version === "v2" ? "v2" : action);
      case "venues":
        return handleVenuesRoute(ctx, action, isPublic);
      case "spaces":
        return handleSpacesRoute(ctx, action, isPublic);
      case "packs":
        return handlePacksRoute(ctx, action, isPublic);
      case "bookings":
        return handleBookingsRoute(ctx, action);
      case "reviews":
        return handleReviewsRoute(ctx, action);
      case "dashboard":
        return handleDashboardRoute(ctx);
      case "users":
        return handleUsersRoute(ctx, action);
      case "quote":
        return handleQuoteRoute(ctx, action, isPublic);
      case "contact":
        return handleContactRoute(ctx, action);
      case "watchlist":
        return handleWatchlistRoute(ctx, action);
      case "highlights":
        return handleHighlightsRoute(ctx, action);
      case "photos":
        return handlePhotosRoute(ctx, action);
      case "payments":
        return handlePaymentsRoute(ctx, action);
      case "ical":
        return handleIcalRoute(ctx, action);
      case "email":
        return handleEmailRoute(ctx);
      case "conversation":
        return handleConversationRoute();
      default:
        return emptyResponse(404);
    }
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return unauthorized();
    }
    console.error("API dispatch error", service, action, err);
    return emptyResponse(500);
  }
}

async function routeHandler(
  request: NextRequest,
  context: { params: Promise<{ service: string; version: string; path?: string[] }> },
  isPublic = false,
) {
  const { service, version, path } = await context.params;
  return dispatchApi(request, service, version, path ?? [], isPublic);
}

export function createServiceHandlers(isPublic = false) {
  return {
    GET: (req: NextRequest, ctx: { params: Promise<{ service: string; version: string; path?: string[] }> }) =>
      routeHandler(req, ctx, isPublic),
    POST: (req: NextRequest, ctx: { params: Promise<{ service: string; version: string; path?: string[] }> }) =>
      routeHandler(req, ctx, isPublic),
    PUT: (req: NextRequest, ctx: { params: Promise<{ service: string; version: string; path?: string[] }> }) =>
      routeHandler(req, ctx, isPublic),
    PATCH: (req: NextRequest, ctx: { params: Promise<{ service: string; version: string; path?: string[] }> }) =>
      routeHandler(req, ctx, isPublic),
    DELETE: (req: NextRequest, ctx: { params: Promise<{ service: string; version: string; path?: string[] }> }) =>
      routeHandler(req, ctx, isPublic),
  };
}
