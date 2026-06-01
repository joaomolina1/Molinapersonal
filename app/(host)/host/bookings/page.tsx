"use client";

import Stack from "@/_design_system/Stack";
import Bookings from "./_components/Bookings";
import BookingsHeader from "./_components/BookingsHeader";
import { useBookingsList } from "./_components/useBookingsList";
import EmptyState from "@/_components/EmptyState";
import TextBlock from "@/_design_system/TextBlock";

export default function HostBookings() {
  const bookingsList = useBookingsList();

  return (
    <Stack gap="1rem">
      <TextBlock title="Reservas" />
      <Stack gap="2.5rem">
        <BookingsHeader bookingsList={bookingsList} />
        {bookingsList.bookings.length > 0 ? (
          <Stack gap="1.5rem">
            {Object.keys(bookingsList.bookingsByVenue).map((venueID) => (
              <Bookings
                key={venueID}
                bookings={bookingsList.bookingsByVenue[venueID]}
              />
            ))}
          </Stack>
        ) : (
          <EmptyState
            text={
              bookingsList.totalUnfilteredBookings === 0
                ? {
                    subtitle: "Ainda não tem reservas agendadas connosco",
                    body: "A nossa equipa está a trabalhar para conseguirmos novos clientes",
                  }
                : {
                    body: "Nenhuma reserva encontrada para os filtros escolhidos",
                  }
            }
          />
        )}
      </Stack>
    </Stack>
  );
}
