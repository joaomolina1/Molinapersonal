import { SPACE_FACILITIES, SpaceFacility } from "@/_constants/space/facilities";
import ChipList from "../_shared/ChipList";

const Facilities = ({
  facilities = [],
  setFacilities,
}: {
  facilities?: SpaceFacility[];
  setFacilities?: (facilities: SpaceFacility[]) => void;
}) => {
  return (
    <ChipList
      subtitle="Quais as facilidades disponíveis?"
      chipLists={SPACE_FACILITIES}
      selected={facilities}
      onChange={setFacilities}
    />
  );
};

export default Facilities;
