"use client";

import Button, { ButtonProps } from "@/_design_system/Button";
import Logo from "@/_design_system/Logo";
import ProgressBar from "@/_design_system/ProgressBar/ProgressBar";
import Stack from "@/_design_system/Stack";
import { createBEMClasses } from "@/_utils/classname";

const { block, element } = createBEMClasses("onboarding__header");

const OnboardingHeader = ({
  step,
  action,
  totalSteps = 5,
}: {
  step: number;
  action?: ButtonProps;
  totalSteps?: number;
}) => (
  <header className={block()}>
    <Stack
      row
      gap="8px"
      justifyContent="space-between"
      alignItems="center"
      className={element("content")}
    >
      <Logo />
      <Stack row gap="8px">
        {action && <Button type="secondary" {...action} />}
      </Stack>
    </Stack>
    {step !== 0 && step !== 6 && (
      <Stack row gap="0.25rem" className={element("progress")}>
        {Array(totalSteps)
          .fill(0)
          .map((_, index) => (
            <ProgressBar
              key={index}
              progress={step > index + 1 ? 100 : step === index + 1 ? 10 : 0}
            />
          ))}
      </Stack>
    )}
  </header>
);

export default OnboardingHeader;
