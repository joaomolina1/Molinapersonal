import Button from "@/_design_system/Button";
import InputTextArea from "@/_design_system/InputTextArea";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { Booking, useUpdateBooking } from "@/_models/booking";
import { useState } from "react";

const BookingEditNotesModal = ({
  isOpen,
  setIsOpen,
  booking,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  booking: Booking;
}) => {
  const [notes, setNotes] = useState(booking.notes);

  const {
    mutateAsync: updateBooking,
    isPending: isPendingUpdateBooking,
    isError: isErrorUpdateBooking,
  } = useUpdateBooking();

  const cancel = () => {
    setNotes(booking.notes);
    setIsOpen(false);
  };

  const save = async () => {
    if (notes === booking.notes) {
      cancel();
    } else {
      await updateBooking({ id: booking.id, body: { notes } });
      setIsOpen(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      ariaLabel="Editar nota interna"
      width="small"
    >
      <Stack gap="2.5rem">
        <Stack gap="1rem">
          <TextBlock subtitle="Nota interna" />
          <InputTextArea
            value={notes}
            onChange={setNotes}
            label="Nota interna"
            showLabel={false}
            height="small"
          />
          {isErrorUpdateBooking && (
            <InputError error="Ocorreu um erro ao guardar a nota interna" />
          )}
        </Stack>
        <Stack gap="1rem">
          <Button
            label="Guardar"
            type="primary"
            onClick={save}
            loading={isPendingUpdateBooking}
          />
          <Button label="Cancelar" type="secondary" onClick={cancel} />
        </Stack>
      </Stack>
    </Modal>
  );
};

export default BookingEditNotesModal;
