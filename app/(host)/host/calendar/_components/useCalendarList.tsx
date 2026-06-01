import { useAllSpaces, useSpacesAvailabilities } from "@/_models/space";
import { useVenues } from "@/_models/venue";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { useState } from "react";
import {
  today,
  startOfWeek,
  getLocalTimeZone,
  CalendarDate,
} from "@internationalized/date";
import { useBookings } from "@/_models/booking";
import { scheduleStartEndOptions } from "@/(onboarding)/onboarding/_components/Step4/Prices/Price";

export const useCalendarList = () => {
  const isMobile = useMediaQuery("small");
  const isLarge = useMediaQuery("large");
  const weekSpan = isMobile ? [0] : isLarge ? [0, 1] : [0, 1, 2];

  const [venue, setVenue] = useState<string>("all");
  const [space, setSpace] = useState<string>("all");
  const [baseDate, setBaseDate] = useState<CalendarDate>(
    startOfWeek(today(getLocalTimeZone()), "fr"),
  );

  const dates = weekSpan.flatMap((week) =>
    [0, 1, 2, 3, 4, 5, 6].map((weekday) =>
      baseDate.add({ days: weekday + week * 7 }),
    ),
  );

  const { data: allVenues = [], isPending: isPendingVenues } = useVenues();
  const { data: allSpaces = [], isPending: isPendingSpaces } = useAllSpaces();

  const activeVenues = allVenues.filter((venue) => venue.status === "active");

  const activeSpacesForActiveVenues = allSpaces
    .filter((space) => space.status === "active")
    .filter(({ venueID }) => !!activeVenues.find(({ id }) => venueID === id));

  const activeVenuesWithActiveSpaces = activeVenues.filter(
    (venue) =>
      !!activeSpacesForActiveVenues.find((space) => space.venueID === venue.id),
  );

  const venueOptions = [
    {
      id: "all",
      text: "Todos os locais e empresas",
    },
    ...activeVenuesWithActiveSpaces.map((venue) => ({
      id: venue.id,
      text: venue.name || `Sem nome (${venue.reference})`,
    })),
  ];

  const { data: allBookings = [], isPending: isPendingBookings } = useBookings(
    {
      space_id: activeSpacesForActiveVenues.map((space) => space.id),
      // Imported bookings start at 24h of the previous day and cover several days of the following days
      // To catch those, we give some margin on the date filter
      date_from: dates[0]?.subtract({ days: 30 }).toString(),
      date_to: dates.at(-1)?.add({ days: 1 }).toString(),
    },
    { enabled: activeSpacesForActiveVenues.length > 0 },
  );

  const spaceAvailabilityQueries = useSpacesAvailabilities(
    activeSpacesForActiveVenues.map((space) => space.id),
    {
      from: dates[0].toString(),
      to: dates.at(-1)!.add({ days: 1 }).toString(),
    },
  );

  const isPendingAvailabilities = spaceAvailabilityQueries.some(
    (query) => query.isPending,
  );

  const spacesAvailabilities = spaceAvailabilityQueries.map((query, index) => ({
    spaceID: activeSpacesForActiveVenues[index].id,
    availabilities: query.data ?? [],
  }));

  const spacesForVenue =
    venue === "all"
      ? activeSpacesForActiveVenues
      : activeSpacesForActiveVenues.filter((space) => space.venueID === venue);

  const spaceOptions = [
    {
      id: "all",
      text: "Todos os espaços e serviços",
    },
    ...spacesForVenue.map((space) => ({
      id: space.id,
      text: space.name || `Sem nome (${space.reference})`,
    })),
  ];

  const filteredVenues = activeVenuesWithActiveSpaces.filter(
    ({ id }) => venue === "all" || id === venue,
  );

  const filteredSpaces = spacesForVenue.filter(
    ({ id }) => space === "all" || id === space,
  );

  const venues = filteredVenues.map((venue) => ({
    venue,
    spaces: filteredSpaces
      .filter((space) => space.venueID === venue.id)
      .map((space) => ({
        space,
        weeks: weekSpan.map((week) => ({
          week,
          dates: dates.slice(week * 7, (week + 1) * 7).map((date) => {
            const bookings = allBookings
              .filter(
                (booking) =>
                  booking.spaceID === space.id &&
                  !!booking.dates.find(
                    (bookingDate) => bookingDate.date.compare(date) === 0,
                  ),
              )
              .map((booking) => ({
                booking,
                date: booking.dates.find(
                  (bookingDate) => bookingDate.date.compare(date) === 0,
                )!,
              }));

            const confirmedBookings = bookings.filter(
              (booking) => booking.booking.status === "confirmed",
            );

            const packHours =
              spacesAvailabilities
                .find(({ spaceID }) => spaceID === space.id)
                ?.availabilities.find(
                  (availability) => availability.date.compare(date) === 0,
                )?.hours ?? [];

            const availableHoursForInternalBooking =
              scheduleStartEndOptions.filter((hour) => {
                const isHourInPackHours = !!packHours.find(
                  (packHour) =>
                    !!packHour.from &&
                    !!packHour.to &&
                    hour.number >= packHour.from.number &&
                    hour.number < packHour.to.number,
                );

                const isHourBooked = !!confirmedBookings.find(
                  (booking) =>
                    hour.number >= booking.date.start.number - 0.5 &&
                    hour.number <= booking.date.end.number,
                );

                return isHourInPackHours && !isHourBooked;
              });

            const bookingsForHostBookingBlock = bookings.filter(
              (booking) =>
                booking.booking.statusWording.blocksOtherBookings &&
                !!booking.date.start &&
                !!booking.date.end,
            );

            const availableHoursForHostBooking = scheduleStartEndOptions.filter(
              (hour) => {
                const isHourBooked = !!bookingsForHostBookingBlock.find(
                  (booking) =>
                    hour.number >= booking.date.start.number - 0.5 &&
                    hour.number <= booking.date.end.number,
                );

                return !isHourBooked;
              },
            );

            const unavailableRangesForHostBooking =
              bookingsForHostBookingBlock.map((booking) => ({
                start: booking.date.start,
                end: booking.date.end,
              }));

            const bookingsForCount = bookings.filter(
              (booking) =>
                booking.booking.kind !== "block" &&
                (booking.booking.status === "confirmed" ||
                  booking.booking.status === "preConfirmed"),
            );

            const bookingsCount = bookingsForCount.length;
            const isInternalBookingBlocked =
              availableHoursForInternalBooking.length === 0;
            const isHostBookingBlocked =
              availableHoursForHostBooking.length === 0;

            return {
              date,
              bookings,
              bookingsCount,
              isInternalBookingBlocked,
              isHostBookingBlocked,
              unavailableRangesForHostBooking,
            };
          }),
        })),
      })),
  }));

  return {
    venue,
    setVenue,
    venueOptions,
    space,
    setSpace,
    spaceOptions,
    baseDate,
    setBaseDate,
    dates,
    weekSpan,
    venues,
    viewNextWeek: () => {
      setBaseDate(baseDate.add({ weeks: 1 }));
    },
    viewPreviousWeek: () => {
      setBaseDate(baseDate.add({ weeks: -1 }));
    },
    isPendingRows: isPendingSpaces || isPendingVenues,
    isPendingDetails: isPendingAvailabilities || isPendingBookings,
  };
};

export type CalendarList = ReturnType<typeof useCalendarList>;
