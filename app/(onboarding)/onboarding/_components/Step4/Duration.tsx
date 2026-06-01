import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import Chip from "@/_design_system/Chip";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import InputNumber from "@/_design_system/InputNumber";
import { TimeDuration } from "@/_utils/number";
import StackHalfHalf from "@/_design_system/StackHalfHalf";
import Alert from "@/_design_system/Alert";
import IconUserInterfaceMiscellaneousTip from "@/_design_system/_icons/UserInterface/Miscellaneous/Tip.svg";

const Duration = ({
  hasDuration,
  setHasDuration,
  minTime,
  setMinTime,
  maxTime,
  setMaxTime,
  error,
}: {
  hasDuration?: boolean;
  setHasDuration?: (hasDuration: boolean) => void;
  minTime?: TimeDuration | null;
  setMinTime?: (minTime: TimeDuration | null) => void;
  maxTime?: TimeDuration | null;
  setMaxTime?: (maxTime: TimeDuration | null) => void;
  error?: string;
}) => {
  return (
    <Stack gap="1.5rem">
      <Stack gap="1rem">
        <TextBlock subtitle="O pack tem duração mínima e máxima?" />
        {error && <InputError error={error} />}
        <Stack
          row
          gap="1rem"
          flexWrap="wrap"
          ariaLabel="O pack tem duração mínima e máxima?"
        >
          <Chip
            label="Não"
            checked={hasDuration === false}
            onChange={() => {
              setHasDuration?.(false);
              setMinTime?.(null);
              setMaxTime?.(null);
            }}
          />
          <Chip
            label="Definir"
            checked={hasDuration === true}
            onChange={() => setHasDuration?.(true)}
          />
        </Stack>
      </Stack>
      {hasDuration && (
        <StackHalfHalf reverse>
          <Alert
            icon={<IconUserInterfaceMiscellaneousTip />}
            title="Dica"
            text="Utilize estes campos para definir horas mínimas e máximas do seu pack. Por exemplo, um passeio de barco pode ter no mínimo 3 horas. Os clientes que procurarem packs com menos horas não irão ver este pack. Por outro lado, o mesmo passeio de barco pode ter no máximo 5 horas. Os clientes que procurarem packs com mais horas vão ver este pack mas serão notificados que a reserva que estão a fazer tem menos horas do que as que foram colocadas na pesquisa."
          />
          <Stack gap="1rem" ariaLabel="Número mínimo e máximo de horas do pack">
            <TextBlock body="Indique o nº mínimo e máximo de horas do pack" />
            <Stack row gap="1rem">
              <InputNumber
                label="Mínimo"
                measure="h"
                value={minTime?.number}
                onChange={(value) =>
                  setMinTime?.(
                    value === undefined ? null : TimeDuration.fromNumber(value),
                  )
                }
                style={{ maxWidth: "12rem" }}
                allowNegative={false}
                decimalScale={0}
              />
              <InputNumber
                label="Máximo"
                measure="h"
                value={maxTime?.number}
                onChange={(value) =>
                  setMaxTime?.(
                    value === undefined ? null : TimeDuration.fromNumber(value),
                  )
                }
                style={{ maxWidth: "12rem" }}
                allowNegative={false}
                decimalScale={0}
              />
            </Stack>
          </Stack>
        </StackHalfHalf>
      )}
    </Stack>
  );
};

export const isValidDuration = (
  minTime?: TimeDuration | null,
  maxTime?: TimeDuration | null,
) => {
  if (!minTime || !maxTime) {
    return false;
  }

  return maxTime.number > 0 && maxTime.number >= minTime.number;
};

export default Duration;
