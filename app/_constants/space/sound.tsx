import IconSpacesSoundCompleteSoundSystem from "@/_design_system/_icons/Spaces/Sound/CompleteSoundSystem";
import IconSpacesSoundAmbientMusic from "@/_design_system/_icons/Spaces/Sound/AmbientMusic.svg";
import IconSpacesSoundClientMusic from "@/_design_system/_icons/Spaces/Sound/ClientMusic.svg";
import IconSpacesSoundLiveMusic from "@/_design_system/_icons/Spaces/Sound/LiveMusic.svg";
import IconSpacesSoundDJEquipment from "@/_design_system/_icons/Spaces/Sound/DJEquipment.svg";
import IconPacksFeaturesChildrenEntertainers from "@/_design_system/_icons/Packs/Features/Children/Entertainers.svg";
import IconPacksFeaturesServicesAudiovisual from "@/_design_system/_icons/Packs/Features/Services/Audiovisual.svg";
import IconPacksFeaturesServicesDecoration from "@/_design_system/_icons/Packs/Features/Services/Decoration.svg";
import IconSpacesFacilitiesDigitalTelevision from "@/_design_system/_icons/Spaces/Facilities/DigitalTelevision.svg";

export const SPACE_SOUND = [
  {
    id: "complete-sound-system",
    label: "Sistema de som completo",
    microcopy:
      "Sistema completo que inclui microfones para usufruto do cliente",
    icon: <IconSpacesSoundCompleteSoundSystem />,
  },
  {
    id: "ambient-music",
    label: "Sistema de som para música ambiente",
    microcopy: "Música ambiente do espaço incluída",
    icon: <IconSpacesSoundAmbientMusic />,
  },
  {
    id: "client-music",
    label: "Música do cliente",
    microcopy: "Possibilidade de o cliente trazer o seu sistema de som",
    icon: <IconSpacesSoundClientMusic />,
  },
  {
    id: "live-music",
    label: "Permite música ao vivo",
    microcopy:
      "Possibilidade de o cliente contratar uma banda para tocar no evento",
    icon: <IconSpacesSoundLiveMusic />,
  },
  {
    id: "dj-equipment",
    label: "Equipamento para DJ",
    microcopy: "Sistema de som para DJ disponível",
    icon: <IconSpacesSoundDJEquipment />,
  },
  {
    id: "space-sound-animation-entertainment",
    label: "Animação & entretenimento",
    microcopy:
      "Possibilidade do cliente contratar animação externa (ex: Animação infantil como insufláveis, atividades ou team buildings indoor e outdoor, artistas, entre outros)",
    icon: <IconPacksFeaturesChildrenEntertainers />,
  },
  {
    id: "space-sound-audiovisuals",
    label: "Audiovisuais",
    microcopy:
      "Possibilidade do cliente contratar audiovisuais externos (sistema de som, iluminação, vídeo/projeção, equipamentos tecnológicos)",
    icon: <IconSpacesSoundCompleteSoundSystem />,
  },
  {
    id: "space-sound-photography-video",
    label: "Fotografia e vídeo",
    microcopy: "Possibilidade do cliente contratar fotógrafo ou videógrafo",
    icon: <IconPacksFeaturesServicesAudiovisual />,
  },
  {
    id: "space-sound-furniture-decoration",
    label: "Mobiliário & decoração",
    microcopy:
      "Possibilidade do cliente contratar mobiliário e decoração externa",
    icon: <IconPacksFeaturesServicesDecoration />,
  },
  {
    id: "space-sound-additional-services",
    label: "Serviços adicionais",
    microcopy:
      "Possibilidade do cliente contratar outros serviços adicionais externos (ex: hospedeiras, transportes, serviços de beleza, etc.)",
    icon: <IconSpacesFacilitiesDigitalTelevision />,
  },
] as const;

export type SpaceSound = (typeof SPACE_SOUND)[number]["id"];
