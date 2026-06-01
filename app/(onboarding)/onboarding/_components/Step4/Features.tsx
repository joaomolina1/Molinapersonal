import ChipList from "../_shared/ChipList";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import Chip from "@/_design_system/Chip";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { PACK_FEATURES, PackFeature } from "@/_constants/pack/features";
import StackHalfHalf from "@/_design_system/StackHalfHalf";
import Alert from "@/_design_system/Alert";
import IconUserInterfaceMiscellaneousTip from "@/_design_system/_icons/UserInterface/Miscellaneous/Tip.svg";

const Features = ({
  hasFeatures,
  setHasFeatures,
  features = [],
  setFeatures,
  error,
}: {
  hasFeatures?: boolean;
  setHasFeatures?: (hasFeatures: boolean) => void;
  features?: PackFeature[];
  setFeatures?: (features: PackFeature[]) => void;
  error?: string;
}) => {
  return (
    <Stack gap="1.5rem">
      <Stack gap="1rem">
        <TextBlock subtitle="O que pode incluir este pack?" />
        {error && <InputError error={error} />}
        <StackHalfHalf reverse>
          <Alert
            icon={<IconUserInterfaceMiscellaneousTip />}
            title="Dica"
            text="Se quiser acrescentar mais serviços ao aluguer carregue no separador."
          />
          <Stack row gap="1rem" flexWrap="wrap">
            <Chip
              label="Apenas aluguer de espaço"
              checked={hasFeatures === false}
              onChange={() => setHasFeatures?.(false)}
            />
            <Chip
              label="Catering, serviços, atividades..."
              checked={hasFeatures === true}
              onChange={() => setHasFeatures?.(true)}
            />
          </Stack>
        </StackHalfHalf>
      </Stack>
      {hasFeatures && (
        <ChipList
          label="Além do aluguer de espaço, indique tudo o que o cliente pode incluir ao reservar este pack."
          chipLists={PACK_FEATURES}
          selected={features}
          onChange={setFeatures}
        />
      )}
    </Stack>
  );
};

export default Features;
