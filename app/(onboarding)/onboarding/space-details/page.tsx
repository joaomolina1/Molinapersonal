import { Suspense } from "react";
import Step3, { Step3Form } from "../_components/Step3";

export default function SpaceDetails() {
  return (
    <Suspense fallback={<Step3Form />}>
      <Step3 />
    </Suspense>
  );
}
