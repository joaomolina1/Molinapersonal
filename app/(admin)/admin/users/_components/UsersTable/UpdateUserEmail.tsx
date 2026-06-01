import InputText from "@/_design_system/InputText";
import Button from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import { useShowToast } from "@/_design_system/Toast";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { User, useUpdateUserEmail } from "@/_models/user";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { FormEvent, useRef, useState } from "react";

const UpdateUserEmail = ({ user }: { user: User }) => {
  const isMobile = useMediaQuery("small");

  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState({
    email: user.email,
    isValid: true,
  });

  const enableSubmit =
    !!email.email && email.email !== user.email && email.isValid;

  const {
    mutateAsync: updateEmail,
    isPending: isPendingUpdateEmail,
    isError: isErrorUpdateEmail,
    reset: resetUpdateEmail,
  } = useUpdateUserEmail();

  const showToast = useShowToast();

  const handleUpdateEmail = (e: FormEvent) => {
    e.preventDefault();

    resetUpdateEmail();

    if (!enableSubmit) {
      return;
    }

    updateEmail({ userId: user.id, email: email.email })
      .then(() => {
        showToast({ text: "Email alterado com sucesso" });
      })
      .catch((e: Error) => {
        console.error(e);
        showToast({ text: "Ocorreu um erro ao alterar o email" });
      });
  };

  return (
    <Stack gap="0.5rem" alignItems="flex-start">
      <h5>Alterar email</h5>
      <form onSubmit={handleUpdateEmail}>
        <Stack row={!isMobile} gap="1rem">
          <InputText
            label="Novo email"
            value={email.email}
            onChange={(value) =>
              setEmail({
                email: value,
                isValid: !!emailRef.current?.checkValidity(),
              })
            }
            ref={emailRef}
            type="email"
            style={{ width: "16rem" }}
          />
          <Button
            label="Alterar email"
            type="primary"
            htmlType="submit"
            disabled={!enableSubmit}
            loading={isPendingUpdateEmail}
          />
        </Stack>
      </form>
      {isErrorUpdateEmail && (
        <InputError error="Ocorreu um erro ao alterar o email" />
      )}
    </Stack>
  );
};

export default UpdateUserEmail;
