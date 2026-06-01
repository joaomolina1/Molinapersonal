import { BOOKING_KINDS, BookingKind } from "@/_constants/booking/kinds";
import { BOOKING_STATUSES, BookingStatus } from "@/_constants/booking/status";
import { DateRange } from "@/_design_system/InputDateRange";
import { Booking, useBookings } from "@/_models/booking";
import { Space, useAllSpaces } from "@/_models/space";
import { Venue, useVenues } from "@/_models/venue";
import { lowerCaseIncludes } from "@/_utils/text";
import { useState } from "react";
import { today, getLocalTimeZone, parseDate } from "@internationalized/date";
import { useSearchParams } from "next/navigation";

const statusOptions = [
  { id: "all", text: "Todos os estados" },
  ...BOOKING_STATUSES.filter(({ displayToHost }) => displayToHost).map(
    ({ id, label }) => ({ id, text: label }),
  ),
] as const;

const kindOptions = [
  { id: "all", text: "Todos os tipos" },
  ...BOOKING_KINDS.map(({ id, labelTable }) => ({ id, text: labelTable })),
] as const;

export type BookingWithRelations = {
  booking: Booking;
  venue?: Venue;
  space?: Space;
};

export const useBookingsList = () => {
  const searchParams = useSearchParams();
  const bookingDateString = searchParams.get("bookingDate");
  const bookingDate = bookingDateString ? parseDate(bookingDateString) : null;

  const [query, setQuery] = useState<string>("");
  const [venue, setVenue] = useState<string>("all");
  const [space, setSpace] = useState<string>("all");
  const [kind, setKind] = useState<BookingKind | "all">("all");
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange | null>(
    bookingDate
      ? {
          start: bookingDate,
          end: bookingDate,
        }
      : {
          start: today(getLocalTimeZone()),
          end: today(getLocalTimeZone()).add({ years: 1 }),
        },
  );

  const { data: venues = [] } = useVenues();
  const { data: spaces = [] } = useAllSpaces();
  const { data: bookings = [], isFetching } = useBookings(
    {
      space_id: spaces.map((space) => space.id),
      date_from: dateRange?.start.toString(),
      date_to: dateRange?.end.toString(),
    },
    { enabled: spaces.length > 0 },
  );

  const activeVenues = venues.filter((venue) => venue.status === "active");

  const venueOptions = [
    {
      id: "all",
      text: "Todos os locais e empresas",
    },
    ...activeVenues.map((venue) => ({
      id: venue.id,
      text: venue.name || `Sem nome (${venue.reference})`,
    })),
  ];

  const spacesForActiveVenues = spaces.filter(
    ({ venueID }) => !!activeVenues.find(({ id }) => venueID === id),
  );

  const spacesForVenue =
    venue === "all"
      ? spacesForActiveVenues
      : spacesForActiveVenues.filter((space) => space.venueID === venue);

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

  const queryFilter = (item: BookingWithRelations) =>
    lowerCaseIncludes(item.booking.id, query) ||
    lowerCaseIncludes(item.venue?.name || "", query) ||
    lowerCaseIncludes(item.space?.name || "", query) ||
    lowerCaseIncludes(item.booking.billingName, query) ||
    lowerCaseIncludes(item.booking.contactName, query) ||
    lowerCaseIncludes(item.booking.contactEmail, query) ||
    lowerCaseIncludes(item.booking.contactPhoneNumber.toString(), query);

  const venueFilter = (item: BookingWithRelations) =>
    venue === "all" || venue === item.venue?.id;

  const spaceFilter = (item: BookingWithRelations) =>
    space === "all" || space === item.space?.id;

  const kindFilter = (item: BookingWithRelations) =>
    kind === "all" || kind === item.booking.kind;

  const statusFilter = (item: BookingWithRelations) =>
    status === "all" || status === item.booking.status;

  const bookingsWithRelations = bookings
    .map((booking) => {
      const space = spaces.find(({ id }) => id === booking.spaceID);
      const venue = venues.find(({ id }) => id === space?.venueID);

      return {
        booking,
        space,
        venue,
      };
    })
    .filter(queryFilter)
    .filter(venueFilter)
    .filter(spaceFilter)
    .filter(kindFilter)
    .filter(statusFilter);

  const bookingsByVenue = bookingsWithRelations.reduce<
    Record<string, BookingWithRelations[]>
  >((acc, curr) => {
    if (curr.venue?.id) {
      if (acc[curr.venue.id]) {
        acc[curr.venue.id].push(curr);
      } else {
        acc[curr.venue.id] = [curr];
      }
    }

    return acc;
  }, {});

  return {
    totalUnfilteredBookings: bookings.length,
    isFetching,
    bookings: bookingsWithRelations,
    bookingsByVenue,
    query,
    setQuery,
    venue,
    setVenue,
    venueOptions,
    space,
    setSpace,
    spaceOptions,
    status,
    setStatus,
    statusOptions,
    kind,
    setKind,
    kindOptions,
    dateRange,
    setDateRange,
  };
};

export type BookingsList = ReturnType<typeof useBookingsList>;
