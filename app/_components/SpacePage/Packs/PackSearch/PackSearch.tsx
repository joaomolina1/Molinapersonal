import { createBEMClasses } from "@/_utils/classname";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDate,
  today,
  getLocalTimeZone,
  parseDate,
  getDayOfWeek,
  maxDate,
} from "@internationalized/date";
import InputDate from "@/_design_system/InputDate";
import InputTimeRange from "@/_design_system/InputTimeRange";
import InputNumber from "@/_design_system/InputNumber";
import { Pack } from "@/_models/pack";
import { DAYS_OF_WEEK } from "@/_utils/date";
import { useScrollIntoView } from "@/_utils/scrollIntoView";
import { useDateStartEnd, useNumPeople } from "@/(main)/search/useSearchState";
import { Space } from "@/_models/space";
import { usePublicBookings } from "@/_models/booking";
import { scheduleStartEndOptions } from "@/(onboarding)/onboarding/_components/Step4/Prices/Price";
import { TimeDuration } from "@/_utils/number";
import { sendGAEvent } from "@next/third-parties/google";
import { Venue } from "@/_models/venue";
import {
  useSearchParamsArrayState,
} from "@/_services/searchParams";

const EXTRA_PARAMS_DEBOUNCE_MS = 400;

export const usePackSearch = () => {
  const { date, start, end, setDateStartEnd } = useDateStartEnd();
  const { numPeople, numPeopleDebounced, setNumPeople } = useNumPeople();
  const [extrasFromUrl, setExtrasUrl] =
    useSearchParamsArrayState<string>("extra");
  const extrasFromUrlKey = extrasFromUrl.join(",");
  const [extras, setExtrasState] = useState(extrasFromUrl);
  const [extraParams, setExtraParamsState] = useState<
    Record<string, { hours?: number; pax?: number }>
  >({});
  const [extraParamsDebounced, setExtraParamsDebounced] = useState(extraParams);
  const extraParamsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setExtrasState((prev) => {
      if (
        prev.length === extrasFromUrl.length &&
        prev.every((value, index) => value === extrasFromUrl[index])
      ) {
        return prev;
      }

      return extrasFromUrl;
    });
  }, [extrasFromUrlKey]);

  useEffect(() => {
    if (extraParamsTimerRef.current) {
      clearTimeout(extraParamsTimerRef.current);
    }

    extraParamsTimerRef.current = setTimeout(() => {
      setExtraParamsDebounced(extraParams);
    }, EXTRA_PARAMS_DEBOUNCE_MS);

    return () => {
      if (extraParamsTimerRef.current) {
        clearTimeout(extraParamsTimerRef.current);
      }
    };
  }, [extraParams]);

  const setExtras = useCallback(
    (values: string[]) => {
      setExtrasState(values);
      setExtrasUrl(values);
    },
    [setExtrasUrl],
  );

  const setExtraParams = useCallback(
    (
      value:
        | Record<string, { hours?: number; pax?: number }>
        | ((
            prev: Record<string, { hours?: number; pax?: number }>,
          ) => Record<string, { hours?: number; pax?: number }>),
    ) => {
      setExtraParamsState((prev) =>
        typeof value === "function" ? value(prev) : value,
      );
    },
    [],
  );

  const [dateRef, dateScrollIntoView] =
    useScrollIntoView<HTMLDivElement>(false);
  const startEndRef = useRef<HTMLButtonElement>(null);
  const numPeopleRef = useRef<HTMLInputElement>(null);

  const focusOnUnfilledInput = useCallback(() => {
    if (!date) {
      dateRef.current?.click();
      return;
    }

    if (!start || !end) {
      startEndRef.current?.click();
      return;
    }

    if (!numPeople) {
      numPeopleRef.current?.focus();
    }
  }, [date, start, end, numPeople, dateRef]);

  const scrollIntoView = useCallback(() => {
    dateScrollIntoView();
  }, [dateScrollIntoView]);

  return {
    date,
    start,
    end,
    setDateStartEnd,
    numPeople,
    numPeopleDebounced,
    setNumPeople,
    extras,
    setExtras,
    extraParams,
    extraParamsDebounced,
    setExtraParams,
    refs: {
      date: dateRef,
      startEnd: startEndRef,
      persons: numPeopleRef,
    },
    focusOnUnfilledInput,
    scrollIntoView,
  };
};

export type PackSearchHook = ReturnType<typeof usePackSearch>;

const { block, element } = createBEMClasses("client-pack-search");

const PackSearch = ({
  space,
  packSearch,
  allPacks,
  venue,
}: {
  space: Space;
  packSearch: PackSearchHook;
  allPacks: Pack[];
  venue: Venue;
}) => {
  const { date, start, end, setDateStartEnd, numPeople, setNumPeople, refs } =
    packSearch;

  const { data: publicBookings = [] } = usePublicBookings({
    space_id: [space.id],
    date_from: today(getLocalTimeZone()).toString(),
  });

  const packScheduleKey = useMemo(
    () => getPackScheduleKey(allPacks),
    [allPacks],
  );

  const publicBookingsKey = useMemo(
    () =>
      publicBookings
        .map(
          (booking) =>
            `${booking.date}-${booking.start?.id ?? ""}-${booking.end?.id ?? ""}`,
        )
        .join("|"),
    [publicBookings],
  );

  const allPacksRef = useRef(allPacks);
  allPacksRef.current = allPacks;

  const publicBookingsRef = useRef(publicBookings);
  publicBookingsRef.current = publicBookings;

  const isDateUnavailable = useCallback(
    (date: CalendarDate) =>
      getIsDateUnavailable(
        date,
        allPacksRef.current,
        publicBookingsRef.current,
      ),
    [packScheduleKey, publicBookingsKey],
  );

  const allAvailableRanges = useMemo(
    () => getAvailableRanges(allPacksRef.current),
    [packScheduleKey],
  );

  const availableRanges = useMemo(
    () =>
      date
        ? getAvailableRangesForDate(date, allAvailableRanges)
        : allAvailableRanges,
    [allAvailableRanges, date],
  );

  const availableRangesKey = useMemo(
    () =>
      availableRanges
        .map(
          (range) =>
            `${range.start.id}-${range.end.id}-${range.from.toString()}-${range.to.toString()}-${range.daysOfWeek.join(",")}`,
        )
        .join("|"),
    [availableRanges],
  );

  const unavailableRanges = useMemo(
    () =>
      date
        ? getUnavailableRangesForDate(date, publicBookingsRef.current)
        : undefined,
    [date, publicBookingsKey],
  );

  const unavailableRangesKey = useMemo(
    () =>
      unavailableRanges
        ?.map((range) => `${range.start.id}-${range.end.id}`)
        .join("|") ?? "",
    [unavailableRanges],
  );

  const stableAvailableRanges = useMemo(
    () => availableRanges,
    [availableRangesKey],
  );

  const stableUnavailableRanges = useMemo(
    () => unavailableRanges,
    [unavailableRangesKey],
  );

  const didValidateInitialTimes = useRef(false);

  useEffect(() => {
    if (didValidateInitialTimes.current || !date || !start || !end) {
      return;
    }

    if (!allAvailableRanges.length) {
      return;
    }

    didValidateInitialTimes.current = true;

    const rangesForDate = getAvailableRangesForDate(date, allAvailableRanges);
    const isValid = isTimeRangeAvailable(
      start,
      end,
      rangesForDate,
      date,
      publicBookingsRef.current,
    );

    if (!isValid) {
      setDateStartEnd(date, null, null);
    }
  }, [
    allAvailableRanges,
    date,
    end,
    setDateStartEnd,
    start,
  ]);

  const handleDateChange = useCallback(
    (newDate: CalendarDate | null) => {
      let nextStart = start;
      let nextEnd = end;

      if (newDate && start && end) {
        const rangesForDate = getAvailableRangesForDate(
          newDate,
          allAvailableRanges,
        );
        const isTimeRangeValid = isTimeRangeAvailable(
          start,
          end,
          rangesForDate,
          newDate,
          publicBookingsRef.current,
        );

        if (!isTimeRangeValid) {
          nextStart = null;
          nextEnd = null;
        }
      }

      setDateStartEnd(newDate, nextStart, nextEnd);
      sendGAEvent("event", "Rinu_CustomClick", {
        Rinu_ScreenName: "/space",
        Rinu_ItemCategory: "Parametros",
        ...getGaPackSearchData(space, venue, packSearch),
        Rinu_eLabel5: newDate?.toString(),
      });
    },
    [
      allAvailableRanges,
      end,
      packSearch,
      setDateStartEnd,
      space,
      start,
      venue,
    ],
  );

  const handleTimeRangeChange = useCallback(
    (newStart: TimeDuration | null, newEnd: TimeDuration | null) => {
      setDateStartEnd(date, newStart, newEnd);
      sendGAEvent("event", "Rinu_CustomClick", {
        Rinu_ScreenName: "/space",
        Rinu_ItemCategory: "Parametros",
        ...getGaPackSearchData(space, venue, packSearch),
        Rinu_eLabel6: newStart
          ? `${newStart?.timeLabel}-${newEnd?.timeLabel}`
          : null,
      });
    },
    [date, packSearch, setDateStartEnd, space, venue],
  );

  const handleNumPeopleChange = useCallback(
    (value: number | undefined) => {
      const numPeople = value ?? null;
      setNumPeople(numPeople, () => {
        sendGAEvent("event", "Rinu_CustomClick", {
          Rinu_ScreenName: "/space",
          Rinu_ItemCategory: "Parametros",
          ...getGaPackSearchData(space, venue, packSearch),
          Rinu_eLabel7: numPeople,
        });
      });
    },
    [packSearch, setNumPeople, space, venue],
  );

  return (
    <div className={block()}>
      <div className={element("inputs")}>
        <InputDate
          label="Data"
          value={date}
          onChange={handleDateChange}
          showIcon={false}
          isDateUnavailable={isDateUnavailable}
          ref={refs.date}
        />
        <InputTimeRange
          label="Horas"
          start={start}
          end={end}
          onChange={handleTimeRangeChange}
          availableRanges={stableAvailableRanges}
          unavailableRanges={stableUnavailableRanges}
          ref={refs.startEnd}
        />
        <InputNumber
          label="Pessoas"
          value={numPeople ?? undefined}
          onChange={handleNumPeopleChange}
          allowNegative={false}
          decimalScale={0}
          ref={refs.persons}
        />
      </div>
    </div>
  );
};

export default PackSearch;

function getPackScheduleKey(allPacks: Pack[]) {
  const parts: string[] = [];

  for (const pack of allPacks) {
    parts.push(String(pack.noticeDays ?? 0));
    for (const price of pack.prices) {
      parts.push(`${price.from?.slice(0, 10) ?? ""}:${price.to?.slice(0, 10) ?? ""}`);
      for (const schedule of price.schedules) {
        parts.push(
          [
            schedule.start?.string ?? "",
            schedule.end?.string ?? "",
            schedule.daysOfWeek.join(","),
          ].join(":"),
        );
      }
    }
  }

  return parts.join("|");
}

const getAvailableRanges = (allPacks: Pack[]) => {
  return allPacks.flatMap((pack) =>
    pack.prices.flatMap((price) => {
      const from = safeParsePriceDate(price.from);
      const to = safeParsePriceDate(price.to);

      if (!from || !to) {
        return [];
      }

      return price.schedules
        .filter((schedule) => !!schedule.start && !!schedule.end)
        .map((schedule) => ({
          start: schedule.start!,
          end: schedule.end!,
          from: maxDate(
            from,
            today("Europe/Lisbon").add({ days: pack.noticeDays ?? 0 }),
          )!,
          to,
          daysOfWeek: schedule.daysOfWeek,
        }));
    }),
  );
};

function safeParsePriceDate(value: string | null | undefined) {
  if (!value?.trim()) return null;

  try {
    return parseDate(value.slice(0, 10));
  } catch {
    return null;
  }
}

type AvailableRanges = ReturnType<typeof getAvailableRanges>;

const getAvailableRangesForDate = (
  date: CalendarDate,
  availableRanges: AvailableRanges,
) => {
  const dayId = getDayOfWeekId(date);
  if (!dayId) return [];

  return availableRanges.filter(
    (schedule) =>
      date.compare(schedule.from) >= 0 &&
      date.compare(schedule.to) <= 0 &&
      schedule.daysOfWeek.includes(dayId),
  );
};

const getUnavailableRangesForDate = (
  date: CalendarDate,
  publicBookings: {
    start: TimeDuration | null;
    end: TimeDuration | null;
    date: CalendarDate;
  }[],
) => {
  return publicBookings
    .filter(
      (range) => !!range.start && !!range.end && date.compare(range.date) === 0,
    )
    .map((range) => ({
      start: range.start!,
      end: range.end!,
    }));
};

const getDayOfWeekId = (date: CalendarDate) => {
  const day = DAYS_OF_WEEK[getDayOfWeek(date, "pt-DE")];
  return day?.id;
};

const isTimeRangeAvailable = (
  start: TimeDuration,
  end: TimeDuration,
  availableRanges: AvailableRanges,
  date: CalendarDate,
  publicBookings: {
    start: TimeDuration | null;
    end: TimeDuration | null;
    date: CalendarDate;
  }[],
) => {
  const dayId = getDayOfWeekId(date);
  if (!dayId) return false;

  const rangesForDay = availableRanges.filter(
    (schedule) =>
      date.compare(schedule.from) >= 0 &&
      date.compare(schedule.to) <= 0 &&
      schedule.daysOfWeek.includes(dayId),
  );

  if (rangesForDay.length === 0) return false;

  const startAvailable = rangesForDay.some(
    (range) =>
      start.number >= range.start.number && start.number < range.end.number,
  );
  const endAvailable = rangesForDay.some(
    (range) => end.number > range.start.number && end.number <= range.end.number,
  );

  if (!startAvailable || !endAvailable) return false;

  const unavailableRanges = getUnavailableRangesForDate(date, publicBookings);

  return !unavailableRanges.some(
    (range) =>
      start.number < range.end.number && end.number > range.start.number,
  );
};

const getIsDateUnavailable = (
  date: CalendarDate,
  allPacks: Pack[],
  publicBookings: {
    start: TimeDuration | null;
    end: TimeDuration | null;
    date: CalendarDate;
  }[],
) => {
  const allAvailableRanges = getAvailableRanges(allPacks);

  if (allAvailableRanges.length === 0) {
    // If there is no available ranges at all, there must be something weird with the pack schedules or the algo here
    // In that case, let's not block any dates
    return false;
  }

  const availableRanges = getAvailableRangesForDate(date, allAvailableRanges);

  if (availableRanges.length === 0) {
    return true;
  }

  const unavailableRanges = getUnavailableRangesForDate(date, publicBookings);

  const availableHoursForBooking = scheduleStartEndOptions.filter((option) => {
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

    return isAvailable && !isUnavailable;
  });

  return availableHoursForBooking.length === 0;
};

export const getGaPackSearchData = (
  space: Space,
  venue: Venue,
  packSearch: PackSearchHook,
) => {
  if (space === undefined || venue === undefined || packSearch === undefined)
    return;
  return {
    Rinu_eLabel1: space.name,
    Rinu_eLabel2: venue.name,
    Rinu_eLabel3: space.id,
    Rinu_eLabel4: venue.id,
    Rinu_eLabel5: packSearch.date?.toString() ?? null,
    Rinu_eLabel6:
      packSearch.start && packSearch.end
        ? `${packSearch.start?.timeLabel}-${packSearch.end?.timeLabel}`
        : null,
    Rinu_eLabel7: packSearch.numPeople,
  };
};
