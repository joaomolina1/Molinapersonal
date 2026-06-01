"use client";

import ValueWithLabel from "@/(host)/_components/ValueWithLabel";
import Button, { IconButton, StylelessButton } from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import Tag from "@/_design_system/Tag";
import IconUserInterfaceActionsCancel from "@/_design_system/_icons/UserInterface/Actions/Cancel.svg";
import IconUserInterfaceNavigationArrowDown from "@/_design_system/_icons/UserInterface/Navigation/ArrowDown.svg";
import IconUserInterfaceNavigationArrowUp from "@/_design_system/_icons/UserInterface/Navigation/ArrowUp.svg";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { useCallback, useState } from "react";
import { MenuTrigger, Popover } from "react-aria-components";
import { BookingWithRelations } from "../../useBookingsList";
import EmptyState from "@/_components/EmptyState";
import { formatDate } from "@/_utils/date";
import { getLocalTimeZone, today } from "@internationalized/date";
import { formatMoney } from "@/_utils/number";
import { Pack, usePack } from "@/_models/pack";
import { BookingBillingContent } from "@/_components/BookingDetails";
import BookingCancellationModal from "@/_components/BookingCancellationModal";
import { useSearchParams } from "next/navigation";
import IconUserInterfaceActionsEdit from "@/_design_system/_icons/UserInterface/Actions/Edit.svg";
import BookingEditNotesModal from "@/_components/BookingEditNotesModal";
import {
  Booking,
  doBookingsOverlap,
  useUpdateBooking,
} from "@/_models/booking";
import { useSession } from "@/_services/session";
import IconUserInterfaceActionsShow from "@/_design_system/_icons/UserInterface/Actions/Show.svg";
import BookingDetailsModal from "@/_components/BookingDetailsModal";
import IconUserInterfaceMiscellaneousLoading from "@/_design_system/_icons/UserInterface/Miscellaneous/Loading.svg";
import Dropdown from "@/_design_system/InputSelect/Dropdown";
import { BOOKING_STATUSES } from "@/_constants/booking/status";
import {
  Cell,
  Column,
  ExpandableRow,
  ExpandableRowProvider,
  ExpandedRow,
  ExpandedRowMainCell,
  ExpandIconCell,
  Table,
  TableBody,
  TableHeader,
  TableWrapper,
} from "@/_design_system/Table";
import { useSpaceIcals } from "@/_models/ical";
import CopyIconButton from "@/_components/CopyIconButton";

const { block, element } = createBEMClasses("bookings-table");

const BookingsTable = ({ bookings }: { bookings: BookingWithRelations[] }) => {
  const isMobile = useMediaQuery("large");

  const searchParams = useSearchParams();
  const fromBookingID = searchParams.get("fromBookingID");

  if (!bookings?.length) {
    return (
      <EmptyState
        text={{
          subtitle: "Sem reservas associados",
          body: "Este local não tem reservas associados",
        }}
        withBorder
      />
    );
  }

  if (isMobile) {
    return (
      <Stack gap="1rem">
        {bookings.map((booking) => (
          <BookingCard
            key={booking.booking.id}
            booking={booking}
            bookings={bookings}
            startExpanded={fromBookingID === booking.booking.id}
          />
        ))}
      </Stack>
    );
  }

  return (
    <TableWrapper>
      <Table ariaLabel="Reservas" className={block()}>
        <TableHeader>
          <Column isRowHeader>ID Reserva</Column>
          <Column>Tipo</Column>
          <Column>Espaço ou serviço</Column>
          <Column>Data</Column>
          <Column>Hora</Column>
          <Column>Nº de pax</Column>
          <Column>Nome do cliente</Column>
          <Column>Pagamento total</Column>
          <Column>Estado da reserva</Column>
          <Column />
        </TableHeader>
        <TableBody>
          {bookings.map((booking, index) => (
            <BookingRow
              key={booking.booking.id}
              booking={booking}
              bookings={bookings}
              odd={index % 2 === 0}
              startExpanded={fromBookingID === booking.booking.id}
            />
          ))}
        </TableBody>
      </Table>
    </TableWrapper>
  );
};

const BookingRow = ({
  odd,
  booking,
  bookings,
  startExpanded = false,
}: {
  odd?: boolean;
  booking: BookingWithRelations;
  bookings: BookingWithRelations[];
  startExpanded: boolean;
}) => {
  const { data: pack } = usePack(booking.booking.packID);

  const ref = useCallback(
    (node: HTMLTableRowElement) => {
      if (node !== null && startExpanded) {
        node.scrollIntoView({ behavior: "smooth" });
      }
    },
    [startExpanded],
  );

  return (
    <ExpandableRowProvider odd={odd} defaultExpanded={startExpanded}>
      <ExpandableRow ref={ref}>
        <Cell className={element("button")}>
          <BookingIDWithDetails booking={booking.booking} />
        </Cell>
        <Cell>
          <div>{booking.booking.kindWording.labelTable}</div>
        </Cell>
        <Cell>
          <div>{booking.space?.name}</div>
        </Cell>
        <Cell>
          <div>
            <BookingDate booking={booking} />
          </div>
        </Cell>
        <Cell>
          <div>
            <BookingStartEnd booking={booking} />
          </div>
        </Cell>
        <Cell>
          <div>{booking.booking.numPeople || "-"}</div>
        </Cell>
        <Cell>
          <div>{booking.booking.contactName || "-"}</div>
        </Cell>
        <Cell>
          <div>
            {booking.booking.totalAmount
              ? formatMoney(booking.booking.totalAmount)
              : "-"}
          </div>
        </Cell>
        <Cell>
          <div>
            <BookingStatus booking={booking} bookings={bookings} />
          </div>
        </Cell>
        <ExpandIconCell />
      </ExpandableRow>
      <ExpandedRow>
        <Cell />
        <ExpandedRowMainCell colspan={9} applyDefaultStyle={false}>
          <div className={element("details")}>
            <Stack gap="1.5rem">
              <BookingPack pack={pack} />
              <BookingLayout booking={booking} />
              <BookingTotalHours booking={booking} />
              <BookingClientPhone booking={booking} />
              <BookingClientEmail booking={booking} />
              <BookingCancellationButton booking={booking.booking} />
            </Stack>
            <Stack gap="1.5rem">
              <BookingBilling booking={booking} />
              <BookingRinuComission booking={booking} />
              <BookingCreatedAt booking={booking} />
              <BookingSource booking={booking} />
              <BookingNotes booking={booking} />
            </Stack>
          </div>
        </ExpandedRowMainCell>
      </ExpandedRow>
    </ExpandableRowProvider>
  );
};

const BookingCard = ({
  booking,
  bookings,
  startExpanded = false,
}: {
  booking: BookingWithRelations;
  bookings: BookingWithRelations[];
  startExpanded: boolean;
}) => {
  const [expanded, setExpanded] = useState(startExpanded);

  const { data: pack } = usePack(booking.booking.packID);

  const [node, setNode] = useState<HTMLTableRowElement | null>(null);
  const ref = useCallback(
    (node: HTMLTableRowElement) => {
      if (node !== null && startExpanded) {
        setNode(node);

        if (startExpanded) {
          node.scrollIntoView({ behavior: "smooth" });
        }
      }
    },
    [startExpanded],
  );

  return (
    <Stack className={element("card")} gap="0.5rem" ref={ref}>
      <Stack gap="0.5rem">
        <Stack row justifyContent="space-between">
          <ValueWithLabel label="ID Reserva" value={booking.booking.shortId} />
          <Stack row gap="0.5rem" flexWrap="nowrap">
            <BookingShowDetails booking={booking.booking} />
            <IconButton
              ariaLabel={expanded ? "Esconder detalhes" : "Ver detalhes"}
              icon={
                expanded ? (
                  <IconUserInterfaceNavigationArrowUp />
                ) : (
                  <IconUserInterfaceNavigationArrowDown />
                )
              }
              style={{ fontSize: "1rem" }}
              onClick={() => {
                setExpanded(!expanded);

                if (!expanded) {
                  node?.scrollIntoView({ behavior: "smooth" });
                }
              }}
            />
          </Stack>
        </Stack>
        <div className={element("card__grid")}>
          <ValueWithLabel
            label="Tipo"
            value={booking.booking.kindWording.labelTable}
          />
          <ValueWithLabel label="Espaço" value={booking.space?.name} />
          <ValueWithLabel
            label="Data"
            value={<BookingDate booking={booking} />}
          />
          <ValueWithLabel
            label="Hora"
            value={<BookingStartEnd booking={booking} />}
          />
          <ValueWithLabel
            label="Nº de pax"
            value={booking.booking.numPeople || "-"}
          />
          <ValueWithLabel
            label="Nome do cliente"
            value={booking.booking.contactName || "-"}
          />
          <ValueWithLabel
            label="Pagamento total"
            value={
              booking.booking.totalAmount
                ? formatMoney(booking.booking.totalAmount)
                : "-"
            }
          />
          <ValueWithLabel
            label="Estado da reserva"
            value={<BookingStatus booking={booking} bookings={bookings} />}
          />
        </div>
      </Stack>
      {expanded && (
        <Stack gap="0.5rem" className={element("card__details")}>
          <div className={element("card__grid")}>
            <BookingPack pack={pack} />
            <BookingLayout booking={booking} />
            <BookingTotalHours booking={booking} />
            <BookingClientPhone booking={booking} />
            <BookingClientEmail booking={booking} />
            <BookingBilling booking={booking} />
            <BookingRinuComission booking={booking} />
            <BookingCreatedAt booking={booking} />
            <BookingSource booking={booking} />
            <BookingNotes booking={booking} />
          </div>
          <BookingCancellationButton booking={booking.booking} />
        </Stack>
      )}
    </Stack>
  );
};

export const BookingDate = ({ booking }: { booking: BookingWithRelations }) => {
  const dateDate = booking.booking.date.toDate(getLocalTimeZone());

  return [
    formatDate(dateDate, { day: "numeric" }),
    formatDate(dateDate, { month: "short" }).slice(0, -1),
    formatDate(dateDate, { year: "numeric" }),
  ].join(" ");
};

export const BookingStartEnd = ({
  booking,
}: {
  booking: BookingWithRelations;
}) => (
  <>
    {booking.booking.start?.timeLabel} - {booking.booking.end?.timeLabel}
  </>
);

export const BookingStatus = ({
  booking,
  bookings,
}: {
  booking: BookingWithRelations;
  bookings: BookingWithRelations[];
}) => {
  if (booking.booking.kind === "block" || booking.booking.kind === "external") {
    const hasOverlappingBooking = !!bookings.find(
      (otherBooking) =>
        otherBooking.booking.id !== booking.booking.id &&
        otherBooking.booking.statusWording.blocksOtherBookings &&
        doBookingsOverlap(otherBooking.booking, booking.booking),
    );

    if (!hasOverlappingBooking) {
      return <ManualBookingStatusSelect booking={booking} />;
    }
  }

  return (
    <Tag
      size="small"
      text={booking.booking.statusWording.label}
      type={booking.booking.statusWording.tagType}
    />
  );
};

const ManualBookingStatusSelect = ({
  booking,
}: {
  booking: BookingWithRelations;
}) => {
  const { mutateAsync: updateBooking, isPending: isPendingUpdateBooking } =
    useUpdateBooking();

  const statusInfo = booking.booking.statusWording;

  return (
    <MenuTrigger>
      <StylelessButton disabled={isPendingUpdateBooking}>
        {statusInfo &&
          (isPendingUpdateBooking ? (
            <Tag
              size="small"
              type="neutral"
              iconRight={<IconUserInterfaceMiscellaneousLoading />}
            />
          ) : (
            <Tag
              size="small"
              text={statusInfo.label}
              type={statusInfo.tagType}
              iconRight={<IconUserInterfaceNavigationArrowDown />}
            />
          ))}
      </StylelessButton>
      <Popover placement="bottom right" crossOffset={8}>
        <Dropdown
          ariaLabel="Opções de estado"
          options={BOOKING_STATUSES.filter(
            ({ id }) => id === "confirmed" || id === "preConfirmed",
          ).map(({ id, label }) => ({ id, text: label }))}
          value={booking.booking.status}
          onClickOption={(status) => {
            updateBooking({ id: booking.booking.id, body: { status } });
          }}
        />
      </Popover>
    </MenuTrigger>
  );
};

export const BookingPack = ({ pack }: { pack?: Pack }) => {
  if (!pack) {
    return null;
  }

  return <ValueWithLabel label="Pack" value={pack.name || "-"} />;
};

export const BookingLayout = ({
  booking,
}: {
  booking: BookingWithRelations;
}) => {
  if (!booking.booking.layoutWording) {
    return null;
  }

  return (
    <ValueWithLabel
      label="Disposição do espaço"
      value={booking.booking.layoutWording?.text || "-"}
    />
  );
};

export const BookingTotalHours = ({
  booking,
}: {
  booking: BookingWithRelations;
}) => (
  <ValueWithLabel
    label="Nº total de horas"
    value={`${booking.booking.duration}h`}
  />
);

export const BookingClientPhone = ({
  booking,
}: {
  booking: BookingWithRelations;
}) => {
  if (!booking.booking.contactPhone) {
    return null;
  }

  return (
    <ValueWithLabel
      label="Telemóvel do cliente"
      value={booking.booking.contactPhone}
    />
  );
};

export const BookingClientEmail = ({
  booking,
}: {
  booking: BookingWithRelations;
}) => {
  if (!booking.booking.contactEmail) {
    return null;
  }

  return (
    <ValueWithLabel
      label="Email do cliente"
      value={booking.booking.contactEmail || "-"}
    />
  );
};

export const BookingBilling = ({
  booking,
}: {
  booking: BookingWithRelations;
}) => {
  if (!booking.booking.hasBillingData) {
    return null;
  }

  return (
    <ValueWithLabel
      label="Dados de faturação"
      value={<BookingBillingContent booking={booking.booking} />}
    />
  );
};

export const BookingRinuComission = ({
  booking,
}: {
  booking: BookingWithRelations;
}) => {
  if (booking.booking.kind !== "internal") {
    return null;
  }

  return (
    <ValueWithLabel
      label="Comissão RINU"
      value={formatMoney(booking.booking.commission)}
    />
  );
};

export const BookingCreatedAt = ({
  booking,
}: {
  booking: BookingWithRelations;
}) => {
  return (
    <ValueWithLabel
      label={
        booking.booking.kind === "integration"
          ? "Data de importação"
          : "Data de criação"
      }
      value={formatDate(new Date(booking.booking.createdAt), {
        dateStyle: "medium",
        timeStyle: "short",
      })}
    />
  );
};

export const BookingNotes = ({
  booking,
}: {
  booking: BookingWithRelations;
}) => {
  const [isOpenEditNotesModal, setIsOpenEditNotesModal] = useState(false);

  const [session] = useSession();

  return (
    <ValueWithLabel
      label="Nota interna"
      value={
        <Stack row gap="1rem" alignItems="baseline">
          <p style={{ whiteSpace: "pre-wrap" }}>
            {booking.booking.notes || "-"}
          </p>
          {!session?.roles.includes("admin") && (
            <>
              <IconButton
                style={{ fontSize: "1rem" }}
                icon={<IconUserInterfaceActionsEdit />}
                onClick={() => setIsOpenEditNotesModal(true)}
                ariaLabel="Editar"
                type="primary"
              />
              <BookingEditNotesModal
                isOpen={isOpenEditNotesModal}
                setIsOpen={setIsOpenEditNotesModal}
                booking={booking.booking}
              />
            </>
          )}
        </Stack>
      }
    />
  );
};

export const BookingCancellationButton = ({
  booking,
}: {
  booking: Booking;
}) => {
  const [isOpenCancellation, setIsOpenCancellation] = useState(false);

  if (
    !(booking.status === "confirmed" || booking.status === "preConfirmed") ||
    (booking.kind === "internal" &&
      booking.date.compare(today("Europe/Lisbon")) < 0)
  ) {
    return null;
  }

  return (
    <>
      <Button
        type="secondary"
        label={
          booking.kind === "internal" ? "Solicitar cancelamento" : "Eliminar"
        }
        leftIcon={<IconUserInterfaceActionsCancel />}
        onClick={() => setIsOpenCancellation(true)}
      />
      <BookingCancellationModal
        isOpen={isOpenCancellation}
        setIsOpen={setIsOpenCancellation}
        booking={booking}
      />
    </>
  );
};

export const BookingIDWithDetails = ({ booking }: { booking: Booking }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Stack row gap="0.25rem">
        <Button
          type="link"
          label={booking.id}
          leftIcon={
            booking.kind !== "internal" ? null : (
              <IconUserInterfaceActionsShow />
            )
          }
          onClick={() => setIsOpen(true)}
          disabled={booking.kind !== "internal"}
          style={{ paddingRight: 0 }}
        />
        <CopyIconButton text={booking.id} />
      </Stack>
      <BookingDetailsModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        booking={booking}
      />
    </>
  );
};

const BookingShowDetails = ({ booking }: { booking: Booking }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (booking.kind !== "internal") {
    return null;
  }

  return (
    <>
      <IconButton
        icon={<IconUserInterfaceActionsShow />}
        style={{ fontSize: "1rem" }}
        onClick={() => setIsOpen(true)}
        ariaLabel="Ver detalhes"
      />
      <BookingDetailsModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        booking={booking}
      />
    </>
  );
};

export const BookingSource = ({
  booking,
}: {
  booking: BookingWithRelations;
}) => {
  const { data: icals } = useSpaceIcals(booking.booking.spaceID, {
    enabled: booking.booking.kind === "integration",
  });

  if (booking.booking.kind !== "integration") {
    return null;
  }

  const importIcal = icals?.imports?.find(
    (ical) => ical.id === booking.booking.source,
  );

  return (
    <ValueWithLabel
      label="Calendário de origem"
      value={importIcal?.name ?? "-"}
    />
  );
};

export default BookingsTable;
