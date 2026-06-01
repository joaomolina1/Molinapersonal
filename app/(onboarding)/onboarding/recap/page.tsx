import { Suspense } from "react";
import Step5 from "../_components/Step5";

export default function Packs() {
  return (
    <Suspense fallback={null}>
      <Step5 />
    </Suspense>
  );
}
