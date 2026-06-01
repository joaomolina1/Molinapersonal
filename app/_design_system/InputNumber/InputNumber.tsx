import { CSSProperties, Ref, ReactNode, useState } from "react";
import { NumericFormat, NumericFormatProps } from "react-number-format";
import InputWrapper from "../_utils/InputWrapper";
import { createBEMClasses } from "@/_utils/classname";
import Stack from "../Stack";

export type InputNumberProps = {
  label: string;
  placeholder?: string;
  showLabel?: boolean;
  icon?: ReactNode;
  rightIcon?: ReactNode;
  measure?: ReactNode;
  value?: number;
  onChange?: (value: number | undefined) => void;
  disabled?: boolean;
  invalid?: boolean;
  error?: string;
  info?: string;

  allowNegative?: NumericFormatProps["allowNegative"];
  decimalScale?: NumericFormatProps["decimalScale"];
  suffix?: NumericFormatProps["suffix"];

  className?: string;
  wrapperStyle?: CSSProperties;
  style?: CSSProperties;
  inputStyle?: CSSProperties;

  ref?: Ref<HTMLInputElement>;
  labelRef?: Ref<HTMLLabelElement>;
};

const { block, element } = createBEMClasses("input-number");

const InputNumber = ({
  label,
  placeholder,
  showLabel = true,
  icon,
  rightIcon,
  measure,
  value,
  onChange,
  disabled,
  invalid,
  error,
  info,
  allowNegative,
  decimalScale,
  suffix,
  className,
  wrapperStyle,
  style,
  inputStyle,
  ref,
  labelRef,
}: InputNumberProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <InputWrapper
      className={className}
      error={error}
      info={info}
      style={wrapperStyle}
    >
      <label
        className={block({
          disabled,
          error: !!error || invalid,
          focused,
          "with-value": value !== undefined,
          "with-placeholder": !!placeholder,
          "with-measure": !!measure,
        })}
        style={style}
        ref={labelRef}
      >
        {icon}
        <Stack
          alignItems="flex-start"
          justifyContent="center"
          style={{ width: "100%" }}
        >
          {showLabel && <span>{label}</span>}
          <NumericFormat
            value={value}
            onValueChange={(valueObject) => onChange?.(valueObject.floatValue)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            allowNegative={allowNegative}
            decimalScale={decimalScale}
            decimalSeparator=","
            thousandSeparator="."
            placeholder={placeholder}
            suffix={suffix}
            getInputRef={ref}
            style={inputStyle}
            type="tel"
            aria-label={label}
          />
        </Stack>
        {rightIcon}
        {measure && <div className={element("measure")}>{measure}</div>}
      </label>
    </InputWrapper>
  );
};

export default InputNumber;
