import { createBEMClasses } from "@/_utils/classname";
import {
  AdminBookingsList,
  BookingWithRelations,
} from "../useAdminBookingsList";
import { MenuTrigger, Popover } from "react-aria-components";
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
import { usePack } from "@/_models/pack";
import {
  BookingBilling,
  BookingClientEmail,
  BookingClientPhone,
  BookingCreatedAt,
  BookingDate,
  BookingIDWithDetails,
  BookingLayout,
  BookingNotes,
  BookingPack,
  BookingRinuComission,
  BookingSource,
  BookingStartEnd,
  BookingTotalHours,
} from "@/(host)/host/bookings/_components/Bookings/BookingsTable/BookingsTable";
import { formatMoney } from "@/_utils/number";
import { StylelessButton } from "@/_design_system/Button";
import IconUserInterfaceNavigationArrowDown from "@/_design_system/_icons/UserInterface/Navigation/ArrowDown.svg";
import Stack from "@/_design_system/Stack";
import { Booking, useUpdateBookingStatus } from "@/_models/booking";
import { BOOKING_STATUSES } from "@/_constants/booking/status";
import IconUserInterfaceMiscellaneousLoading from "@/_design_system/_icons/UserInterface/Miscellaneous/Loading.svg";
import Tag from "@/_design_system/Tag";
import Dropdown from "@/_design_system/InputSelect/Dropdown";

const { block, element } = createBEMClasses("admin-bookings-table");

const AdminBookingsTable = ({
  bookingsList,
}: {
  bookingsList: AdminBookingsList;
}) => {
  const { bookings, isFetching } = bookingsList;

  return (
    <TableWrapper>
      <Table ariaLabel="Reservas" className={block()}>
        <TableHeader>
          <Column isRowHeader>ID Reserva</Column>
          <Column>Tipo</Column>
          <Column>Espaço</Column>
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
              odd={index % 2 === 0}
              isFetching={isFetching}
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
  isFetching,
}: {
  odd: boolean;
  booking: BookingWithRelations;
  isFetching: boolean;
}) => {
  const { data: pack } = usePack(booking.booking.packID);

  return (
    <ExpandableRowProvider odd={odd}>
      <ExpandableRow>
        <Cell style={{ paddingInline: 8 }}>
          <BookingIDWithDetails booking={booking.booking} />
        </Cell>
        <Cell>
          <div>{booking.booking.kindWording.labelTable}</div>
        </Cell>
        <Cell>
          <div>
            {booking.venue?.name} - {booking.space?.name}
          </div>
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
            <StatusSelect booking={booking.booking} isFetching={isFetching} />
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

const statusOptions = BOOKING_STATUSES.map(({ id, label }) => ({
  id,
  text: label,
}));

const StatusSelect = ({
  booking,
  isFetching,
}: {
  booking: Booking;
  isFetching: boolean;
}) => {
  const {
    mutateAsync: updateBookingStatus,
    isPending: isPendingUpdateBookingStatus,
    isSuccess: isSuccessUpdateBookingStatus,
  } = useUpdateBookingStatus();

  const statusInfo = booking.statusWording;

  const isPending =
    isPendingUpdateBookingStatus ||
    (isSuccessUpdateBookingStatus && isFetching);

  return (
    <MenuTrigger>
      <StylelessButton disabled={isPendingUpdateBookingStatus}>
        {statusInfo &&
          (isPending ? (
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
          options={statusOptions}
          value={booking.status}
          onClickOption={(status) => {
            updateBookingStatus({ id: booking.id, status });
          }}
        />
      </Popover>
    </MenuTrigger>
  );
};

export default AdminBookingsTable;
