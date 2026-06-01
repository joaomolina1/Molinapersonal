"use client";

import { createBEMClasses } from "@/_utils/classname";
import { CSSProperties, ReactNode } from "react";
import { Button as AriaButton } from "react-aria-components";

export type FloatButtonProps = {
  type?: "primary" | "inverted";
  label?: ReactNode;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  iconOnly?: boolean;
  ariaLabel?: string;
  disabled?: boolean;
  onClick?: () => void | Promise<void>;

  className?: string;
  style?: CSSProperties;
};

const { block } = createBEMClasses("float-button");

const FloatButton = ({
  type = "primary",
  label,
  leftIcon,
  rightIcon,
  iconOnly,
  ariaLabel,
  disabled,
  onClick,
  className,
  style,
}: FloatButtonProps) => {
  return (
    <AriaButton
      className={block({ type, iconOnly, disabled }, className)}
      isDisabled={disabled}
      onPress={
        onClick
          ? () => {
              onClick();
            }
          : undefined
      }
      style={style}
      aria-label={ariaLabel}
    >
      {leftIcon}
      {label}
      {rightIcon}
    </AriaButton>
  );
};

export default FloatButton;
