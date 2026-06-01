"use client";

import Button, { IconButton } from "@/_design_system/Button";
import Logo from "@/_design_system/Logo";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceActionsClose from "@/_design_system/_icons/UserInterface/Actions/Close.svg";
import IllustrationSuccess from "@/_design_system/_illustrations/Success.svg";
import { useConfirmEmail } from "@/_services/session";
import { useEffect } from "react";

const RegisterSuccessModal = ({
  isOpen,
  onOpenChange,
  loginHref,
  username,
  otp,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  loginHref: string;
  username: string;
  otp: string;
}) => {
  const { mutateAsync: confirmEmail, isSuccess: isSuccessConfirmEmail } =
    useConfirmEmail();

  useEffect(() => {
    confirmEmail({ username, otp });
  }, [confirmEmail, otp, username]);

  if (!isSuccessConfirmEmail) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      width="medium"
      mobileHeight="fullscreen"
      ariaLabel="Registo efectuado"
      showCloseButton={false}
    >
      <Stack
        gap="2.5rem"
        style={{ paddingBottom: "2.5rem", textAlign: "center" }}
      >
        <Stack row justifyContent="space-between" alignItems="center">
          <div className="hide-desktop-large">
            <Logo type="default" link />
          </div>
          <IconButton
            ariaLabel="Fechar"
            onClick={() => onOpenChange(false)}
            icon={<IconUserInterfaceActionsClose />}
            style={{ marginLeft: "auto" }}
          />
        </Stack>
        <IllustrationSuccess />
        <TextBlock
          subtitle="Registo efetuado com sucesso!"
          body="O seu endereço de email foi confirmado."
        />
        <Button
          label="Entrar"
          type="primary"
          href={loginHref}
          prefetch={false}
        />
      </Stack>
    </Modal>
  );
};

export default RegisterSuccessModal;
