import { SPACE_PRIVACIES, SpacePrivacy } from "@/_constants/space/privacies";
import Card from "@/_design_system/Card";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { InputError } from "@/_design_system/_utils/InputWrapper";

const Privacy = ({
  privacy,
  setPrivacy,
  error,
}: {
  privacy?: SpacePrivacy;
  setPrivacy?: (privacy: SpacePrivacy) => void;
  error?: string;
}) => {
  return (
    <Stack gap="16px" alignItems="flex-start">
      <TextBlock
        subtitle="Que parte do local é que o espaço ocupa?"
        body="Informe os clientes se o espaço é privado ou será partilhado com outros clientes."
      />
      {error && <InputError error={error} />}
      <div className="card-group" aria-label="Privacidade do espaço">
        {SPACE_PRIVACIES.map((spacePrivacy) => (
          <Card
            key={spacePrivacy.id}
            type="radio"
            radioGroupName="space-kind"
            icon={spacePrivacy.icon}
            text={spacePrivacy.label}
            microcopy={spacePrivacy.microcopy}
            checked={privacy === spacePrivacy.id}
            onChange={() => setPrivacy?.(spacePrivacy.id)}
          />
        ))}
      </div>
    </Stack>
  );
};

export default Privacy;
