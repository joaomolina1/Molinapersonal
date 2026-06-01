import {
  PasswordChecks,
  passwordIsValid,
} from "@/_components/Header/RegisterModal/RegisterStep2";
import InputPassword from "@/_components/InputPassword";
import Button from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import StackHalfHalf from "@/_design_system/StackHalfHalf";
import TextBlock from "@/_design_system/TextBlock";
import { useShowToast } from "@/_design_system/Toast";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { useChangePassword } from "@/_services/session";
import { FormEvent, useRef, useState } from "react";

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [repeatNewPassword, setRepeatNewPassword] = useState("");

  const [newPasswordError, setNewPasswordError] = useState("");
  const [repeatNewPasswordError, setRepeatNewPasswordError] = useState("");

  const oldPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const repeatNewPasswordRef = useRef<HTMLInputElement>(null);

  const showToast = useShowToast();

  const {
    mutateAsync: changePassword,
    isPending: isPendingChangePassword,
    isError: isErrorChangePassword,
    reset: resetChangePassword,
  } = useChangePassword();

  const handleChangePassword = (e: FormEvent) => {
    e.preventDefault();

    setNewPasswordError("");
    setRepeatNewPasswordError("");
    resetChangePassword();

    if (!oldPassword) {
      oldPasswordRef.current?.focus();
      return;
    }

    if (!newPassword) {
      newPasswordRef.current?.focus();
      return;
    }

    if (!repeatNewPassword) {
      repeatNewPasswordRef.current?.focus();
      return;
    }

    if (!passwordIsValid(newPassword)) {
      newPasswordRef.current?.focus();
      setNewPasswordError("Palavra-passe inválida.");
      return;
    }

    if (repeatNewPassword !== newPassword) {
      repeatNewPasswordRef.current?.focus();
      setRepeatNewPasswordError("As palavras-passe são diferentes.");
      return;
    }

    changePassword({
      old: oldPassword,
      new: newPassword,
    }).then(() => {
      setOldPassword("");
      setNewPassword("");
      setRepeatNewPassword("");

      showToast({ text: "Password alterada com sucesso" });
    });
  };

  return (
    <Stack gap="1rem">
      <div className="hide-mobile-large">
        <TextBlock subtitle="Alterar password" />
      </div>
      <div className="hide-desktop-large">
        <TextBlock label="Alterar password" />
      </div>
      <StackHalfHalf>
        <form onSubmit={handleChangePassword}>
          <Stack gap="1rem">
            <InputPassword
              label="Palavra-passe atual"
              value={oldPassword}
              onChange={setOldPassword}
              ref={oldPasswordRef}
              autoComplete="current-password"
            />
            <InputPassword
              label="Nova palavra-passe"
              value={newPassword}
              onChange={(value) => {
                if (!passwordIsValid(newPassword) && passwordIsValid(value)) {
                  setNewPasswordError("");
                }

                if (repeatNewPasswordError && value === repeatNewPassword) {
                  setRepeatNewPasswordError("");
                }

                setNewPassword(value);
              }}
              ref={newPasswordRef}
              error={newPasswordError}
              autoComplete="new-password"
            />
            <InputPassword
              label="Repetir nova palavra-passe"
              value={repeatNewPassword}
              onChange={(value) => {
                setRepeatNewPassword(value);

                if (repeatNewPasswordError && value == newPassword) {
                  setRepeatNewPasswordError("");
                }
              }}
              ref={repeatNewPasswordRef}
              error={repeatNewPasswordError}
              autoComplete="new-password"
            />
            {isErrorChangePassword && (
              <InputError error="Ocorreu um erro ao alterar a palavra-passe" />
            )}
            <Button
              label="Alterar palavra-passe"
              type="primary"
              htmlType="submit"
              loading={isPendingChangePassword}
            />
          </Stack>
        </form>
        <PasswordChecks password={newPassword} />
      </StackHalfHalf>
    </Stack>
  );
};

export default ChangePassword;
