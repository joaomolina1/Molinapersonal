import InputPassword from "@/_components/InputPassword";
import IconUserInterfaceActionsClose from "@/_design_system/_icons/UserInterface/Actions/Close.svg";
import Button, { IconButton } from "@/_design_system/Button";
import InputText from "@/_design_system/InputText";
import Logo from "@/_design_system/Logo";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import {
  PasswordChecks,
  passwordIsValid,
} from "../RegisterModal/RegisterStep2";
import { FormEvent, useRef, useState } from "react";
import { useResetPassword } from "@/_services/session";
import { InputError } from "@/_design_system/_utils/InputWrapper";

const ResetPasswordModal = ({
  isOpen,
  onOpenChange,
  otp,
}: {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  otp: string | null;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [passwordError, setPasswordError] = useState("");
  const [repeatPasswordError, setRepeatPasswordError] = useState("");

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const repeatPasswordRef = useRef<HTMLInputElement>(null);

  const {
    mutateAsync: resetPassword,
    isPending: isPendingResetPassword,
    isError: isErrorResetPassword,
    reset: resetResetPassword,
  } = useResetPassword();

  const handleClose = () => {
    onOpenChange(false);
    setEmail("");
    setPassword("");
    setRepeatPassword("");
    setPasswordError("");
    setRepeatPasswordError("");
    resetResetPassword();
  };

  const handleResetPassword = (e: FormEvent) => {
    e.preventDefault();

    setPasswordError("");
    setRepeatPasswordError("");
    resetResetPassword();

    if (!otp) {
      handleClose();
      return;
    }

    if (!email) {
      emailRef.current?.focus();
      return;
    }

    if (!password) {
      passwordRef.current?.focus();
      return;
    }

    if (!repeatPassword) {
      repeatPasswordRef.current?.focus();
      return;
    }

    if (!passwordIsValid(password)) {
      passwordRef.current?.focus();
      setPasswordError("Palavra-passe inválida.");
      return;
    }

    if (repeatPassword !== password) {
      repeatPasswordRef.current?.focus();
      setRepeatPasswordError("As palavras-passe são diferentes.");
      return;
    }

    resetPassword({
      username: email,
      otp,
      password,
    }).then(handleClose);
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
          <IconButton
            ariaLabel="Fechar"
            onClick={handleClose}
            icon={<IconUserInterfaceActionsClose />}
            style={{ marginLeft: "auto" }}
          />
        </Stack>
        <TextBlock subtitle="Defina uma nova palavra-passe" />
        <form onSubmit={handleResetPassword}>
          <Stack gap="1rem">
            <InputText
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              ref={emailRef}
              autoComplete="email"
            />
            <InputPassword
              label="Nova palavra-passe"
              value={password}
              onChange={(value) => {
                if (!passwordIsValid(password) && passwordIsValid(value)) {
                  setPasswordError("");
                }

                if (repeatPasswordError && value === repeatPassword) {
                  setRepeatPasswordError("");
                }

                setPassword(value);
              }}
              ref={passwordRef}
              error={passwordError}
              autoComplete="new-password"
            />
            <InputPassword
              label="Repetir nova palavra-passe"
              value={repeatPassword}
              onChange={(value) => {
                setRepeatPassword(value);

                if (repeatPasswordError && value === password) {
                  setRepeatPasswordError("");
                }
              }}
              ref={repeatPasswordRef}
              error={repeatPasswordError}
              autoComplete="new-password"
            />
            <PasswordChecks password={password} />
            {isErrorResetPassword && (
              <InputError error="Ocorreu um erro ao recuperar a palavra-passe" />
            )}
            <Button
              label="Continuar"
              type="primary"
              htmlType="submit"
              loading={isPendingResetPassword}
            />
          </Stack>
        </form>
      </Stack>
    </Modal>
  );
};

export default ResetPasswordModal;
