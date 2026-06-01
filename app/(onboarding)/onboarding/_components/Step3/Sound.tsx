import { SPACE_SOUND, SpaceSound } from "@/_constants/space/sound";
import CheckboxCardList from "../_shared/CheckboxCardList";

const Sound = ({
  sound = [],
  setSound,
}: {
  sound?: SpaceSound[];
  setSound?: (sound: SpaceSound[]) => void;
}) => {
  return (
    <CheckboxCardList
      subtitle="Indique as opções de música de que dispõe e de serviços que permite no seu espaço"
      body="Selecione aqui as possibilidades e permissões do seu espaço, é com estas permissões que a RINU irá sugerir serviços adicionais aos seus clientes"
      cards={SPACE_SOUND.map((attr) => ({ ...attr, text: attr.label }))}
      selected={sound}
      onChange={setSound}
    />
  );
};

export default Sound;
