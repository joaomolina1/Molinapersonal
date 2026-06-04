import { TimeDuration } from "@/_utils/number";
import InputSelect from "../InputSelect";
import IconUserInterfaceMiscellaneousClock from "../_icons/UserInterface/Miscellaneous/Clock.svg";
import { scheduleStartEndOptions } from "@/(onboarding)/onboarding/_components/Step4/Prices/Price";
import { CSSProperties, useCallback } from "react";

const InputTimeRangeInputs = ({
  start,
  end,
  setStart,
  setEnd,
  startStyle,
  endStyle,
  availableRanges,
  unavailableRanges,
  disabled,
}: {
  start?: TimeDuration | null;
  end?: TimeDuration | null;
  setStart?: (start: TimeDuration | null) => void;
  setEnd?: (end: TimeDuration | null) => void;
  startStyle?: CSSProperties;
  endStyle?: CSSProperties;
  availableRanges?: { start: TimeDuration; end: TimeDuration }[];
  unavailableRanges?: { start: TimeDuration; end: TimeDuration }[];
  disabled?: boolean;
}) => {
  const isStartOptionUnavailable = useCallback(
    (option: TimeDuration) => {
      let isAvailable = true;
      let isUnavailable = false;

      if (availableRanges?.length) {
        isAvailable = availableRanges.some(
          (range) =>
            option.number >= range.start.number &&
            option.number < range.end.number,
        );
      }

      if (unavailableRanges?.length) {
        isUnavailable = unavailableRanges.some(
          (range) =>
            option.number >= range.start.number - 0.5 &&
            option.number <= range.end.number,
        );
      }

      return !isAvailable || isUnavailable;
    },
    [availableRanges, unavailableRanges],
  );

  const isEndOptionUnavailable = useCallback(
    (option: TimeDuration) => {
      let isAvailable = true;
      let isUnavailable = false;

      if (availableRanges?.length) {
        let ranges = availableRanges;

        if (start) {
          const rangesIncludingStart = availableRanges.filter(
            (range) =>
              start.number >= range.start.number &&
              start.number < range.end.number,
          );

          ranges = [
            ...rangesIncludingStart,
            // Consider the ranges that immediately follow ranges including start
            ...ranges.filter((range) =>
              rangesIncludingStart.some(
                (rangeIncludingStart) =>
                  rangeIncludingStart.end.number >= range.start.number,
              ),
            ),
          ];
        }

        isAvailable = ranges.some(
          (range) =>
            option.number > range.start.number &&
            option.number <= range.end.number,
        );
      }

      if (unavailableRanges?.length) {
        const ranges = unavailableRanges.map((range) => ({
          start: range.start,
          end:
            start && start.number <= range.start.number
              ? // A booking cannot go over an unavailable range
                scheduleStartEndOptions.at(-1)!
              : range.end,
        }));

        isUnavailable = ranges.some(
          (range) =>
            option.number >= range.start.number &&
            option.number <= range.end.number,
        );
      }

      return !isAvailable || isUnavailable;
    },
    [availableRanges, start, unavailableRanges],
  );

  const startOptions = scheduleStartEndOptions.slice(0, -1).map((option) => ({
    ...option.selectOption,
    disabled: isStartOptionUnavailable(option),
  }));

  const endOptions = scheduleStartEndOptions
    .slice(1)
    .filter((option) => (start ? option.number > start.number : true))
    .map((option) => ({
      ...option.selectOption,
      disabled: isEndOptionUnavailable(option),
    }));

  return (
    <>
      <InputSelect
        label="Desde"
        value={start?.id}
        options={startOptions}
        onChange={(value) => {
          const newStart = TimeDuration.fromNumber(parseFloat(value));

          setStart?.(newStart);

          if (!!end && newStart.number >= end.number) {
            setEnd?.(null);
          }
        }}
        leftIcon={<IconUserInterfaceMiscellaneousClock />}
        style={startStyle}
        disabled={disabled}
      />
      <InputSelect
        label="Até"
        value={end?.id}
        options={endOptions}
        onChange={(value) => {
          setEnd?.(TimeDuration.fromNumber(parseFloat(value)));
        }}
        leftIcon={<IconUserInterfaceMiscellaneousClock />}
        style={endStyle}
        disabled={disabled}
      />
    </>
  );
};

export default InputTimeRangeInputs;
