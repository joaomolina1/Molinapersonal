"use client";

import { ErrorPage } from "@/_services/sentry";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return <ErrorPage error={error} />;
}
