"use client";

import config from "@/_utils/config";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export const ErrorBoundaryContent = () => {
  return (
    <p className="error-boundary">
      Ocorreu um erro. Por favor {/* eslint-disable-next-line */}
      <a onClick={() => window.location.reload()}>actualize a página</a>.
    </p>
  );
};

export const ErrorBoundary = (props: Sentry.ErrorBoundaryProps) => {
  return (
    <Sentry.ErrorBoundary fallback={<ErrorBoundaryContent />} {...props} />
  );
};

export const ErrorPage = ({ error }: { error: Error }) => {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return <ErrorBoundaryContent />;
};

export const captureMessage = (
  message: string,
  captureContext?: Parameters<typeof Sentry.captureMessage>[1],
) => {
  if (config.sentryDsn) {
    Sentry.captureMessage(message, captureContext);
  } else {
    console.error(message);
  }
};
