import Alert from "@/_design_system/Alert";
import InputNumber from "@/_design_system/InputNumber";
import Stack from "@/_design_system/Stack";
import StackHalfHalf from "@/_design_system/StackHalfHalf";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceMiscellaneousTip from "@/_design_system/_icons/UserInterface/Miscellaneous/Tip.svg";

const Area = ({
  area,
  setArea,
  error,
}: {
  area?: number;
  setArea?: (area: number | undefined) => void;
  error?: string;
}) => {
  return (
    <Stack gap="16px" alignItems="flex-start">
      <TextBlock subtitle="Qual é a área útil deste espaço?" />
      <StackHalfHalf reverse>
        <Alert
          icon={<IconUserInterfaceMiscellaneousTip />}
          title="Dica"
          text="Total de m2 disponíveis para o evento. Exemplo: Se o evento for numa sala e no jardim, coloque a soma dos 2 espaços."
        />
        <div>
          <InputNumber
            label="Área do espaço"
            showLabel={false}
            measure={
              <>
                m<sup>2</sup>
              </>
            }
            value={area}
            onChange={setArea}
            style={{ maxWidth: "11.25rem" }}
            allowNegative={false}
            decimalScale={0}
            error={error}
            placeholder="0"
          />
        </div>
      </StackHalfHalf>
    </Stack>
  );
};

export default Area;
