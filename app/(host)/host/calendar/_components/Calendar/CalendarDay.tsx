import Stack from "@/_design_system/Stack";
import { CalendarList } from "../useCalendarList";
import { createBEMClasses } from "@/_utils/classname";
import { formatDate } from "@/_utils/date";
import { getLocalTimeZone } from "@internationalized/date";
import { usePack } from "@/_models/pack";
import Tag from "@/_design_system/Tag";
import Button, { IconButton } from "@/_design_system/Button";
import IconUserInterfaceActionsAdd from "@/_design_system/_icons/UserInterface/Actions/Add.svg";
import Tooltip from "@/_design_system/Tooltip";
import NewHostBookingModal from "./NewHostBookingModal";
import { useState } from "react";
import IconUserInterfaceMiscellaneousInfo from "@/_design_system/_icons/UserInterface/Miscellaneous/Info.svg";
import IconUserInterfaceNavigationArrowRight from "@/_design_system/_icons/UserInterface/Navigation/ArrowRight.svg";
import BookingEditNotesModal from "@/_components/BookingEditNotesModal";
import IconUserInterfaceActionsEdit from "@/_design_system/_icons/UserInterface/Actions/Edit.svg";
import IconSpacesCategoryExclusive from "@/_design_system/_icons/Spaces/Category/Exclusive.svg";
import { useSpaceIcals } from "@/_models/ical";

const { block, element } = createBEMClasses("host-calendar-day");

const CalendarDay = ({
  spaceID,
  date,
}: {
  spaceID: string;
  date: CalendarList["venues"][number]["spaces"][number]["weeks"][number]["dates"][number];
}) => {
  const [isOpenNewBookingModal, setIsOpenNewBookingModal] = useState(false);

  return (
    <>
      <Stack gap="1rem" className={block()}>
        <Stack
          row
          gap="0.25rem"
          alignItems="center"
          justifyContent="space-between"
          className={element("header")}
        >
          <h6>
            {formatDate(date.date.toDate(getLocalTimeZone()), {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </h6>
          {!date.isHostBookingBlocked && (
            <Tooltip content="Adicionar reserva">
              <Button
                leftIcon={<IconUserInterfaceActionsAdd />}
                type="secondary"
                onClick={() => setIsOpenNewBookingModal(true)}
              />
            </Tooltip>
          )}
        </Stack>
        {date.bookings.map((booking) => (
          <BookingCard key={booking.booking.id} booking={booking} />
        ))}
      </Stack>
      <NewHostBookingModal
        isOpen={isOpenNewBookingModal}
        setIsOpen={setIsOpenNewBookingModal}
        spaceID={spaceID}
        date={date}
      />
    </>
  );
};

const BookingCard = ({
  booking,
}: {
  booking: CalendarList["venues"][number]["spaces"][number]["weeks"][number]["dates"][number]["bookings"][number];
}) => {
  const { data: pack } = usePack(booking.booking.packID);

  const { data: icals } = useSpaceIcals(booking.booking.spaceID, {
    enabled: booking.booking.kind === "integration",
  });

  const importIcal = icals?.imports?.find(
    (ical) => ical.id === booking.booking.source,
  );

  const [isOpenNotesTooltip, setIsOpenNotesTooltip] = useState(false);
  const [isOpenEditNotesModal, setIsOpenEditNotesModal] = useState(false);

  return (
    <Stack className={element("booking")} row gap="0.5rem" alignItems="center">
      <Stack gap="0.5rem" style={{ flex: 1 }}>
        <div>
          <p className={element("booking__name")}>
            {booking.booking.kind === "internal"
              ? pack?.name
              : booking.booking.kindWording.labelCalendar}
          </p>
          <p className={element("booking__time")}>
            {booking.date.start.timeLabel} - {booking.date.end.timeLabel}
          </p>
        </div>
        <Stack row gap="0.5rem" flexWrap="wrap">
          {booking.booking.kind === "internal" ? (
            <Tag
              iconLeft={<IconSpacesCategoryExclusive />}
              type="info"
              size="small"
            />
          ) : booking.booking.kind === "integration" ? (
            <Tag text={importIcal?.name} type="neutral-2" size="small" />
          ) : (
            <Tag text="Manual" type="neutral-2" size="small" />
          )}
          <Tag
            text={booking.booking.statusWording.label}
            type={booking.booking.statusWording.tagType}
            size="small"
          />
          {!!booking.booking.notes && (
            <>
              <Tooltip
                content={
                  <Stack gap="0.25rem" className={element("booking__note")}>
                    <span>Nota interna</span>
                    <Stack row gap="0.25rem" justifyContent="space-between">
                      <p>{booking.booking.notes}</p>
                      <IconButton
                        style={{ fontSize: "1rem" }}
                        icon={<IconUserInterfaceActionsEdit />}
                        onClick={() => {
                          setIsOpenNotesTooltip(false);
                          setIsOpenEditNotesModal(true);
                        }}
                        ariaLabel="Editar nota interna"
                        showTooltip={false}
                      />
                    </Stack>
                  </Stack>
                }
                visibleOnTouchDevice
                openOnlyOnClick
                visible={isOpenNotesTooltip}
                setVisible={setIsOpenNotesTooltip}
              >
                <IconButton
                  style={{ fontSize: "1.25rem" }}
                  icon={<IconUserInterfaceMiscellaneousInfo />}
                  ariaLabel="Ver nota interna"
                  showTooltip={false}
                />
              </Tooltip>
              <BookingEditNotesModal
                isOpen={isOpenEditNotesModal}
                setIsOpen={setIsOpenEditNotesModal}
                booking={booking.booking}
              />
            </>
          )}
        </Stack>
      </Stack>
      <IconButton
        ariaLabel="Ver reserva"
        icon={<IconUserInterfaceNavigationArrowRight />}
        style={{ fontSize: "1rem" }}
        href={`/host/bookings?fromBookingID=${booking.booking.id}&bookingDate=${booking.booking.date.toString()}`}
      />
    </Stack>
  );
};

export default CalendarDay;
