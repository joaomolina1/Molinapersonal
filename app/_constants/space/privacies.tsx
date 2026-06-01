import IconSpacesTypeOfSpaceExclusiveSpace from "@/_design_system/_icons/Spaces/TypeOfSpace/ExclusiveSpace.svg";
import IconSpacesTypeOfSpacePrivateSpace from "@/_design_system/_icons/Spaces/TypeOfSpace/PrivateSpace.svg";
import IconSpacesTypeOfSpaceSemiPrivateSpace from "@/_design_system/_icons/Spaces/TypeOfSpace/SemiPrivateSpace.svg";
import IconSpacesTypeOfSpaceSharedSpace from "@/_design_system/_icons/Spaces/TypeOfSpace/SharedSpace.svg";

export const SPACE_PRIVACIES = [
  {
    id: "exclusive-space",
    label: "Espaço exclusivo",
    microcopy: "Exclusividade total do espaço",
    icon: <IconSpacesTypeOfSpaceExclusiveSpace />,
  },
  {
    id: "private-space",
    label: "Espaço privado no local",
    microcopy: "Espaço privado no local sem exposição a outros clientes",
    icon: <IconSpacesTypeOfSpacePrivateSpace />,
  },
  {
    id: "semi-private-space",
    label: "Espaço semi-privado no local",
    microcopy: "Espaço privado no local mas com exposição a outros clientes",
    icon: <IconSpacesTypeOfSpaceSemiPrivateSpace />,
  },
  {
    id: "shared-space",
    label: "Espaço partilhado",
    microcopy: "Espaço aberto a outros clientes",
    icon: <IconSpacesTypeOfSpaceSharedSpace />,
  },
] as const;

export type SpacePrivacy = (typeof SPACE_PRIVACIES)[number]["id"];
