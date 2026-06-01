import BookingFullDetails from "@/_components/BookingFullDetails";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { Booking } from "@/_models/booking";
import { formatDate } from "@/_utils/date";

const BookingDetailsModal = ({
  isOpen,
  setIsOpen,
  booking,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  booking: Booking;
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      width="xx-large"
      ariaLabel="Detalhes da reserva"
      showCloseButton={true}
    >
      <Stack gap="2rem">
        <TextBlock
          subtitle={`Reserva nº ${booking.shortId}`}
          body={`Criada em: ${formatDate(new Date(booking.createdAt), {
            dateStyle: "medium",
            timeStyle: "short",
          })}`}
        />
        <BookingFullDetails booking={booking} />
      </Stack>
    </Modal>
  );
};

export default BookingDetailsModal;
