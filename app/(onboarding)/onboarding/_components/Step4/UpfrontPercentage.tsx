import InputNumber from "@/_design_system/InputNumber";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";

const UpfrontPercentage = ({
  upfrontPercentage,
  setUpfrontPercentage,
  error,
}: {
  upfrontPercentage?: number;
  setUpfrontPercentage?: (value: number | undefined) => void;
  error?: string;
}) => (
  <Stack gap="16px" alignItems="flex-start">
    <div className="hide-desktop-large">
      <TextBlock
        label="Diga-nos qual a percentagem cobrada no momento da reserva."
        body="O valor restante será cobrado após a data limite de cancelamento. Se a reserva for efetuada após a data limite de cancelamento, o cliente será cobrado na totalidade."
      />
    </div>
    <div className="hide-mobile-large">
      <TextBlock
        subtitle="Diga-nos qual a percentagem cobrada no momento da reserva."
        body="O valor restante será cobrado após a data limite de cancelamento. Se a reserva for efetuada após a data limite de cancelamento, o cliente será cobrado na totalidade."
      />
    </div>
    <InputNumber
      value={upfrontPercentage}
      onChange={setUpfrontPercentage}
      label="Percentagem cobrada no momento da reserva"
      measure="%"
      allowNegative={false}
      decimalScale={0}
      error={error}
    />
  </Stack>
);

export default UpfrontPercentage;
