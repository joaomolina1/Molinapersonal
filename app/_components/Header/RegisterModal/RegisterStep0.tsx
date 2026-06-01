import Button from "@/_design_system/Button";
import InputText from "@/_design_system/InputText";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { useVerifyCode } from "@/_services/session";
import { FormEvent, useRef } from "react";

const RegisterStep1 = ({
  onContinue,
  code,
  setCode,
}: {
  onContinue: () => void;
  code: string;
  setCode: (code: string) => void;
}) => {
  const codeRef = useRef<HTMLInputElement>(null);

  const {
    mutateAsync: verifyCode,
    isPending: isPendingVerifyCode,
    isError: isErrorVerifyCode,
    reset: resetVerifyCode,
  } = useVerifyCode();

  const handleContinue = (e: FormEvent) => {
    e.preventDefault();
    resetVerifyCode();

    if (!code) {
      codeRef.current?.focus();
      return;
    }

    verifyCode({ code }).then(() => onContinue());
  };

  return (
    <Stack gap="1.5rem">
      <TextBlock
        subtitle="Código de convite"
        body="Introduza o código que lhe foi fornecido para se registar"
      />
      <form onSubmit={handleContinue}>
        <Stack gap="1rem">
          <InputText
            label="Código"
            value={code}
            onChange={setCode}
            ref={codeRef}
            error={isErrorVerifyCode ? "Código inválido" : undefined}
          />
          <Button
            label="Continuar"
            type="primary"
            htmlType="submit"
            loading={isPendingVerifyCode}
          />
        </Stack>
      </form>
    </Stack>
  );
};

export default RegisterStep1;
