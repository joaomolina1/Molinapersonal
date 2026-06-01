import { InputError } from "@/_design_system/_utils/InputWrapper";
import Button from "@/_design_system/Button";
import InputText from "@/_design_system/InputText";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { useShowToast } from "@/_design_system/Toast";
import { useCreateImportIcal } from "@/_models/ical";
import { Space } from "@/_models/space";
import { useRef, useState } from "react";

const NewCalendarLinkModal = ({
  isOpen,
  setIsOpen,
  space,
  onImport,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  space: Space;
  onImport: () => void;
}) => {
  const showToast = useShowToast();

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  const [showErrors, setShowErrors] = useState(false);

  const {
    mutateAsync: createIcal,
    isPending: isPendingCreateIcal,
    isError: isErrorCreateIcal,
    reset: resetCreateIcal,
  } = useCreateImportIcal();

  const save = async () => {
    setShowErrors(true);

    if (!name) {
      nameRef.current?.focus();
      return;
    }

    if (!url) {
      urlRef.current?.focus();
      return;
    }

    await createIcal({
      spaceId: space.id,
      url,
      name,
    });

    closeAndReset();
    onImport();
    showToast({ text: "Importação criada com sucesso" });
  };

  const closeAndReset = () => {
    setIsOpen(false);
    setShowErrors(false);
    setName("");
    setUrl("");
    resetCreateIcal();
  };

  const label = `Importar calendário para ${space.name}`;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(newIsOpen) =>
        newIsOpen ? setIsOpen(true) : closeAndReset()
      }
      width="x-large"
      showCloseButton
      ariaLabel={label}
    >
      <Stack gap="2.5rem">
        <TextBlock
          subtitle={label}
          body={
            <>
              Copie a hiperligação de iCal de outros canais e cole-a aqui para
              manter a sua disponibilidade atualizada em diferentes plataformas.
              Normalmente, pode encontrá-la na funcionalidade para exportar o
              calendário. Garanta que está a importar apenas hiperligações em
              formato iCal.
            </>
          }
        />
        <Stack gap="1rem">
          <InputText
            label="Nome do calendário"
            value={name}
            onChange={setName}
            invalid={showErrors && !name}
            ref={nameRef}
          />
          <InputText
            label="Hiperligação do calendário"
            value={url}
            onChange={setUrl}
            invalid={showErrors && !url}
            ref={urlRef}
          />
        </Stack>
        <Stack gap="1rem">
          {showErrors && isErrorCreateIcal && (
            <InputError error="Ocorreu um erro ao importar o calendário" />
          )}
          <Button
            type="primary"
            label="Importar"
            onClick={save}
            loading={isPendingCreateIcal}
          />
          <Button type="secondary" label="Cancelar" onClick={closeAndReset} />
        </Stack>
      </Stack>
    </Modal>
  );
};

export default NewCalendarLinkModal;
