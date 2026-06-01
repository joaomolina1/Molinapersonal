import { TimeDuration } from "@/_utils/number";
import {
  CSSProperties,
  Ref,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
  Dialog as AriaDialog,
  I18nProvider as AriaI18nProvider,
} from "react-aria-components";
import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
import InputWrapper from "../_utils/InputWrapper";
import { InputSelectButton } from "../InputSelect";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import Modal from "../Modal";
import { Calendar } from "../InputDate";
import Stack from "../Stack";
import Button from "../Button";
import { formatDate } from "@/_utils/date";
import Tooltip from "../Tooltip";
import { TooltipProps } from "../Tooltip/Tooltip";
import Chip from "../Chip";
import IconUserInterfaceFormsCalendar from "../_icons/UserInterface/Forms/Calendar.svg";
import TextBlock from "../TextBlock";
import { InputTimeRangeInputs } from "../InputTimeRange";

export type InputDateTimeRangeProps = {
  mode: "select" | "chip";
  label: string;
  showLabel?: boolean;
  date?: CalendarDate | null;
  start?: TimeDuration | null;
  end?: TimeDuration | null;
  onChange?: (
    date: CalendarDate | null,
    start: TimeDuration | null,
    end: TimeDuration | null,
  ) => void;
  minDate?: CalendarDate;
  maxDate?: CalendarDate;
  isDateUnavailable?: (date: CalendarDate) => boolean;
  availableTimeRanges?: { start: TimeDuration; end: TimeDuration }[];
  unavailableTimeRanges?: { start: TimeDuration; end: TimeDuration }[];
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  error?: string;
  info?: string;
  helpTooltip?: Omit<TooltipProps, "children">;

  className?: string;
  style?: CSSProperties;

  ref?: Ref<HTMLButtonElement>;
};

const { block, element } = createBEMClasses("callout-date-time-range");

const InputDateTimeRange = ({
  mode,
  label,
  showLabel,
  date,
  start,
  end,
  onChange,
  minDate,
  maxDate,
  isDateUnavailable,
  availableTimeRanges,
  unavailableTimeRanges,
  placeholder,
  disabled,
  invalid,
  error,
  info,
  helpTooltip,
  className,
  style,
  ref,
}: InputDateTimeRangeProps) => {
  const isMobile = useMediaQuery("small");
  const [isOpen, setIsOpen] = useState(false);

  const [innerDate, setInnerDate] = useState(date);
  const [innerStart, setInnerStart] = useState(start);
  const [innerEnd, setInnerEnd] = useState(end);

  // Actions

  const hasDate = !!innerDate;
  const hasStartEnd = !!innerStart && !!innerEnd;

  const closeAndApplyOrCancel = useCallback(() => {
    if (hasDate) {
      if (hasStartEnd) {
        onChange?.(innerDate, innerStart, innerEnd);
      } else {
        onChange?.(innerDate, start ?? null, end ?? null);
        setInnerStart(start);
        setInnerEnd(end);
      }
    } else {
      setInnerDate(date);
      setInnerStart(start);
      setInnerEnd(end);
    }

    setIsOpen(false);
  }, [
    date,
    end,
    hasDate,
    hasStartEnd,
    innerDate,
    innerEnd,
    innerStart,
    onChange,
    start,
  ]);

  const clear = useCallback(() => {
    setInnerDate(null);
    setInnerStart(null);
    setInnerEnd(null);
    onChange?.(null, null, null);
    setIsOpen(false);
  }, [onChange]);

  // Keep values valid

  useEffect(() => {
    if (date && isDateUnavailable?.(date)) {
      setInnerDate(null);
      setInnerStart(null);
      setInnerEnd(null);
      onChange?.(null, null, null);
    }
  }, [date, isDateUnavailable, onChange]);

  // Displayed value

  const valueText = getDateTimeRangeValueText({ date, start, end });

  // Shared props

  const calendarProps = useMemo(
    () => ({
      value: innerDate,
      onChange: setInnerDate,
      min: minDate,
      max: maxDate,
      isDateUnavailable: isDateUnavailable,
    }),
    [innerDate, isDateUnavailable, maxDate, minDate],
  );

  const inputTimeRangeInputsProps = useMemo(
    () => ({
      start: innerStart,
      end: innerEnd,
      setStart: setInnerStart,
      setEnd: setInnerEnd,
      availableRanges: availableTimeRanges,
      unavailableRanges: unavailableTimeRanges,
      onReset: () => {
        setInnerDate(null);
        onChange?.(null, null, null);
      },
      startStyle: { flex: 1 },
      endStyle: { flex: 1 },
    }),
    [
      availableTimeRanges,
      innerEnd,
      innerStart,
      onChange,
      unavailableTimeRanges,
    ],
  );

  const applyProps = useMemo(
    () => ({
      label: "Aplicar",
      type: "primary" as const,
      disabled:
        !innerDate ||
        (!!innerStart && !innerEnd) ||
        (!innerStart && !!innerEnd),
      onClick: closeAndApplyOrCancel,
    }),
    [closeAndApplyOrCancel, innerDate, innerEnd, innerStart],
  );

  const clearProps = useMemo(
    () => ({
      label: "Limpar",
      type: "link" as const,
      disabled: !innerDate && !innerStart && !innerEnd,
      onClick: clear,
    }),
    [clear, innerDate, innerEnd, innerStart],
  );

  const inputSelectButtonProps = useMemo(
    () =>
      ({
        label: label,
        showLabel: showLabel,
        disabled: disabled,
        value: valueText,
        placeholder: placeholder,
        invalid: !!error || invalid,
        ref: ref,
      }) as const,
    [disabled, error, invalid, label, placeholder, ref, showLabel, valueText],
  );

  const chipProps = useMemo(
    () => ({
      type: "button" as const,
      size: "small" as const,
      label: valueText || label,
      disabled,
      leftIcon: valueText ? undefined : <IconUserInterfaceFormsCalendar />,
      ref,
    }),
    [disabled, label, valueText, ref],
  );

  const innerDateDate = innerDate
    ? innerDate.toDate(getLocalTimeZone())
    : undefined;

  return (
    <AriaI18nProvider locale="pt-DE">
      <AriaDialogTrigger
        isOpen={isOpen}
        onOpenChange={(isOpen) => {
          if (isOpen) {
            setIsOpen(true);
          } else {
            closeAndApplyOrCancel();
          }
        }}
      >
        <InputWrapper
          error={error}
          info={info}
          className={className}
          style={style}
        >
          {helpTooltip && !isOpen ? (
            <Tooltip {...helpTooltip}>
              {mode === "chip" ? (
                <Chip {...chipProps} />
              ) : (
                <InputSelectButton {...inputSelectButtonProps} />
              )}
            </Tooltip>
          ) : mode === "chip" ? (
            <Chip {...chipProps} />
          ) : (
            <InputSelectButton {...inputSelectButtonProps} />
          )}
        </InputWrapper>
        {isMobile ? (
          <Modal ariaLabel={label} showCloseButton={false}>
            <Stack gap="1.5rem">
              <Stack gap="0.5rem">
                <TextBlock subtitle={label} />
                <Calendar {...calendarProps} />
              </Stack>
              <Stack row gap="1rem">
                <InputTimeRangeInputs {...inputTimeRangeInputsProps} />
              </Stack>
              <Stack gap="0.5rem">
                <Button {...applyProps} />
                <Button {...clearProps} />
              </Stack>
            </Stack>
          </Modal>
        ) : (
          <AriaPopover placement="bottom" offset={8}>
            <AriaDialog className={block()}>
              <main>
                <div className={element("left")}>
                  <Calendar {...calendarProps} withHeaderBorder />
                </div>
                <div className={element("right")}>
                  <div className={element("right__title")}>
                    {innerDateDate
                      ? [
                          formatDate(innerDateDate, { weekday: "short" }),
                          formatDate(innerDateDate, { dateStyle: "long" }),
                        ].join(", ")
                      : label}
                  </div>
                  <div className={element("right__start-end")}>
                    <InputTimeRangeInputs {...inputTimeRangeInputsProps} />
                  </div>
                </div>
              </main>
              <footer>
                <Button {...clearProps} />
                <Button {...applyProps} />
              </footer>
            </AriaDialog>
          </AriaPopover>
        )}
      </AriaDialogTrigger>
    </AriaI18nProvider>
  );
};

export const getDateTimeRangeValueText = ({
  date,
  start,
  end,
}: {
  date?: CalendarDate | null;
  start?: TimeDuration | null;
  end?: TimeDuration | null;
}) => {
  const dateDate = date ? date.toDate(getLocalTimeZone()) : undefined;
  const formattedDate = dateDate
    ? [
        formatDate(dateDate, { day: "numeric" }),
        formatDate(dateDate, { month: "short" }).slice(0, -1),
        formatDate(dateDate, { year: "numeric" }),
      ].join(" ")
    : undefined;

  const valueText = formattedDate
    ? !!start && !!end
      ? `${formattedDate}, ${start.timeLabel}-${end.timeLabel}`
      : `${formattedDate}`
    : undefined;

  return valueText;
};

export default InputDateTimeRange;
