import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";

const AdjudicationBody = () => (
  <>
    A RINU definiu que a política de adjudicação é de 20% em todas as situações.
    <br />É com o pagamento da adjudicação que o espaço ou serviço fica
    devidamente reservado e confirmado.
  </>
);

const Adjudication = () => {
  return (
    <Stack gap="16px" alignItems="flex-start">
      <div className="hide-desktop-large">
        <TextBlock
          label="Política de adjudicação"
          body={<AdjudicationBody />}
        />
      </div>
      <div className="hide-mobile-large">
        <TextBlock
          subtitle="Política de adjudicação"
          body={<AdjudicationBody />}
        />
      </div>
    </Stack>
  );
};

export default Adjudication;
