import Button from "@/_design_system/Button";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import IllustrationBookingError from "@/_design_system/_illustrations/BookingError.svg";
import { useRouterPush } from "@/_services/navigation";
import { PackSearchHook } from "../PackSearch";

const BookingOwnSpaceModal = ({
  isOpen,
  setIsOpen,
  packSearch,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  packSearch: PackSearchHook;
}) => {
  const routerPush = useRouterPush();

  const backToSearch = () => {
    const searchParams = new URLSearchParams();
    const { date, start, end, numPeople } = packSearch;

    if (date) {
      searchParams.set("date", date.toString());
    }

    if (start && end) {
      searchParams.set("start", start.string);
      searchParams.set("end", end.string);
    }

    if (numPeople) {
      searchParams.set("numPeople", numPeople.toString());
    }

    routerPush("/search?" + searchParams.toString());
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      width="medium"
      ariaLabel="Não pode reservar o seu espaço"
      showCloseButton={false}
    >
      <Stack gap="2.5rem">
        <Stack gap="1.5rem" style={{ textAlign: "center" }}>
          <IllustrationBookingError />
          <Stack gap="1rem">
            <h3>
              Não pode efetuar uma reserva num espaço que esteja associado à sua
              conta RINU
            </h3>
            <TextBlock body="Se pretender bloquear alguma data/hora específica, por favor utilize o seu backoffice ou fale connosco" />
          </Stack>
        </Stack>
        <Button label="Voltar à pesquisa" onClick={backToSearch} />
      </Stack>
    </Modal>
  );
};

export default BookingOwnSpaceModal;
