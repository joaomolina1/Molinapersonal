import IllustrationBookingError from "@/_design_system/_illustrations/BookingError.svg";
import Button from "@/_design_system/Button";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";

const AlreadyBookedModal = ({
  isOpen,
  onBackToSearch,
}: {
  isOpen: boolean;
  onBackToSearch: () => void;
}) => {
  return (
    <Modal
      isOpen={isOpen}
      width="medium"
      ariaLabel="Espaço indisponível"
      showCloseButton={false}
    >
      <Stack gap="2.5rem">
        <Stack gap="1.5rem" style={{ textAlign: "center" }}>
          <IllustrationBookingError />
          <Stack gap="1rem">
            <h3>
              Este espaço deixou de estar disponível no horário selecionado
            </h3>
            <TextBlock body="Por favor volte à pesquisa e verifique a disponibilidade de outros horários." />
          </Stack>
        </Stack>
        <Button label="Voltar à pesquisa" onClick={onBackToSearch} />
      </Stack>
    </Modal>
  );
};

export default AlreadyBookedModal;
