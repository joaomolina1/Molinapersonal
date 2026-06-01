import {
  SPACE_ACCESSIBILITIES,
  SpaceAccessibility,
} from "@/_constants/space/accessibilities";
import ChipList from "../_shared/ChipList";

const Accessibilities = ({
  accessibilities = [],
  setAccessibilities,
}: {
  accessibilities?: SpaceAccessibility[];
  setAccessibilities?: (accessibilities: SpaceAccessibility[]) => void;
}) => {
  return (
    <ChipList
      subtitle="Indique as acessibilidades que o espaço possui."
      chipLists={[{ chips: SPACE_ACCESSIBILITIES }]}
      selected={accessibilities}
      onChange={setAccessibilities}
    />
  );
};

export default Accessibilities;
