"use client";

import { ErrorPage } from "../../_services/sentry";
import Wrapper from "./_components/Wrapper";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  return (
    <Wrapper step={0}>
      <ErrorPage error={error} />
    </Wrapper>
  );
}
