import Button, { TextButton } from "@/_design_system/Button";
import InputText from "@/_design_system/InputText";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { FormEvent, useRef } from "react";

const RegisterStep1 = ({
  loginHref,
  onContinue,
  email,
  setEmail,
}: {
  loginHref: string;
  onContinue: () => void;
  email: string;
  setEmail: (email: string) => void;
}) => {
  const emailRef = useRef<HTMLInputElement>(null);

  const handleContinue = (e: FormEvent) => {
    e.preventDefault();

    if (!email) {
      emailRef.current?.focus();
      return;
    }

    onContinue();
  };

  return (
    <Stack gap="1.5rem">
      <TextBlock subtitle="Bem vindo(a) à RINU" body="Criar conta" />
      <form onSubmit={handleContinue}>
        <Stack gap="1rem">
          <InputText
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            ref={emailRef}
          />
          <Button label="Continuar" type="primary" htmlType="submit" />
        </Stack>
      </form>
      <Stack
        row
        alignItems="center"
        justifyContent="center"
        gap="0.375rem"
        className="session-modal-switch"
      >
        Já tem conta?
        <TextButton text="Entrar" href={loginHref} prefetch={false} />
      </Stack>
    </Stack>
  );
};

export default RegisterStep1;
