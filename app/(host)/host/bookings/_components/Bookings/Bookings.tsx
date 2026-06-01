"use client";

import Stack from "@/_design_system/Stack";
import BookingsTable from "./BookingsTable";
import VenueName from "@/(host)/host/_components/VenueName";
import { BookingWithRelations } from "../useBookingsList";

const Bookings = ({ bookings }: { bookings: BookingWithRelations[] }) => {
  return (
    <Stack gap="1.5rem">
      <VenueName venue={bookings[0].venue!} />
      <BookingsTable bookings={bookings} />
    </Stack>
  );
};

export default Bookings;
