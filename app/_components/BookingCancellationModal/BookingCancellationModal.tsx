import Button from "@/_design_system/Button";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { useShowToast } from "@/_design_system/Toast";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { Booking, useCancelBooking } from "@/_models/booking";

const BookingCancellationModal = ({
  isOpen,
  setIsOpen,
  booking,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  booking: Booking;
}) => {
  const {
    mutateAsync: cancelBooking,
    isPending: isPendingCancelBooking,
    isError: isErrorCancelBooking,
  } = useCancelBooking();

  const showToast = useShowToast();

  const handleCancel = async () => {
    await cancelBooking({ id: booking.id });
    setIsOpen(false);
    showToast({
      text:
        booking.kind === "internal"
          ? "Cancelamento solicitado com sucesso"
          : "Reserva eliminada com sucesso",
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      ariaLabel="Cancelar reserva"
      width="medium"
    >
      <Stack gap="2.5rem">
        {booking.kind === "internal" ? (
          <TextBlock
            subtitle="Pretende solicitar o cancelamento desta reserva?"
            body="O seu pedido será analisado e executado pela nossa equipa. Entraremos em contacto assim que a devolução do seu capital estiver executada."
          />
        ) : (
          <TextBlock subtitle="Pretende eliminar esta reserva?" />
        )}
        {isErrorCancelBooking && (
          <InputError
            error={
              booking.kind === "internal"
                ? "Ocorreu um erro ao solicitar o cancelamento da reserva"
                : "Ocorreu um erro ao eliminar a reserva"
            }
          />
        )}
        <Stack gap="1rem">
          <Button
            label={
              booking.kind === "internal"
                ? "Solicitar cancelamento"
                : "Eliminar"
            }
            type="red"
            onClick={handleCancel}
            loading={isPendingCancelBooking}
          />
          <Button
            label="Cancelar"
            type="secondary"
            onClick={() => setIsOpen(false)}
          />
        </Stack>
      </Stack>
    </Modal>
  );
};

export default BookingCancellationModal;
