"use client";

import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import BookingCard from "./_components/BookingCard";
import { useBookings } from "@/_models/booking";
import { today } from "@internationalized/date";
import EmptyState from "@/_components/EmptyState";
import { TextButton } from "@/_design_system/Button";
import { useSession } from "@/_services/session";

export default function ClientBookings() {
  const [session] = useSession();

  const { data: bookings, isLoading: isLoadingBookings } = useBookings();

  if (isLoadingBookings || !bookings) {
    return null;
  }

  const clientBookings = bookings.filter(
    (booking) =>
      booking.kind === "internal" && booking.userID === session?.user_id,
  );

  const futureBookings = clientBookings.filter(
    (booking) => booking.date.compare(today("Europe/Lisbon")) >= 0,
  );

  const pastBookings = clientBookings.filter(
    (booking) => booking.date.compare(today("Europe/Lisbon")) < 0,
  );

  return (
    <Stack gap="1.5rem">
      <TextBlock title="Reservas" />

      {clientBookings.length === 0 && (
        <EmptyState
          text={{
            subtitle: "Ainda não tem reservas agendadas connosco",
            body: (
              <>
                Comece agora <TextButton text="a sua pesquisa" href="/search" />
              </>
            ),
          }}
        />
      )}

      {clientBookings.length > 0 && (
        <Stack gap="2.5rem">
          <Stack gap="1.5rem">
            <TextBlock subtitle="Próximas reservas" />

            {futureBookings.length === 0 && (
              <EmptyState
                text={{
                  subtitle:
                    "O último evento foi um sucesso, mas ainda não sabemos qual vai ser o próximo",
                  body: (
                    <>
                      Vamos continuar a criar momentos memoráveis? Comece agora{" "}
                      <TextButton text="a sua pesquisa" href="/search" />
                    </>
                  ),
                }}
              />
            )}

            {futureBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                variant="future"
              />
            ))}
          </Stack>

          {pastBookings.length > 0 && (
            <Stack gap="1.5rem">
              <TextBlock subtitle="Histórico" />
              {pastBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  variant="past"
                />
              ))}
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );
}
