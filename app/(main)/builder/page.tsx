import { Suspense } from "react";
import BuilderPage from "./_components/BuilderPage";

export default function Builder() {
  return (
    <Suspense>
      <BuilderPage />
    </Suspense>
  );
}
