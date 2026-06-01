import IconUserInterfaceActionsCopy from "@/_design_system/_icons/UserInterface/Actions/Copy.svg";
import Button, { IconButton } from "@/_design_system/Button";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { useCreatePackCopy } from "@/_models/pack";
import { useState } from "react";

const CreateCopyButton = ({
  pack,
  type,
}: {
  pack: { id: string; name: string };
  type?: "neutral" | "primary";
}) => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { mutateAsync: createPackCopy, isPending: isPendingCreatePackCopy } =
    useCreatePackCopy();

  const handleCreateCopy = async () => {
    await createPackCopy({ id: pack.id });

    setIsConfirmModalOpen(false);
  };

  return (
    <>
      <IconButton
        ariaLabel="Duplicar"
        icon={<IconUserInterfaceActionsCopy />}
        type={type}
        onClick={() => setIsConfirmModalOpen(true)}
        style={{ fontSize: "1rem" }}
      />
      <Modal
        isOpen={isConfirmModalOpen}
        onOpenChange={setIsConfirmModalOpen}
        ariaLabel={`Duplicar pack`}
        width="medium"
      >
        <Stack gap="2.5rem">
          <TextBlock
            subtitle={`Quer duplicar o pack${pack.name ? ` "${pack.name}"` : ""}?`}
          />
          <Stack gap="1rem">
            <Button
              label={`Duplicar pack`}
              type="red"
              onClick={handleCreateCopy}
              loading={isPendingCreatePackCopy}
            />
            <Button
              label="Cancelar"
              type="secondary"
              onClick={() => setIsConfirmModalOpen(false)}
            />
          </Stack>
        </Stack>
      </Modal>
    </>
  );
};

export default CreateCopyButton;
