const config = {
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  googleMapsMapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID,
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "/api",
  env: process.env.NEXT_PUBLIC_ENV as
    | "production"
    | "pre-production"
    | "development"
    | "ci"
    | "local",
  enableInviteCode: process.env.NEXT_PUBLIC_ENABLE_INVITE_CODE === "1",
  enableEmailValidation:
    process.env.NEXT_PUBLIC_ENABLE_EMAIL_VALIDATION === "1",
  enableReviews: process.env.NEXT_PUBLIC_ENABLE_REVIEWS === "1",
  gaId: process.env.NEXT_PUBLIC_GA_ID,
  gtmId: process.env.NEXT_PUBLIC_GTM_ID,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
  googleDomainVerification: process.env.NEXT_PUBLIC_GOOGLE_DOMAIN_VERIFICATION,
  metaDomainVerification: process.env.NEXT_PUBLIC_META_DOMAIN_VERIFICATION,
  sentryDsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY,
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  n8nWebhookUrl: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL,
};

export default config;
