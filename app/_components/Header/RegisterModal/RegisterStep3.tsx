import Button from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";

const RegisterStep3 = ({
  onClose,
  email,
}: {
  onClose: () => void;
  email: string;
}) => {
  return (
    <Stack gap="1.5rem">
      <TextBlock
        subtitle="Email de verificação enviado"
        body={
          <>
            Enviámos um email de ativação para:
            <br />
            {email}
            <br />
            <br />
            Por favor, verifique a sua caixa de entrada e siga as instruções.
          </>
        }
      />
      <Button label="Ok" type="primary" onClick={onClose} />
    </Stack>
  );
};

export default RegisterStep3;
