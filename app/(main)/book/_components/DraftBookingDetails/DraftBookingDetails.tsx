import {
  BookingCancellation,
  BookingMainDetails,
  BookingPackAttributes,
  BookingPaymentSummary,
  BookingPhotoName,
  BookingPriceDetail,
  BookingSpaceAttributes,
  BookingVenueAttributes,
} from "@/_components/BookingDetails";
import HiddenVenueName from "@/_components/HiddenVenueName";
import Stack from "@/_design_system/Stack";
import { Booking } from "@/_models/booking";
import { usePack, usePacks } from "@/_models/pack";
import { usePhoto } from "@/_models/photo";
import { useSpace } from "@/_models/space";
import { useVenue } from "@/_models/venue";
import { createBEMClasses } from "@/_utils/classname";
import { paymentBreakdownFromBooking } from "@lib/payment/upfront";
import { serializeExtraParamsQuery } from "@lib/extras/quantities";

const { block } = createBEMClasses("draft-booking-details");

const DraftBookingDetails = ({ booking }: { booking: Booking }) => {
  const { data: pack } = usePack(booking.packID);
  const { data: space } = useSpace(booking.spaceID);
  const { data: venue } = useVenue(space?.venueID);

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

  const { data: photo } = usePhoto(pack?.primaryPhotoID);

  const priceDetail = packs?.find(({ id }) => id === booking.packID)?.price;

  const paymentBreakdown = paymentBreakdownFromBooking({
    totalAmount: booking.totalAmount,
    upfrontAmount: booking.upfrontAmount,
    upfrontPercentage: booking.upfrontPercentage,
    freeCancellationUntil: booking.freeCancellationUntil,
  });

  return (
    <Stack gap="1.5rem" className={block()}>
      <Stack gap="1.5rem">
        <BookingPhotoName
          url={photo?.medium}
          packName={pack?.name}
          spaceName={space?.name}
          venueName={
            <HiddenVenueName
              name={venue?.name}
              subscription={venue?.subscription}
            />
          }
        />
        <BookingMainDetails booking={booking} />
      </Stack>
      {!!pack?.bookingAttributes.length && (
        <>
          <hr />
          <BookingPackAttributes attributes={pack.bookingAttributes} />
        </>
      )}
      {!!space?.bookingAttributes.length && (
        <>
          <hr />
          <BookingSpaceAttributes attributes={space.bookingAttributes} />
        </>
      )}
      {!!venue?.bookingAttributes.length && (
        <>
          <hr />
          <BookingVenueAttributes attributes={venue.bookingAttributes} />
        </>
      )}
      {!!pack?.cancellationPeriod && (
        <>
          <hr />
          <BookingCancellation cancellationPeriod={pack.cancellationPeriod} />
        </>
      )}
      {!!priceDetail && (
        <>
          <hr />
          <BookingPriceDetail priceDetail={priceDetail} start={booking.start} />
        </>
      )}
      <hr />
      <BookingPaymentSummary breakdown={paymentBreakdown} />
    </Stack>
  );
};

export default DraftBookingDetails;
