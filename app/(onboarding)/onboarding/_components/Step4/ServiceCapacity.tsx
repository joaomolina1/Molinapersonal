import { PackCapacity } from "@/_constants/pack/capacities";
import InputNumber from "@/_design_system/InputNumber";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";

const ServiceCapacity = ({
  capacities = [],
  setCapacities,
}: {
  capacities?: PackCapacity[];
  setCapacities?: (capacities: PackCapacity[]) => void;
}) => {
  return (
    <Stack gap="16px" alignItems="stretch">
      <TextBlock
        subtitle="Diga-nos quantas pessoas podem usufruir deste pack."
        body="Se não tiver limite, deixe o campo vazio"
      />
      <InputNumber
        label="Capacidade"
        showLabel={false}
        measure="pessoas"
        value={
          capacities?.find(({ layout }) => layout === "service-pack-capacity")
            ?.capacity
        }
        onChange={(value) =>
          value
            ? setCapacities?.([
                { layout: "service-pack-capacity", capacity: value },
              ])
            : setCapacities?.([])
        }
        style={{ maxWidth: "12.5rem" }}
        allowNegative={false}
        decimalScale={0}
        placeholder="Máximo"
      />
    </Stack>
  );
};

export default ServiceCapacity;
