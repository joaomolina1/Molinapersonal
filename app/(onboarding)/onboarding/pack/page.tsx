import { Suspense } from "react";
import Step4, { Step4Form } from "../_components/Step4";

export default function Pack() {
  return (
    <Suspense fallback={<Step4Form />}>
      <Step4 />
    </Suspense>
  );
}
