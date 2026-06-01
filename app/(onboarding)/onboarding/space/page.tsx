import { Suspense } from "react";
import Step2, { Step2Form } from "../_components/Step2";

export default function Space() {
  return (
    <Suspense fallback={<Step2Form />}>
      <Step2 />
    </Suspense>
  );
}
