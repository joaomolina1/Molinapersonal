"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { ErrorBoundaryContent } from "./_services/sentry";
import Logo from "./_design_system/Logo";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="pt">
      <body>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            height: "100dvh",
          }}
        >
          <Logo />
          <ErrorBoundaryContent />
        </div>
      </body>
    </html>
  );
}
