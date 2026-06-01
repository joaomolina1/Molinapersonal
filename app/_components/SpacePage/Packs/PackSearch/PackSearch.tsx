import { createBEMClasses } from "@/_utils/classname";
import { useCallback, useMemo, useRef, useState } from "react";
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
import { useSearchParamsArrayState } from "@/_services/searchParams";

export const usePackSearch = () => {
  const { date, start, end, setDateStartEnd } = useDateStartEnd();
  const { numPeople, numPeopleDebounced, setNumPeople } = useNumPeople();
  const [extras, setExtras] = useSearchParamsArrayState<string>("extra");
  const [extraParams, setExtraParamsState] = useState<
    Record<string, { hours?: number; pax?: number }>
  >({});

  const setExtraParams = useCallback(
    (
      value:
        | Record<string, { hours?: number; pax?: number }>
        | ((
            prev: Record<string, { hours?: number; pax?: number }>,
          ) => Record<string, { hours?: number; pax?: number }>),
    ) => {
      setExtraParamsState(value);
    },
    [],
  );

  const [dateRef, dateScrollIntoView] =
    useScrollIntoView<HTMLDivElement>(false);
  const startEndRef = useRef<HTMLButtonElement>(null);
  const numPeopleRef = useRef<HTMLInputElement>(null);

  const focusOnUnfilledInput = () => {
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
      return;
    }
  };

  const scrollIntoView = () => {
    dateScrollIntoView();
  };

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

  const isDateUnavailable = useCallback(
    (date: CalendarDate) =>
      getIsDateUnavailable(date, allPacks, publicBookings),
    [allPacks, publicBookings],
  );

  const allAvailableRanges = useMemo(
    () => getAvailableRanges(allPacks),
    [allPacks],
  );

  const availableRanges = useMemo(
    () =>
      date
        ? getAvailableRangesForDate(date, allAvailableRanges)
        : allAvailableRanges,
    [allAvailableRanges, date],
  );

  const unavailableRanges = useMemo(
    () =>
      date ? getUnavailableRangesForDate(date, publicBookings) : undefined,
    [date, publicBookings],
  );

  const handlePackDateSearch = (newDate: CalendarDate | null) => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: "/space",
      Rinu_ItemCategory: "Parametros",
      ...getGaPackSearchData(space, venue, packSearch),
      Rinu_eLabel5: newDate?.toString(),
    });
  };

  const handlePackTimeRangeSearch = (
    newStart: TimeDuration | null,
    newEnd: TimeDuration | null,
  ) => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: "/space",
      Rinu_ItemCategory: "Parametros",
      ...getGaPackSearchData(space, venue, packSearch),
      Rinu_eLabel6: newStart
        ? `${newStart?.timeLabel}-${newEnd?.timeLabel}`
        : null,
    });
  };

  const handlePackNumberSearch = (numPeople: number | null) => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: "/space",
      Rinu_ItemCategory: "Parametros",
      ...getGaPackSearchData(space, venue, packSearch),
      Rinu_eLabel7: numPeople,
    });
  };

  return (
    <div className={block()}>
      <div className={element("inputs")}>
        <InputDate
          label="Data"
          value={date}
          onChange={(newDate) => {
            setDateStartEnd(newDate, start, end);
            handlePackDateSearch(newDate);
          }}
          showIcon={false}
          isDateUnavailable={isDateUnavailable}
          ref={refs.date}
        />
        <InputTimeRange
          label="Horas"
          start={start}
          end={end}
          onChange={(newStart, newEnd) => {
            setDateStartEnd(date, newStart, newEnd);
            handlePackTimeRangeSearch(newStart, newEnd);
          }}
          availableRanges={availableRanges}
          unavailableRanges={unavailableRanges}
          ref={refs.startEnd}
        />
        <InputNumber
          label="Pessoas"
          value={numPeople ?? undefined}
          onChange={(numPeople) => {
            setNumPeople(numPeople ?? null, () =>
              handlePackNumberSearch(numPeople ?? null),
            );
          }}
          allowNegative={false}
          decimalScale={0}
          ref={refs.persons}
        />
      </div>
    </div>
  );
};

export default PackSearch;

const getAvailableRanges = (allPacks: Pack[]) => {
  return allPacks.flatMap((pack) =>
    pack.prices.flatMap((price) =>
      price.schedules
        .filter((schedule) => !!schedule.start && !!schedule.end)
        .map((schedule) => ({
          start: schedule.start!,
          end: schedule.end!,
          from: maxDate(
            parseDate(price.from.slice(0, 10)),
            today("Europe/Lisbon").add({ days: pack.noticeDays ?? 0 }),
          )!,
          to: parseDate(price.to.slice(0, 10)),
          daysOfWeek: schedule.daysOfWeek,
        })),
    ),
  );
};

type AvailableRanges = ReturnType<typeof getAvailableRanges>;

const getAvailableRangesForDate = (
  date: CalendarDate,
  availableRanges: AvailableRanges,
) => {
  return availableRanges.filter(
    (schedule) =>
      date.compare(schedule.from) >= 0 &&
      date.compare(schedule.to) <= 0 &&
      schedule.daysOfWeek.includes(
        DAYS_OF_WEEK[getDayOfWeek(date, "pt-DE")].id,
      ),
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
