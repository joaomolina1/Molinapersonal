"use client";

import { E164Number, CountryCode } from "libphonenumber-js/core";
import {
  CSSProperties,
  ChangeEvent,
  ReactNode,
  Ref,
  createContext,
  useContext,
} from "react";
import ReactPhoneInput, {
  getCountryCallingCode,
  isPossiblePhoneNumber,
  isValidPhoneNumber,
  parsePhoneNumber,
} from "react-phone-number-input";
import InputWrapper from "../_utils/InputWrapper";
import InputText from "../InputText";
import InputSelect from "../InputSelect";
import { createBEMClasses } from "@/_utils/classname";
import Stack from "../Stack";

const { block, element } = createBEMClasses("input-phone");

export type InputPhoneProps = {
  extension?: number;
  number?: number;
  onChange: (extension?: number, number?: number) => void;
  disabled?: boolean;
  invalid?: boolean;
  error?: string;
  info?: string;
  optional?: boolean;

  className?: string;
  style?: CSSProperties;
};

const InputPhoneContext = createContext<{
  invalid?: boolean;
  optional?: boolean;
}>({});

const InputPhone = ({
  extension,
  number,
  onChange,
  disabled,
  invalid = false,
  error,
  info,
  optional,
  className,
  style,
}: InputPhoneProps) => {
  const e164NumberValue =
    !!extension && !!number
      ? parsePhoneNumber(`+${extension}${number}`, "PT")?.number
      : undefined;

  const handleChange = (newValue?: E164Number) => {
    const phoneNumberNewValue = newValue
      ? parsePhoneNumber(newValue, "PT")
      : undefined;

    if (!phoneNumberNewValue) {
      onChange();
      return;
    }

    onChange(
      parseInt(phoneNumberNewValue.countryCallingCode),
      parseInt(phoneNumberNewValue.nationalNumber),
    );
  };

  return (
    <InputWrapper className={className} error={error} info={info} style={style}>
      <InputPhoneContext value={{ invalid: !!error || invalid, optional }}>
        <ReactPhoneInput
          className={block()}
          defaultCountry="PT"
          value={e164NumberValue}
          onChange={handleChange}
          addInternationalOption={false}
          countrySelectComponent={InputPhoneSelect}
          inputComponent={InputPhoneInput}
          disabled={disabled}
          displayInitialValueAsLocalNumber
          type="tel"
          autoComplete="tel-national"
          limitMaxLength
        />
      </InputPhoneContext>
    </InputWrapper>
  );
};

const InputPhoneSelect = ({
  value,
  onChange,
  options,
  iconComponent: Flag,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: {
    value: CountryCode;
    label: string;
  }[];
  iconComponent: (props: { country: CountryCode; label: string }) => ReactNode;
  disabled?: boolean;
}) => {
  const { invalid } = useContext(InputPhoneContext);

  return (
    <>
      <InputSelect
        label="Indicativo"
        value={value}
        onChange={onChange}
        options={options.map((option) => ({
          id: option.value,
          text: `${option.label} (+${getCountryCallingCode(option.value)})`,
          selectedText: (
            <Stack row gap="0.25rem" alignItems="center">
              <Flag country={option.value} label={option.label} />
              <span>+{getCountryCallingCode(option.value)}</span>
            </Stack>
          ),
        }))}
        className={element("select")}
        disabled={disabled}
        invalid={invalid}
      />
    </>
  );
};

const InputPhoneInput = ({
  value,
  onChange,
  type,
  autoComplete,
  disabled,
  ref,
}: {
  value: string;
  onChange: (e: ChangeEvent) => void;
  type: string;
  autoComplete: string;
  disabled?: boolean;
  ref: Ref<HTMLInputElement>;
}) => {
  const { invalid, optional } = useContext(InputPhoneContext);

  return (
    <InputText
      label="Telemóvel"
      showLabelOptional={optional}
      value={value}
      onChange={(_, e) => onChange(e)}
      type={type}
      autoComplete={autoComplete}
      ref={ref}
      className={element("input")}
      disabled={disabled}
      invalid={invalid}
    />
  );
};

export const isValidPhone = ({
  extension,
  number,
  fullCheck = false,
}: {
  extension?: number;
  number?: number;
  fullCheck?: boolean;
}) => {
  if (!extension || !number) {
    return false;
  }

  if (fullCheck) {
    return isValidPhoneNumber(`+${extension}${number}`, "PT");
  }

  return isPossiblePhoneNumber(`+${extension}${number}`, "PT");
};

export default InputPhone;
