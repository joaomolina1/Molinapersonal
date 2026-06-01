import Button from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import Tag from "@/_design_system/Tag";
import IconUserInterfaceActionsCancel from "@/_design_system/_icons/UserInterface/Actions/Cancel.svg";
import IconUserInterfaceActionsShow from "@/_design_system/_icons/UserInterface/Actions/Show.svg";
import { createBEMClasses } from "@/_utils/classname";
import Image from "next/image";
import { useState } from "react";
import { BookingMainDetails } from "@/_components/BookingDetails";
import BookingCancellationModal from "@/_components/BookingCancellationModal";
import { Booking } from "@/_models/booking";
import { usePack } from "@/_models/pack";
import { useSpace } from "@/_models/space";
import { useVenue } from "@/_models/venue";
import { usePhoto } from "@/_models/photo";
import { formatDate } from "@/_utils/date";
import IconUserInterfaceMiscellaneousRating from "@/_design_system/_icons/UserInterface/Miscellaneous/Rating.svg";
import BookingDetailsModal from "@/_components/BookingDetailsModal";
import NewReviewModal from "@/_components/NewReviewModal";
import { useSession } from "@/_services/session";
import { useTallyFormModal } from "@/_utils/tally";
import config from "@/_utils/config";
import Script from "next/script";

const { block, element } = createBEMClasses("client-booking-card");

const BookingCard = ({
  variant,
  booking,
}: {
  variant: "future" | "past";
  booking: Booking;
}) => {
  const [isOpenDetails, setIsOpenDetails] = useState(false);
  const [isOpenCancellation, setIsOpenCancellation] = useState(false);
  const [isOpenNewReview, setIsOpenNewReview] = useState(false);

  const { data: pack } = usePack(booking.packID);
  const { data: space } = useSpace(booking.spaceID);
  const { data: venue } = useVenue(space?.venueID);

  const { data: photo } = usePhoto(pack?.primaryPhotoID);

  const [session] = useSession();

  const openFeedbackForm = useTallyFormModal("3yyeN6", {
    booking: booking.id,
    name: session?.name,
    email: session?.email,
    space: booking.spaceID,
  });

  return (
    <>
      <div className={block({ variant })}>
        <div className={element("image-status")}>
          {!!photo?.medium && <Image alt="" src={photo.medium} fill />}
          <Tag
            text={booking.statusWording.label}
            type={booking.statusWording.tagType}
            className={element("status")}
          />
        </div>
        <div className={element("content")}>
          <Stack gap="1.5rem" className={element("content__details")}>
            <Stack gap="0.25rem">
              <p className={element("pack-name")}>{pack?.name}</p>
              <div>
                <p className={element("space-name")}>{space?.name}</p>
                <p className={element("venue-name")}>{venue?.name}</p>
              </div>
            </Stack>
            <BookingMainDetails booking={booking} showReference showPrice />
          </Stack>
          <Stack gap="1rem" className={element("content__actions")}>
            <Button
              label="Ver detalhes"
              leftIcon={<IconUserInterfaceActionsShow />}
              type="secondary"
              onClick={() => setIsOpenDetails(true)}
            />
            {variant === "future" && booking.status === "confirmed" && (
              <Stack gap="0.5rem">
                <Button
                  label="Pedir cancelamento"
                  leftIcon={<IconUserInterfaceActionsCancel />}
                  type="secondary"
                  onClick={() => setIsOpenCancellation(true)}
                />
                <p className={element("cancellation")}>
                  Cancelamento gratuito até{" "}
                  {[
                    formatDate(new Date(booking.freeCancellationUntil), {
                      day: "numeric",
                    }),
                    formatDate(new Date(booking.freeCancellationUntil), {
                      month: "short",
                    }).slice(0, -1),
                  ].join(" ")}
                </p>
              </Stack>
            )}
            {variant === "past" && !!space && !!venue && (
              <>
                <Button
                  type="secondary"
                  label="Deixar avaliação"
                  leftIcon={<IconUserInterfaceMiscellaneousRating />}
                  onClick={() => {
                    if (config.enableReviews) {
                      setIsOpenNewReview(true);
                    } else {
                      openFeedbackForm();
                    }
                  }}
                />
                <NewReviewModal
                  isOpen={isOpenNewReview}
                  setIsOpen={setIsOpenNewReview}
                  space={space}
                  venue={venue}
                />
                <Script src="https://tally.so/widgets/embed.js" />
              </>
            )}
          </Stack>
        </div>
      </div>
      <BookingDetailsModal
        isOpen={isOpenDetails}
        setIsOpen={setIsOpenDetails}
        booking={booking}
      />
      <BookingCancellationModal
        isOpen={isOpenCancellation}
        setIsOpen={setIsOpenCancellation}
        booking={booking}
      />
    </>
  );
};

export default BookingCard;
