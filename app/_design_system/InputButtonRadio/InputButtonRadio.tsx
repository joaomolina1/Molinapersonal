import { createBEMClasses } from "@/_utils/classname";
import { CSSProperties } from "react";
import {
  RadioGroup as AriaRadioGroup,
  Radio as AriaRadio,
} from "react-aria-components";
import InputWrapper from "../_utils/InputWrapper";

export type InputButtonRadioProps<T> = {
  value?: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  options: {
    value: T;
    text: string;
  }[];

  invalid?: boolean;
  error?: string;
  info?: string;

  className?: string;
  style?: CSSProperties;
};

const { block, element } = createBEMClasses("input-button-radio-group");

const InputButtonRadio = <T extends string>({
  value,
  onChange,
  ariaLabel,
  options,
  invalid,
  error,
  info,
  className,
  style,
}: InputButtonRadioProps<T>) => {
  const isInvalid = invalid || !!error;

  return (
    <InputWrapper className={className} error={error} info={info} style={style}>
      <AriaRadioGroup
        value={value}
        onChange={(value) => onChange(value as T)}
        aria-label={ariaLabel}
        className={block()}
        isInvalid={isInvalid}
      >
        {options.map((option) => (
          <AriaRadio
            key={option.value}
            value={option.value}
            className={element("option")}
          >
            {option.text}
          </AriaRadio>
        ))}
      </AriaRadioGroup>
    </InputWrapper>
  );
};

export default InputButtonRadio;
