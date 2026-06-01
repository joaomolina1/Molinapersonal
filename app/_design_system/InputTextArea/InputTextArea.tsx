"use client";

import { createBEMClasses } from "@/_utils/classname";
import InputWrapper from "../_utils/InputWrapper";
import { Ref, useState } from "react";

export type InputTextAreaProps = {
  label?: string;
  showLabel?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  invalid?: boolean;
  info?: string;

  height?: "small" | "large";
  className?: string;

  ref?: Ref<HTMLTextAreaElement>;
};

const { block, element } = createBEMClasses("input-text-area");

const InputTextArea = ({
  label,
  showLabel,
  value,
  onChange,
  disabled,
  error,
  invalid,
  info,
  height = "large",
  className,
  ref,
}: InputTextAreaProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <InputWrapper className={className} error={error} info={info}>
      <div
        className={block({
          disabled,
          error: !!error || invalid,
          focused: showLabel && focused,
          "with-value": showLabel && !!value,
          height,
        })}
        data-replicated-value={value}
      >
        {showLabel && <span className={element("label")}>{label}</span>}
        <textarea
          aria-label={label}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          ref={ref}
        />
      </div>
    </InputWrapper>
  );
};

export default InputTextArea;
