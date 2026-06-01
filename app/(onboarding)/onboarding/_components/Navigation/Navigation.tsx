"use client";

import Button from "@/_design_system/Button";
import { ButtonProps } from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import { createBEMClasses } from "@/_utils/classname";

const { block, element } = createBEMClasses("onboarding__navigation");

type NavigationProps = {
  primaryAction?: ButtonProps;
  secondaryAction?: ButtonProps;
};

const Navigation = ({ primaryAction, secondaryAction }: NavigationProps) => (
  <footer className={block()}>
    <Stack
      row
      alignItems="center"
      justifyContent="space-between"
      className={element("actions")}
    >
      {secondaryAction && <Button type="secondary" {...secondaryAction} />}
      {primaryAction && (
        <Button
          className={element("actions__primary")}
          type="primary"
          {...primaryAction}
        />
      )}
    </Stack>
  </footer>
);

export default Navigation;
