import Chip from "@/_design_system/Chip";
import InputNumber from "@/_design_system/InputNumber";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { useState } from "react";

const NoticeDays = ({
  noticeDays,
  setNoticeDays,
  error,
}: {
  noticeDays?: number;
  setNoticeDays?: (noticeDays: number | undefined) => void;
  error?: string;
}) => {
  const [isCustom, setIsCustom] = useState(
    noticeDays !== undefined && !DEFAULT_DAYS.includes(noticeDays),
  );

  return (
    <Stack gap="16px" alignItems="flex-start">
      <div className="hide-desktop-large">
        <TextBlock
          label="Quantos dias são necessários para preparar a reserva?"
          body="Indique o nº mínimo de dias de antecedência que necessita para preparar este pack"
        />
      </div>
      <div className="hide-mobile-large">
        <TextBlock
          subtitle="Quantos dias são necessários para preparar a reserva?"
          body="Indique o nº mínimo de dias de antecedência que necessita para preparar este pack"
        />
      </div>
      {error && <InputError error={error} />}
      <Stack
        row
        gap="1rem"
        flexWrap="wrap"
        ariaLabel="Quantos dias são necessários para preparar a reserva?"
      >
        {DEFAULT_DAYS.map((days) => (
          <Chip
            key={days}
            type="radio"
            radioGroupName="days-in-advance"
            label={
              days === 0 ? "Nenhum" : `${days} ${days === 1 ? "dia" : "dias"}`
            }
            checked={!isCustom && noticeDays === days}
            onChange={() => {
              setNoticeDays?.(days);
              setIsCustom(false);
            }}
          />
        ))}
        <Chip
          key="custom"
          type="radio"
          radioGroupName="days-in-advance"
          label="Definir"
          checked={isCustom}
          onChange={() => {
            setNoticeDays?.(undefined);
            setIsCustom(true);
          }}
        />
      </Stack>
      {isCustom && (
        <InputNumber
          label="Mínimo"
          measure="dias"
          value={noticeDays}
          onChange={(value) => setNoticeDays?.(value)}
          style={{ maxWidth: "12rem" }}
          allowNegative={false}
          decimalScale={0}
        />
      )}
    </Stack>
  );
};

const DEFAULT_DAYS = [0, 1, 2, 3, 4, 5, 10, 14, 20, 30];

export default NoticeDays;
