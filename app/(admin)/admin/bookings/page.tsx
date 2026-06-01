"use client";

import BookingsHeader from "@/(host)/host/bookings/_components/BookingsHeader";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { useAdminBookingsList } from "./_components/useAdminBookingsList";
import AdminBookingsTable from "./_components/AdminBookingsTable";
import EmptyState from "@/_components/EmptyState";

export default function AdminBookings() {
  const bookingsList = useAdminBookingsList();

  return (
    <Stack gap="2.5rem">
      <Stack gap="1rem">
        <TextBlock title="Reservas" />
        <Stack gap="2.5rem">
          <BookingsHeader bookingsList={bookingsList} />
          {bookingsList.bookings.length > 0 ? (
            <AdminBookingsTable bookingsList={bookingsList} />
          ) : (
            <EmptyState
              text={{
                body: "Nenhuma reserva encontrada para os filtros escolhidos",
              }}
            />
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
