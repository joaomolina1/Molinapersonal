"use client";

import { PatternFormat, PatternFormatProps } from "react-number-format";
import { createBEMClasses } from "@/_utils/classname";
import {
  ReactNode,
  useState,
  Ref,
  CSSProperties,
  useMemo,
  ChangeEvent,
  HTMLInputTypeAttribute,
} from "react";
import InputWrapper from "../_utils/InputWrapper";
import Stack from "../Stack";
import Tooltip, { TooltipProps } from "../Tooltip/Tooltip";
import IconUserInterfaceMiscellaneousTooltip from "../_icons/UserInterface/Miscellaneous/Tooltip.svg";
import { IconButton } from "../Button";

export type InputTextProps = {
  type?: HTMLInputTypeAttribute;
  autoComplete?: string;
  min?: string;
  label: string;
  placeholder?: string;
  showLabel?: boolean;
  showLabelOptional?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  measure?: ReactNode;
  value?: string;
  onChange?: (value: string, e: ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  readOnly?: boolean;
  invalid?: boolean;
  error?: string;
  info?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  infoTooltip?: TooltipProps;

  format?: PatternFormatProps["format"];

  className?: string;
  style?: CSSProperties;

  ref?: Ref<HTMLInputElement>;
};

const { block, element } = createBEMClasses("input-text");

const InputText = ({
  type = "text",
  autoComplete,
  min,
  label,
  placeholder,
  showLabel = true,
  showLabelOptional = false,
  leftIcon,
  rightIcon,
  measure,
  value,
  onChange,
  disabled,
  readOnly,
  invalid,
  error,
  info,
  onFocus,
  onBlur,
  infoTooltip,
  format,
  className,
  style,
  ref,
}: InputTextProps) => {
  const [focused, setFocused] = useState(false);

  const inputProps = useMemo(
    () =>
      ({
        min,
        autoComplete,
        "aria-label": label,
        placeholder,
        value,
        onFocus: () => {
          setFocused(true);
          onFocus?.();
        },
        onBlur: () => {
          setFocused(false);
          onBlur?.();
        },
        disabled,
        readOnly,
      }) satisfies React.InputHTMLAttributes<HTMLInputElement>,
    [
      autoComplete,
      disabled,
      label,
      placeholder,
      min,
      onBlur,
      onFocus,
      readOnly,
      value,
    ],
  );

  return (
    <InputWrapper className={className} error={error} info={info} style={style}>
      <label
        className={block({
          disabled,
          error: !!error || invalid,
          focused,
          "with-value": !!value,
          "with-placeholder": !!placeholder,
          "with-measure": !!measure,
        })}
      >
        {leftIcon}
        <Stack
          alignItems="flex-start"
          justifyContent="center"
          style={{ width: "100%" }}
        >
          {showLabel && (
            <span>
              {label}
              {showLabelOptional && <span> (opcional)</span>}
            </span>
          )}
          {format ? (
            <PatternFormat
              format={format}
              allowEmptyFormatting
              onChange={(e) => onChange?.(e.target.value, e)}
              {...inputProps}
            />
          ) : (
            <input
              ref={ref}
              onChange={(e) => onChange?.(e.target.value, e)}
              type={type}
              {...inputProps}
            />
          )}
        </Stack>
        {measure && <div className={element("measure")}>{measure}</div>}
        {rightIcon}
        {!!infoTooltip && (
          <Tooltip {...infoTooltip}>
            <IconButton
              ariaLabel="Informação"
              icon={<IconUserInterfaceMiscellaneousTooltip />}
              style={{ fontSize: "1.25rem" }}
              showTooltip={false}
            />
          </Tooltip>
        )}
      </label>
    </InputWrapper>
  );
};

export default InputText;
