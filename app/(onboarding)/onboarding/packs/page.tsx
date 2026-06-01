import { Suspense } from "react";
import Step4Recap from "../_components/Step4Recap";

export default function Packs() {
  return (
    <Suspense fallback={null}>
      <Step4Recap />
    </Suspense>
  );
}
