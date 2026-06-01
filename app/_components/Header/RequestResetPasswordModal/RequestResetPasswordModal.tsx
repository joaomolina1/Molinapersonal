import IconUserInterfaceActionsClose from "@/_design_system/_icons/UserInterface/Actions/Close.svg";
import IconUserInterfaceNavigationArrowLeft from "@/_design_system/_icons/UserInterface/Navigation/ArrowLeft.svg";
import IllustrationSuccess from "@/_design_system/_illustrations/Success.svg";
import Button, { IconButton } from "@/_design_system/Button";
import InputText from "@/_design_system/InputText";
import Logo from "@/_design_system/Logo";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { useRouterPush } from "@/_services/navigation";
import { useRequestResetPassword } from "@/_services/session";
import { FormEvent, useRef, useState } from "react";

const RequestResetPasswordModal = ({
  isOpen,
  onOpenChange,
  loginHref,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  loginHref: string;
}) => {
  const routerPush = useRouterPush();

  const [email, setEmail] = useState("");

  const {
    mutateAsync: requestResetPassword,
    isPending: isPendingRequestResetPassword,
    isError: isErrorRequestResetPassword,
    isSuccess: isSuccessRequestResetPassword,
    reset: resetRequestResetPassword,
  } = useRequestResetPassword();

  const emailRef = useRef<HTMLInputElement>(null);

  const handleRequestResetPassword = (e: FormEvent) => {
    e.preventDefault();

    resetRequestResetPassword();

    if (!email) {
      emailRef.current?.focus();
      return;
    }

    requestResetPassword({ username: email });
  };

  const handleClose = () => {
    resetRequestResetPassword();
    setEmail("");
    onOpenChange(false);
  };

  const handleGoBackToLogin = () => {
    resetRequestResetPassword();
    setEmail("");
    routerPush(loginHref);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(newIsOpen) => {
        if (newIsOpen) {
          onOpenChange(true);
        } else {
          handleClose();
        }
      }}
      width="medium"
      mobileHeight="fullscreen"
      ariaLabel="Recuperar palavra-passe"
      isDismissable={false}
      showCloseButton={false}
    >
      <Stack gap="2.5rem" style={{ paddingBottom: "2.5rem" }}>
        <Stack row justifyContent="space-between" alignItems="center">
          <div className="hide-desktop-large">
            <Logo type="default" link />
          </div>{" "}
          {!isSuccessRequestResetPassword && (
            <div className="hide-mobile-large">
              <IconButton
                ariaLabel="Voltar"
                onClick={handleGoBackToLogin}
                icon={<IconUserInterfaceNavigationArrowLeft />}
              />
            </div>
          )}
          <IconButton
            ariaLabel="Fechar"
            onClick={handleClose}
            icon={<IconUserInterfaceActionsClose />}
            style={{ marginLeft: "auto" }}
          />
        </Stack>
        {isSuccessRequestResetPassword ? (
          <>
            <IllustrationSuccess />
            <TextBlock
              subtitle="Email de recuperação de palavra-passe enviado com sucesso"
              body="Siga as instruções do email para recuperar o acesso à sua conta"
              style={{ textAlign: "center" }}
            />
            <Button label="Fechar" type="primary" onClick={handleClose} />
          </>
        ) : (
          <>
            <TextBlock
              subtitle="Recuperar palavra-passe"
              body="Introduza o endereço de email associado à sua conta, para enviarmos um email com instruções para recuperar a palavra-passe"
            />
            <form onSubmit={handleRequestResetPassword}>
              <Stack gap="1rem">
                <InputText
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  ref={emailRef}
                  error={
                    isErrorRequestResetPassword
                      ? "Ocorreu um erro ao tentar recuperar a palavra-passe"
                      : undefined
                  }
                />
                <Button
                  label="Enviar email de recuperação"
                  type="primary"
                  htmlType="submit"
                  loading={isPendingRequestResetPassword}
                />
              </Stack>
            </form>
          </>
        )}
      </Stack>
    </Modal>
  );
};

export default RequestResetPasswordModal;
