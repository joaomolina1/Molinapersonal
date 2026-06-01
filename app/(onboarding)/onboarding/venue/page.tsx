import { Suspense } from "react";
import Step1, { Step1Form } from "../_components/Step1";

export default function Venue() {
  return (
    <Suspense fallback={<Step1Form />}>
      <Step1 />
    </Suspense>
  );
}
