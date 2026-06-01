import { SPACE_CATERING, SpaceCatering } from "@/_constants/space/catering";
import CheckboxCardList from "../_shared/CheckboxCardList";

const Catering = ({
  catering = [],
  setCatering,
}: {
  catering?: SpaceCatering[];
  setCatering?: (catering: SpaceCatering[]) => void;
}) => {
  return (
    <CheckboxCardList
      subtitle="Indique as opções de catering que estão disponíveis."
      body="Defina as permissões do seu espaço relativamente às possibilidades de catering."
      cards={SPACE_CATERING.map((attr) => ({ ...attr, text: attr.label }))}
      selected={catering}
      onChange={setCatering}
    />
  );
};

export default Catering;
