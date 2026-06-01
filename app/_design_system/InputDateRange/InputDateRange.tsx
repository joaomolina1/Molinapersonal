import { createBEMClasses } from "@/_utils/classname";
import {
  CalendarDate,
  isToday,
  getLocalTimeZone,
} from "@internationalized/date";
import { CSSProperties, Ref, useState } from "react";
import {
  I18nProvider as AriaI18nProvider,
  DateRangePicker as AriaDateRangePicker,
  Group as AriaGroup,
  Label as AriaLabel,
  DateInput as AriaDateInput,
  DateSegment as AriaDateSegment,
  Popover as AriaPopover,
  Dialog as AriaDialog,
  RangeCalendar as AriaRangeCalendar,
  CalendarGrid as AriaCalendarGrid,
  CalendarCell as AriaCalendarCell,
} from "react-aria-components";
import InputWrapper from "../_utils/InputWrapper";
import IconUserInterfaceFormsCalendar from "../_icons/UserInterface/Forms/Calendar.svg";
import Stack from "../Stack";
import { IconButton } from "../Button";
import IconUserInterfaceNavigationArrowDown from "../_icons/UserInterface/Navigation/ArrowDown.svg";
import { CalendarHeader } from "../InputDate";

export type DateRange = {
  start: CalendarDate;
  end: CalendarDate;
};

export type InputDateRangeProps = {
  label: string;
  showLabel?: boolean;
  value?: DateRange | null;
  onChange?: (value: DateRange | null) => void;
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

const { block, element } = createBEMClasses("input-date-range");

const InputDateRange = ({
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
}: InputDateRangeProps) => {
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
        <AriaDateRangePicker
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
              <div className={element("input")}>
                <AriaDateInput slot="start">
                  {(segment) => <AriaDateSegment segment={segment} />}
                </AriaDateInput>
                <div>-</div>
                <AriaDateInput slot="end">
                  {(segment) => <AriaDateSegment segment={segment} />}
                </AriaDateInput>
              </div>
            </Stack>
            <IconButton
              icon={<IconUserInterfaceNavigationArrowDown />}
              disabled={disabled}
              style={{ fontSize: "1.25rem" }}
              ariaLabel="Escolher datas"
              showTooltip={false}
            />
          </AriaGroup>
          <AriaPopover>
            <AriaDialog>
              <AriaRangeCalendar className={element("calendar")}>
                <CalendarHeader />
                <AriaCalendarGrid weekdayStyle="narrow">
                  {(date) => (
                    <AriaCalendarCell
                      date={date}
                      className={element("date", {
                        today: isToday(date, getLocalTimeZone()),
                      })}
                    >
                      <div className={element("date__day")}>{date.day}</div>
                    </AriaCalendarCell>
                  )}
                </AriaCalendarGrid>
              </AriaRangeCalendar>
            </AriaDialog>
          </AriaPopover>
        </AriaDateRangePicker>
      </InputWrapper>
    </AriaI18nProvider>
  );
};

export default InputDateRange;
