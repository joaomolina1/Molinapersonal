"use client";

import {
  CalendarDate,
  startOfWeek,
  endOfWeek,
  getLocalTimeZone,
} from "@internationalized/date";
import { CSSProperties, useState } from "react";
import {
  Calendar as AriaCalendar,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  I18nProvider as AriaI18nProvider,
  Popover as AriaPopover,
  CalendarGrid as AriaCalendarGrid,
  CalendarCell as AriaCalendarCell,
} from "react-aria-components";
import InputWrapper from "../_utils/InputWrapper";
import { InputSelectButton } from "../InputSelect";
import { createBEMClasses } from "@/_utils/classname";
import { CalendarHeader } from "../InputDate";
import { formatDate } from "@/_utils/date";

export type InputWeekProps = {
  label: string;
  showLabel?: boolean;
  value: CalendarDate | null; // The value is the first day of the first week
  onChange: (value: CalendarDate) => void;
  weekSpan?: number;

  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  error?: string;
  info?: string;

  className?: string;
  style?: CSSProperties;
};

const { block, element } = createBEMClasses("callout-input-week");

const InputWeek = ({
  label,
  showLabel = true,
  value,
  onChange,
  weekSpan = 1,
  placeholder,
  disabled,
  invalid,
  error,
  info,
  className,
  style,
}: InputWeekProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCalendarChange = (clickedDate: CalendarDate) => {
    onChange(startOfWeek(clickedDate, "fr"));
    setIsOpen(false);
  };

  const selectedStart = value;
  const selectedEnd = value
    ? endOfWeek(value.add({ weeks: weekSpan - 1 }), "fr")
    : null;

  const valueString =
    selectedStart && selectedEnd
      ? [
          formatDate(selectedStart.toDate(getLocalTimeZone())),
          formatDate(selectedEnd.toDate(getLocalTimeZone())),
        ].join(" - ")
      : null;

  const [focusedDate, setFocusedDate] = useState<CalendarDate | null>(null);

  const focusedStart = focusedDate ? startOfWeek(focusedDate, "fr") : null;
  const focusedEnd = focusedStart
    ? endOfWeek(focusedStart.add({ weeks: weekSpan - 1 }), "fr")
    : null;

  return (
    <AriaI18nProvider locale="pt-DE">
      <AriaDialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
        <InputWrapper
          error={error}
          info={info}
          className={className}
          style={style}
        >
          <InputSelectButton
            label={label}
            showLabel={showLabel}
            disabled={disabled}
            value={valueString}
            placeholder={placeholder}
            invalid={invalid}
          />
        </InputWrapper>
        <AriaPopover placement="bottom" offset={8}>
          <AriaDialog className={block()}>
            <AriaCalendar
              value={value}
              onChange={handleCalendarChange}
              className={element("calendar")}
              onFocusChange={(newFocusedDate) => setFocusedDate(newFocusedDate)}
            >
              <CalendarHeader />
              <AriaCalendarGrid weekdayStyle="narrow">
                {(date) => (
                  <AriaCalendarCell
                    date={date}
                    onHoverStart={() => setFocusedDate(date)}
                    onHoverEnd={() =>
                      setTimeout(
                        () =>
                          setFocusedDate((currentFocusedDate) => {
                            if (
                              !!currentFocusedDate &&
                              date.compare(currentFocusedDate) === 0
                            ) {
                              return null;
                            } else {
                              return currentFocusedDate;
                            }
                          }),
                        100,
                      )
                    }
                    className={element("date", {
                      isFocusedStart: isDate(date, focusedStart),
                      isFocusedDuring: isBetweenDates(
                        date,
                        focusedStart,
                        focusedEnd,
                      ),
                      isFocusedEnd: isDate(date, focusedEnd),
                      isSelectedStart: isDate(date, selectedStart),
                      isSelectedDuring: isBetweenDates(
                        date,
                        selectedStart,
                        selectedEnd,
                      ),
                      isSelectedEnd: isDate(date, selectedEnd),
                    })}
                  >
                    <div className={element("date__day")}>{date.day}</div>
                  </AriaCalendarCell>
                )}
              </AriaCalendarGrid>
            </AriaCalendar>
          </AriaDialog>
        </AriaPopover>
      </AriaDialogTrigger>
    </AriaI18nProvider>
  );
};

const isDate = (date: CalendarDate, reference: CalendarDate | null) => {
  if (!reference) return false;
  return date.compare(reference) === 0;
};

const isBetweenDates = (
  date: CalendarDate,
  start: CalendarDate | null,
  end: CalendarDate | null,
) => {
  if (!start || !end) return false;
  return date.compare(start) > 0 && date.compare(end) < 0;
};

export default InputWeek;
