import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import ChipList from "../_shared/ChipList";
import { VENUE_SLEEPING, VenueSleeping } from "@/_constants/venue/sleeping";
import { VENUE_PARKING, VenueParking } from "@/_constants/venue/parking";

const Extras = ({
  sleeping,
  setSleeping,
  parking,
  setParking,
}: {
  sleeping?: VenueSleeping[];
  setSleeping?: (sleeping: VenueSleeping[]) => void;
  parking?: VenueParking[];
  setParking?: (parking: VenueParking[]) => void;
}) => {
  return (
    <Stack gap="16px" alignItems="flex-start">
      <TextBlock
        subtitle="Diga-nos mais algumas informações"
        body="Selecione todas as opções que se aplicarem."
      />
      <ChipList
        label="Alojamento"
        selected={sleeping}
        onChange={setSleeping}
        chipLists={[{ chips: VENUE_SLEEPING }]}
      />
      <ChipList
        label="Estacionamento"
        selected={parking}
        onChange={setParking}
        chipLists={[{ chips: VENUE_PARKING }]}
      />
    </Stack>
  );
};

export default Extras;
