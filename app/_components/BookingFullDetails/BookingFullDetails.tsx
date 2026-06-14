"use client";

import { Booking, useBooking } from "@/_models/booking";
import { createBEMClasses } from "@/_utils/classname";
import {
  BookingBilling,
  BookingCancellation,
  BookingContact,
  BookingHostContact,
  BookingServiceContacts,
  BookingServicePacks,
  BookingMainDetails,
  BookingPackAttributes,
  BookingPhotoName,
  BookingPriceDetail,
  BookingSpaceAttributes,
  BookingTotalPrice,
  BookingVenueAttributes,
} from "../BookingDetails";
import { serializeExtraParamsQuery } from "@lib/extras/quantities";
import { usePack, usePacks } from "@/_models/pack";
import { useSpace } from "@/_models/space";
import { useVenue } from "@/_models/venue";
import { usePhoto } from "@/_models/photo";
import Stack from "@/_design_system/Stack";

const { block, element } = createBEMClasses("booking-full-details");

const BookingFullDetails = ({ booking: listBooking }: { booking: Booking }) => {
  // Booking lists don't carry the external service packs / provider contacts;
  // fetch the full booking by id so they show in every detail view.
  const { data: fullBooking } = useBooking({ id: listBooking.id });
  const booking = fullBooking ?? listBooking;

  const { data: pack } = usePack(booking.packID);
  const { data: space } = useSpace(booking.spaceID);
  const { data: venue } = useVenue(space?.venueID);

  const { data: photo } = usePhoto(pack?.primaryPhotoID);

  const { data: packs } = usePacks({
    spaceID: space?.id,
    query: {
      date: booking.date.toDate("Etc/UTC").toISOString(),
      start: booking.start?.string ?? "",
      end: booking.end?.string ?? "",
      num_persons: booking.numPeople,
      extras: booking.extraIDs?.join(",") ?? "",
      extra_params: serializeExtraParamsQuery(booking.extraParams ?? []),
    },
  });

  const priceDetail = packs?.find(({ id }) => id === booking.packID)?.price;

  return (
    <div className={block()}>
      <div>
        <BookingPhotoName
          url={photo?.medium}
          packName={pack?.name}
          spaceName={space?.name}
          venueName={venue?.name}
        />
      </div>
      <div className={element("main-details")}>
        <BookingMainDetails booking={booking} />
      </div>
      <Stack gap="1.5rem">
        {!!pack?.bookingAttributes.length && (
          <BookingPackAttributes attributes={pack.bookingAttributes} />
        )}
        {!!space?.bookingAttributes.length && (
          <BookingSpaceAttributes attributes={space.bookingAttributes} />
        )}
        {!!venue?.bookingAttributes.length && (
          <BookingVenueAttributes attributes={venue.bookingAttributes} />
        )}
      </Stack>
      <Stack gap="1.5rem">
        {!!pack?.cancellationPeriod && (
          <BookingCancellation cancellationPeriod={pack.cancellationPeriod} />
        )}
        <Stack gap="0.5rem">
          {priceDetail && (
            <BookingPriceDetail
              priceDetail={priceDetail}
              start={booking.start}
            />
          )}
          {!!booking.servicePacks?.length && (
            <BookingServicePacks servicePacks={booking.servicePacks} />
          )}
          <hr />
          <BookingTotalPrice amount={booking.totalAmount} />
        </Stack>
        <BookingBilling booking={booking} />
        <BookingContact booking={booking} />
      </Stack>
      <Stack gap="1.5rem">
        <BookingHostContact provider={booking.provider} />
        {!!booking.servicePacks?.length && (
          <BookingServiceContacts servicePacks={booking.servicePacks} />
        )}
      </Stack>
    </div>
  );
};

export default BookingFullDetails;
