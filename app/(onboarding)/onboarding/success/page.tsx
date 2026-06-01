import { Suspense } from "react";
import Step6 from "../_components/Step6";

export default function Packs() {
  return (
    <Suspense fallback={null}>
      <Step6 />
    </Suspense>
  );
}
