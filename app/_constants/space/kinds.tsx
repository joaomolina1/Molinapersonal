import IconSpacesTypeOfSpaceIndoorSpace from "@/_design_system/_icons/Spaces/TypeOfSpace/IndoorSpace.svg";
import IconSpacesTypeOfSpaceOutdoorSpace from "@/_design_system/_icons/Spaces/TypeOfSpace/OutdoorSpace.svg";
import IconSpacesTypeOfSpaceMixedSpace from "@/_design_system/_icons/Spaces/TypeOfSpace/MixedSpace.svg";

export const SPACE_KINDS = [
  {
    id: "indoor-space",
    label: "Espaço indoor",
    microcopy: "Espaço localizado dentro de um edifício ou estrutura fechada",
    icon: <IconSpacesTypeOfSpaceIndoorSpace />,
  },
  {
    id: "outdoor-space",
    label: "Espaço outdoor",
    microcopy: "Espaço ou ambiente localizado ao ar livre",
    icon: <IconSpacesTypeOfSpaceOutdoorSpace />,
  },
  {
    id: "mixed-space",
    label: "Espaço misto",
    microcopy: "Espaço que integra ambientes fechados e ao ar livre",
    icon: <IconSpacesTypeOfSpaceMixedSpace />,
  },
] as const;

export type SpaceKind = (typeof SPACE_KINDS)[number]["id"];
