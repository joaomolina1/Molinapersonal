import { SPACE_KINDS, SpaceKind } from "@/_constants/space/kinds";
import Card from "@/_design_system/Card";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { InputError } from "@/_design_system/_utils/InputWrapper";

const Kind = ({
  kind,
  setKind,
  error,
}: {
  kind?: SpaceKind;
  setKind?: (kind: SpaceKind) => void;
  error?: string;
}) => {
  return (
    <Stack gap="16px" alignItems="flex-start">
      <TextBlock subtitle="Qual é o tipo de espaço?" />
      {error && <InputError error={error} />}
      <div className="card-group" aria-label="Tipo de espaço">
        {SPACE_KINDS.map((spaceKind) => (
          <Card
            key={spaceKind.id}
            type="radio"
            radioGroupName="space-kind"
            icon={spaceKind.icon}
            text={spaceKind.label}
            microcopy={spaceKind.microcopy}
            checked={kind === spaceKind.id}
            onChange={() => setKind?.(spaceKind.id)}
          />
        ))}
      </div>
    </Stack>
  );
};

export default Kind;
