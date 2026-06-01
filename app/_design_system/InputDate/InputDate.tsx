import { createBEMClasses } from "@/_utils/classname";
import { CSSProperties, Ref, useState } from "react";
import InputWrapper from "../_utils/InputWrapper";
import {
  DateInput as AriaDateInput,
  DatePicker as AriaDatePicker,
  DateSegment as AriaDateSegment,
  Dialog as AriaDialog,
  Group as AriaGroup,
  I18nProvider as AriaI18nProvider,
  Label as AriaLabel,
  Popover as AriaPopover,
} from "react-aria-components";
import { CalendarDate } from "@internationalized/date";
import IconUserInterfaceFormsCalendar from "../_icons/UserInterface/Forms/Calendar.svg";
import Stack from "../Stack";
import { IconButton } from "../Button";
import IconUserInterfaceNavigationArrowDown from "../_icons/UserInterface/Navigation/ArrowDown.svg";
import Calendar from "./Calendar";

export type InputDateProps = {
  label: string;
  showLabel?: boolean;
  value?: CalendarDate | null;
  onChange?: (value: CalendarDate | null) => void;
  placeholder?: string;
  min?: CalendarDate;
  max?: CalendarDate;
  isDateUnavailable?: (date: CalendarDate) => boolean;
  disabled?: boolean;
  invalid?: boolean;
  error?: string;
  info?: string;
  showIcon?: boolean;

  className?: string;
  style?: CSSProperties;

  ref?: Ref<HTMLDivElement>;
};

const { block, element } = createBEMClasses("input-date");

const InputDate = ({
  label,
  showLabel = true,
  value,
  onChange,
  placeholder,
  min,
  max,
  isDateUnavailable,
  disabled,
  invalid,
  error,
  info,
  showIcon = true,
  className,
  style,
  ref,
}: InputDateProps) => {
  const [focused, setFocused] = useState(false);
  const [open, setOpen] = useState(false);

  const handleFocus = (focused: boolean) => {
    setFocused(focused);

    if (focused) {
      setOpen(true);
    }
  };

  const showPlaceholder = !value && !focused && !!placeholder;

  return (
    // pt-DE shows portuguese text with the week starting on monday
    <AriaI18nProvider locale="pt-DE">
      <InputWrapper
        className={className}
        error={error}
        info={info}
        style={style}
      >
        <AriaDatePicker
          aria-label={label}
          isDisabled={disabled}
          value={value}
          onChange={onChange}
          onFocusChange={handleFocus}
          isOpen={open}
          onOpenChange={setOpen}
          minValue={min}
          maxValue={max}
          isDateUnavailable={
            isDateUnavailable
              ? (date) => isDateUnavailable(date as CalendarDate)
              : undefined
          }
        >
          <AriaGroup
            className={block({
              disabled,
              error: !!error || invalid,
              focused,
              "with-value": !!value,
              "with-placeholder": showPlaceholder,
            })}
            ref={ref}
          >
            {showIcon && <IconUserInterfaceFormsCalendar />}
            <Stack
              alignItems="flex-start"
              justifyContent="center"
              style={{ width: "100%" }}
            >
              {showLabel && (
                <AriaLabel className={element("label")}>{label}</AriaLabel>
              )}
              {showPlaceholder && (
                <AriaLabel className={element("placeholder")}>
                  {placeholder}
                </AriaLabel>
              )}
              <AriaDateInput className={element("input")}>
                {(segment) => <AriaDateSegment segment={segment} />}
              </AriaDateInput>
            </Stack>
            <IconButton
              icon={<IconUserInterfaceNavigationArrowDown />}
              disabled={disabled}
              style={{ fontSize: "1.25rem" }}
              ariaLabel="Escolher data"
              showTooltip={false}
            />
          </AriaGroup>
          <AriaPopover>
            <AriaDialog>
              <div className={element("calendar")}>
                <Calendar />
              </div>
            </AriaDialog>
          </AriaPopover>
        </AriaDatePicker>
      </InputWrapper>
    </AriaI18nProvider>
  );
};

export default InputDate;
