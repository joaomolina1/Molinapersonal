import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  productionBrowserSourceMaps: false,
  experimental: {
    serverSourceMaps: false,
  },
  staticPageGenerationTimeout: 120,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "storage.googleapis.com" },
      { protocol: "https", hostname: "img.rinu.pt" },
    ],
  },
};

export default withSentryConfig(nextConfig, {
  org: "rinu-lda",
  project: "rinu",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: true,
  reactComponentAnnotation: { enabled: true },
  sourcemaps: { disable: true },
  hideSourceMaps: true,
  disableLogger: true,
});
