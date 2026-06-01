import { PACK_CAPACITIES, PackCapacity } from "@/_constants/pack/capacities";
import InputCapacity from "@/_design_system/InputCapacity/InputCapacity";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { InputError } from "@/_design_system/_utils/InputWrapper";

const Capacity = ({
  capacities = [],
  setCapacities,
  error,
}: {
  capacities?: PackCapacity[];
  setCapacities?: (capacities: PackCapacity[]) => void;
  error?: string;
}) => {
  const setCapacity = (newCapacity: PackCapacity) => {
    let newCapacities: PackCapacity[];

    if (!capacities.find(({ layout }) => layout === newCapacity.layout)) {
      newCapacities = [...capacities, newCapacity];
    } else {
      newCapacities = capacities.map((capacity) =>
        capacity.layout === newCapacity.layout ? newCapacity : capacity,
      );
    }

    setCapacities?.(newCapacities);
  };

  return (
    <Stack gap="16px" alignItems="stretch">
      <TextBlock
        subtitle="Indique a lotação máxima."
        body="Diga-nos quantas pessoas podem estar em cada layout."
      />
      {error && <InputError error={error} />}
      <div style={{ maxWidth: "47rem" }} aria-label="Layouts do pack">
        {PACK_CAPACITIES.map((spaceCapacity) => (
          <InputCapacity
            key={spaceCapacity.id}
            text={spaceCapacity.text}
            microcopy={spaceCapacity.microcopy}
            icon={spaceCapacity.icon}
            value={
              capacities.find(
                (capacity) => spaceCapacity.id === capacity.layout,
              )?.capacity
            }
            onChange={(value) =>
              setCapacity({
                layout: spaceCapacity.id,
                capacity: value ?? 0,
              })
            }
          />
        ))}
      </div>
    </Stack>
  );
};

export default Capacity;
