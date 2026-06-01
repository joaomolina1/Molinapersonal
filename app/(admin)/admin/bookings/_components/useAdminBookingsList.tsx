import { BOOKING_KINDS, BookingKind } from "@/_constants/booking/kinds";
import { BOOKING_STATUSES, BookingStatus } from "@/_constants/booking/status";
import { DateRange } from "@/_design_system/InputDateRange";
import { Booking, useBookings } from "@/_models/booking";
import { Space, useAllSpaces } from "@/_models/space";
import { Venue, useVenues } from "@/_models/venue";
import { lowerCaseIncludes } from "@/_utils/text";
import { useState } from "react";
import { today, getLocalTimeZone } from "@internationalized/date";

const statusOptions = [
  { id: "all", text: "Todos os estados" },
  ...BOOKING_STATUSES.map(({ id, label }) => ({ id, text: label })),
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

export const useAdminBookingsList = () => {
  const [query, setQuery] = useState<string>("");
  const [venue, setVenue] = useState<string>("all");
  const [space, setSpace] = useState<string>("all");
  const [kind, setKind] = useState<BookingKind | "all">("all");
  const [status, setStatus] = useState<BookingStatus | "all">("all");
  const [dateRange, setDateRange] = useState<DateRange | null>({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone()).add({ weeks: 1 }),
  });

  const { data: venues = [], isFetching: isFetchingVenues } = useVenues();
  const { data: spaces = [], isFetching: isFetchingSpaces } = useAllSpaces();
  const { data: bookings = [], isFetching: isFetchingBookings } = useBookings({
    date_from: dateRange?.start.toString(),
    date_to: dateRange?.end.toString(),
  });

  const activeVenues = venues.filter((venue) => venue.status === "active");

  const venueOptions = [
    {
      id: "all",
      text: "Todos os locais",
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
      text: "Todos os espaços",
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

  const isFetching = isFetchingVenues || isFetchingSpaces || isFetchingBookings;

  return {
    bookings: bookingsWithRelations,
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
    isFetching,
  };
};

export type AdminBookingsList = ReturnType<typeof useAdminBookingsList>;
