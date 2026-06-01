"use client";

import { ReactNode, Ref } from "react";
import { createBEMClasses } from "@/_utils/classname";
import Stack from "../Stack";
import { StylelessButton } from "../Button";

export type ChipProps = {
  checked?: boolean;
  disabled?: boolean;
  onChange?: () => void;
  onClick?: () => void;
  className?: string;
  type?: "checkbox" | "radio" | "button";
  size?: "medium" | "small";
  radioGroupName?: string;
  ref?: Ref<HTMLButtonElement>;

  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  label?: string;
};

const { block, element } = createBEMClasses("chip");

const Chip = ({
  checked,
  disabled,
  onChange,
  onClick,
  className,
  type = "checkbox",
  size = "medium",
  radioGroupName,
  leftIcon,
  rightIcon,
  label,
  ref,
}: ChipProps) => {
  if (type === "button") {
    return (
      <StylelessButton
        onClick={onClick}
        className={block({ type }, className)}
        ref={ref}
      >
        <Stack
          row
          gap="0.375rem"
          alignItems="center"
          className={element("content", { checked, disabled, size })}
        >
          {leftIcon}
          {!!label && <span>{label}</span>}
          {rightIcon}
        </Stack>
      </StylelessButton>
    );
  }

  return (
    <label className={block({ type }, className)}>
      <input
        type={type}
        checked={checked}
        disabled={disabled}
        onChange={() => onChange?.()}
        name={radioGroupName}
      />
      <Stack
        row
        gap="0.375rem"
        alignItems="center"
        className={element("content", { checked, disabled, size })}
      >
        {leftIcon}
        {!!label && <span>{label}</span>}
        {rightIcon}
      </Stack>
    </label>
  );
};

export default Chip;
