import { createBEMClasses } from "@/_utils/classname";
import { Checkbox as AriaCheckbox } from "react-aria-components";
import { CSSProperties, ReactNode } from "react";
import InputWrapper from "../_utils/InputWrapper";

export type InputCheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: ReactNode;
  ariaLabel?: string;
  disabled?: boolean;
  invalid?: boolean;
  error?: string;
  info?: string;
  position?: "left" | "right";

  className?: string;
  style?: CSSProperties;
};

const { block, element } = createBEMClasses("input-checkbox");

const InputCheckbox = ({
  checked,
  onChange,
  label,
  ariaLabel,
  disabled,
  invalid,
  error,
  info,
  position = "left",
  className,
  style,
}: InputCheckboxProps) => {
  const isInvalid = invalid || !!error;

  return (
    <InputWrapper className={className} error={error} info={info} style={style}>
      <AriaCheckbox
        isSelected={checked}
        onChange={onChange}
        className={block({ error: isInvalid, position })}
        isInvalid={isInvalid}
        isDisabled={disabled}
      >
        <div className={element("checkbox")} aria-label={ariaLabel}>
          <svg viewBox="0 0 18 18" aria-hidden="true">
            <polyline points="3 10 7 14 15 4" />
          </svg>
        </div>
        {label && <div className={element("label")}>{label}</div>}
      </AriaCheckbox>
    </InputWrapper>
  );
};

export default InputCheckbox;
