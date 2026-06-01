import type { Metadata, Viewport } from "next";
import "@/main.scss";
import ApiProvider from "@/_services/api";
import { Poppins } from "next/font/google";
import { AuthProvider } from "./_services/session";
import config from "./_utils/config";
import { GlobalToastRegion } from "./_design_system/Toast";
import {
  NavigationBlockerProvider,
  NavigationProgressBarProvider,
} from "./_services/navigation";

import "simplebar-react/dist/simplebar.min.css";
import {
  GoogleAnalytics,
  GoogleTagManager,
} from "./_components/GoogleAnalytics";
import MetaPixel from "./_components/MetaPixel";
import { CookiesProvider } from "./_services/cookies";
import { QuoteRequestProvider } from "./(main)/_components/QuoteRequest";
import { PostHogProvider } from "./_services/posthog/PostHogProvider";
import { N8NChat } from "./_components/N8NChat";

const TITLE =
  "RINU - Espaços para festas de anos, eventos corporativos e batizados";
const DESCRIPTION =
  "Na RINU encontra espaços para festas de anos (infantis ou adultas), batizados, eventos corporativos, team buildings e reuniões de empresa em Portugal. Temos espaços para alugar para qualquer tipo de evento";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    template: "%s | RINU",
    default: TITLE,
  },
  description: DESCRIPTION,
  keywords: [
    "pesquisar espaços",
    "alugar espaços",
    "festas de anos",
    "festas infantis",
    "batizados",
    "eventos corporativos",
    "eventos de empresa",
    "reuniões de empresa",
    "team buildings",
    "espaços para reuniões",
    "RINU",
    "Portugal",
  ],
  applicationName: "RINU",
  metadataBase:
    config.env === "production"
      ? new URL("https://rinu.pt")
      : config.env === "pre-production"
        ? new URL("https://preprod.rinu.pt/")
        : config.env === "development" || config.env === "ci"
          ? new URL("https://rinu.fun")
          : new URL("http://localhost:3000/"),
  openGraph: {
    title: {
      template: "%s | RINU",
      default: TITLE,
    },
    description: DESCRIPTION,
    type: "website",
    url: "https://rinu.pt",
    images: "/hero_background.webp",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: config.env === "production",
    follow: config.env === "production",
  },
  verification: {
    google: config.googleDomainVerification,
    other: config.metaDomainVerification
      ? {
          "facebook-domain-verification": config.metaDomainVerification,
        }
      : undefined,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1, // TO DO: Remove me for a11y
};

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={poppins.className}>
      <body>
        <NavigationBlockerProvider>
          <NavigationProgressBarProvider>
            <ApiProvider>
              <AuthProvider>
                <CookiesProvider>
                  <QuoteRequestProvider>
                    <PostHogProvider>
                      {!!config.gaId && <GoogleAnalytics gaId={config.gaId} />}
                      {!!config.gtmId && (
                        <GoogleTagManager gtmId={config.gtmId} />
                      )}
                      {!!config.metaPixelId && (
                        <MetaPixel metaPixelId={config.metaPixelId} />
                      )}
                      <N8NChat />
                      {children}
                    </PostHogProvider>
                  </QuoteRequestProvider>
                </CookiesProvider>
              </AuthProvider>
            </ApiProvider>
            <GlobalToastRegion />
          </NavigationProgressBarProvider>
        </NavigationBlockerProvider>
      </body>
    </html>
  );
}
