"use client";

import Button, { IconButton } from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import IconUserInterfaceNavigationArrowLeft from "@/_design_system/_icons/UserInterface/Navigation/ArrowLeft.svg";
import IconUserInterfaceNavigationArrowRight from "@/_design_system/_icons/UserInterface/Navigation/ArrowRight.svg";
import IllustrationNoData from "@/_design_system/_illustrations/NoData.svg";
import { Booking, useBookings } from "@/_models/booking";
import { usePack } from "@/_models/pack";
import { useAllSpaces, useSpace } from "@/_models/space";
import { useVenue } from "@/_models/venue";
import { createBEMClasses } from "@/_utils/classname";
import { formatDate } from "@/_utils/date";
import { isToday, today, getLocalTimeZone } from "@internationalized/date";
import {
  Calendar as AriaCalendar,
  CalendarCell as AriaCalendarCell,
  CalendarGrid as AriaCalendarGrid,
  Heading as AriaHeading,
  I18nProvider as AriaI18nProvider,
  CalendarGridHeader as AriaCalendarGridHeader,
  CalendarHeaderCell as AriaCalendarHeaderCell,
  CalendarGridBody as AriaCalendarGridBody,
} from "react-aria-components";

const { block, element } = createBEMClasses("host-dashboard-calendar");

const Calendar = () => {
  const { data: spaces = [] } = useAllSpaces();
  const { data: bookings = [] } = useBookings(
    { space_id: spaces.map((space) => space.id) },
    { enabled: spaces.length > 0 },
  );

  const calendarBookings = bookings.filter(
    (booking) => booking.kind !== "block" && booking.status === "confirmed",
  );

  const twoFutureBookings = calendarBookings
    .filter((booking) => booking.date.compare(today("Europe/Lisbon")) >= 0)
    .slice(0, 2);

  const otherBookings = calendarBookings.filter(
    (booking) =>
      !twoFutureBookings.find(
        (futureBooking) => futureBooking.id === booking.id,
      ),
  );

  return (
    <div className={block()}>
      {/* pt-DE shows portuguese text with the week starting on monday */}
      <AriaI18nProvider locale="pt-DE">
        <AriaCalendar className={element("calendar")}>
          <header>
            <IconButton
              icon={<IconUserInterfaceNavigationArrowLeft />}
              slot="previous"
              ariaLabel="Anterior"
            />
            <AriaHeading />
            <IconButton
              icon={<IconUserInterfaceNavigationArrowRight />}
              slot="next"
              ariaLabel="Seguinte"
            />
          </header>
          <AriaCalendarGrid weekdayStyle="short">
            <AriaCalendarGridHeader>
              {(weekDay) => (
                <AriaCalendarHeaderCell>
                  {weekDay.slice(0, 3)}
                </AriaCalendarHeaderCell>
              )}
            </AriaCalendarGridHeader>
            <AriaCalendarGridBody>
              {(date) => (
                <AriaCalendarCell
                  date={date}
                  className={element("calendar__day", {
                    "has-booking": calendarBookings.some(
                      (booking) => booking.date.compare(date) === 0,
                    ),
                    today: isToday(date, "Europe/Lisbon"),
                  })}
                />
              )}
            </AriaCalendarGridBody>
          </AriaCalendarGrid>
        </AriaCalendar>
      </AriaI18nProvider>
      <Stack gap="1.5rem" className={element("next")}>
        <h4>Próximas reservas</h4>

        {twoFutureBookings.map((booking) => (
          <NextBooking key={booking.id} booking={booking} />
        ))}

        {!twoFutureBookings.length && (
          <EmptyState hasOtherBookings={!!otherBookings.length} />
        )}

        <Stack row alignItems="center" justifyContent="space-between">
          {!!otherBookings.length && (
            <p className={element("next__more")}>
              +{otherBookings.length} reservas
            </p>
          )}
          <Button
            label="Ver reservas"
            rightIcon={<IconUserInterfaceNavigationArrowRight />}
            type="link"
            href="/host/bookings"
            style={{ marginLeft: "auto" }}
          />
        </Stack>
      </Stack>
    </div>
  );
};

const NextBooking = ({ booking }: { booking: Booking }) => {
  const { data: pack } = usePack(booking.packID);
  const { data: space } = useSpace(booking.spaceID);
  const { data: venue } = useVenue(space?.venueID);

  const numPeopleString =
    booking.numPeople === 0
      ? null
      : booking.numPeople === 1
        ? `${booking.numPeople} pessoa`
        : `${booking.numPeople} pessoas`;

  return (
    <Stack gap="1rem" row alignItems="center">
      <Stack
        alignItems="center"
        justifyContent="center"
        className={element("next__date")}
      >
        <span className={element("next__date__weekday")}>
          {formatDate(booking.date.toDate(getLocalTimeZone()), {
            weekday: "short",
          }).slice(0, 3)}
        </span>
        <span className={element("next__date__day")}>{booking.date.day}</span>
      </Stack>
      <Stack gap="0.5rem">
        <div>
          <span className={element("next__title")}>
            {booking.contactName || "-"}
          </span>
          <p className={element("next__pack")}>
            {booking.kind === "internal"
              ? pack?.name
              : booking.kindWording.labelCalendar}
          </p>
          <p className={element("next__space")}>{space?.name}</p>
        </div>
        <p className={element("next__details")}>
          {!!numPeopleString && <>{numPeopleString} • </>}
          <span>{venue?.name}</span>
        </p>
      </Stack>
    </Stack>
  );
};

const EmptyState = ({ hasOtherBookings }: { hasOtherBookings: boolean }) => (
  <Stack gap="2.5rem" className={element("empty-state")}>
    <IllustrationNoData />
    <Stack gap="1rem">
      <p>
        Ainda não tem {hasOtherBookings ? "novas" : undefined} reservas
        agendadas connosco
      </p>
      <p>A nossa equipa está a trabalhar para conseguirmos novos clientes</p>
    </Stack>
  </Stack>
);

export default Calendar;
