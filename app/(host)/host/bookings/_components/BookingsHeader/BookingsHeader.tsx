"use client";

import InputSelect from "@/_design_system/InputSelect";
import InputText from "@/_design_system/InputText";
import IconUserInterfaceActionsSearch from "@/_design_system/_icons/UserInterface/Actions/Search.svg";
import { createBEMClasses } from "@/_utils/classname";
import { BookingsList } from "../useBookingsList";
import InputDateRange from "@/_design_system/InputDateRange";
import { AdminBookingsList } from "@/(admin)/admin/bookings/_components/useAdminBookingsList";

const { block } = createBEMClasses("host-bookings-header");

const BookingsHeader = ({
  bookingsList,
}: {
  bookingsList: BookingsList | AdminBookingsList;
}) => {
  return (
    <div className={block()}>
      <InputText
        value={bookingsList.query}
        onChange={bookingsList.setQuery}
        label="Pesquisa"
        leftIcon={<IconUserInterfaceActionsSearch />}
      />
      <InputSelect
        value={bookingsList.venue}
        onChange={bookingsList.setVenue}
        label="Local ou empresa"
        options={bookingsList.venueOptions}
      />
      <InputSelect
        value={bookingsList.space}
        onChange={bookingsList.setSpace}
        label="Espaço ou serviço"
        options={bookingsList.spaceOptions}
      />
      <InputSelect
        value={bookingsList.kind}
        onChange={bookingsList.setKind}
        label="Tipo"
        options={bookingsList.kindOptions}
      />
      <InputDateRange
        value={bookingsList.dateRange}
        onChange={bookingsList.setDateRange}
        label="Data início - Data fim"
        showIcon={false}
      />
      <InputSelect
        value={bookingsList.status}
        onChange={bookingsList.setStatus}
        label="Estado"
        options={bookingsList.statusOptions}
      />
    </div>
  );
};

export default BookingsHeader;
