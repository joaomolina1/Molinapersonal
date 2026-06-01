import IconSpacesAccessibilitiesLift from "@/_design_system/_icons/Spaces/Accessibilities/Lift.svg";
import IconSpacesAccessibilitiesFreightElevator from "@/_design_system/_icons/Spaces/Accessibilities/FreightElevator.svg";
import IconSpacesAccessibilitiesHandicapedToilet from "@/_design_system/_icons/Spaces/Accessibilities/HandicapedToilet.svg";
import IconSpacesAccessibilitiesHandicapedAccess from "@/_design_system/_icons/Spaces/Accessibilities/HandicapedAccess.svg";
import IconSpacesAccessibilitiesUnloadingZone from "@/_design_system/_icons/Spaces/Accessibilities/UnloadingZone.svg";

export const SPACE_ACCESSIBILITIES = [
  {
    id: "lift",
    label: "Elevador",
    icon: <IconSpacesAccessibilitiesLift />,
  },
  {
    id: "freight-elevator",
    label: "Monta cargas",
    icon: <IconSpacesAccessibilitiesFreightElevator />,
  },
  {
    id: "handicaped-toilet",
    label: "WC para deficientes",
    icon: <IconSpacesAccessibilitiesHandicapedToilet />,
  },
  {
    id: "handicaped-access",
    label: "Acesso fácil para pessoas com deficiência",
    icon: <IconSpacesAccessibilitiesHandicapedAccess />,
  },
  {
    id: "unloading-zone",
    label: "Zona de descarga",
    icon: <IconSpacesAccessibilitiesUnloadingZone />,
  },
] as const;

export type SpaceAccessibility = (typeof SPACE_ACCESSIBILITIES)[number]["id"];
