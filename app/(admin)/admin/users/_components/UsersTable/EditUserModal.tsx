import IconUserInterfaceActionsEdit from "@/_design_system/_icons/UserInterface/Actions/Edit.svg";
import { IconButton } from "@/_design_system/Button";
import Modal from "@/_design_system/Modal";
import { User } from "@/_models/user";
import { useState } from "react";
import UpdateUserEmail from "./UpdateUserEmail";
import ResetUserPassword from "./ResetUserPassword";
import TransferVenues from "./TransferVenues";
import Stack from "@/_design_system/Stack";

export const EditUserModal = ({ user }: { user: User }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <IconButton
        icon={<IconUserInterfaceActionsEdit />}
        onClick={() => setIsOpen(true)}
        ariaLabel="Editar utilizador"
        style={{ fontSize: "1rem" }}
        type="neutral"
      />
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        ariaLabel="Editar utilizador"
        width="x-large"
      >
        <Stack gap="2rem">
          <UpdateUserEmail user={user} />
          <ResetUserPassword user={user} />
          <TransferVenues user={user} />
        </Stack>
      </Modal>
    </>
  );
};
