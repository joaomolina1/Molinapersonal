import Stack from "@/_design_system/Stack";
import { createBEMClasses } from "@/_utils/classname";
import OnboardingHeader from "../Header";
import { PropsWithChildren } from "react";
import Navigation from "../Navigation";
import { ButtonProps } from "@/_design_system/Button";

const { block, element } = createBEMClasses("onboarding");

const Wrapper = ({
  step,
  nextButton,
  previousButton,
  saveAndExitButton,
  totalSteps,
  children,
}: PropsWithChildren<{
  step: number;
  nextButton?: ButtonProps;
  previousButton?: ButtonProps;
  saveAndExitButton?: ButtonProps;
  totalSteps?: number;
}>) => {
  return (
    <Stack justifyContent="space-between" className={block()}>
      <OnboardingHeader
        step={step}
        action={saveAndExitButton}
        totalSteps={totalSteps}
      />
      <main className={element("content")}>
        <div>{children}</div>
      </main>
      {(!!nextButton || !!previousButton) && (
        <Navigation
          primaryAction={nextButton}
          secondaryAction={previousButton}
        />
      )}
    </Stack>
  );
};

export default Wrapper;
