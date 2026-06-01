import config from "@/_utils/config";
import * as Sentry from "@sentry/nextjs";

if (config.sentryDsn && config.env === "production") {
  Sentry.init({
    dsn: config.sentryDsn,
    environment: window.location.host,
    integrations: [
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
        networkDetailAllowUrls: config.apiUrl ? [config.apiUrl] : [],
      }),
      Sentry.captureConsoleIntegration({
        levels: ["error"],
      }),
      // Stop logging errors because the API is throwing a lot of 500 errors on the /GET search
      // Sentry.httpClientIntegration({
      //   // Ignore the 401 from the GET session and the 404 from the GET space page
      //   failedRequestStatusCodes: [400, [405, 599]],
      // }),
    ],
    tracesSampleRate: 1,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 1.0,
    normalizeDepth: 10,
  });
}
