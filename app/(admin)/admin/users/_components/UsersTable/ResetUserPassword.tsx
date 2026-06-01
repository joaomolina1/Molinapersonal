import InputPassword from "@/_components/InputPassword";
import Button from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import { useShowToast } from "@/_design_system/Toast";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { User } from "@/_models/user";
import { useAdminResetPassword } from "@/_services/session";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { FormEvent, useState } from "react";

const { block } = createBEMClasses("reset-user-password");

const ResetUserPassword = ({ user }: { user: User }) => {
  const isMobile = useMediaQuery("large");

  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const enableSubmit =
    !!password && !!repeatPassword && password === repeatPassword;

  const {
    mutateAsync: resetPassword,
    isPending: isPendingResetPassword,
    isError: isErrorResetPassword,
    reset: resetResetPassword,
  } = useAdminResetPassword();

  const showToast = useShowToast();

  const handleResetPassword = (e: FormEvent) => {
    e.preventDefault();

    resetResetPassword();

    if (!enableSubmit) {
      return;
    }

    resetPassword({ user: user.id, new: password })
      .then(() => {
        setPassword("");
        setRepeatPassword("");

        showToast({ text: "Password alterada com sucesso" });
      })
      .catch((e: Error) => {
        console.error(e);
        showToast({ text: "Ocorreu um erro ao alterar a password" });
      });
  };

  return (
    <Stack gap="0.5rem" alignItems="flex-start" className={block()}>
      <h5>Alterar password</h5>
      <form onSubmit={handleResetPassword}>
        <Stack row={!isMobile} gap="1rem">
          <InputPassword
            label="Nova palavra-passe"
            value={password}
            onChange={setPassword}
          />
          <InputPassword
            label="Repetir nova palavra-passe"
            value={repeatPassword}
            onChange={setRepeatPassword}
          />
          <Button
            label="Alterar palavra-passe"
            type="primary"
            htmlType="submit"
            disabled={!enableSubmit}
            loading={isPendingResetPassword}
          />
        </Stack>
      </form>
      {isErrorResetPassword && (
        <InputError error="Ocorreu um erro ao alterar a palavra-passe" />
      )}
    </Stack>
  );
};

export default ResetUserPassword;
