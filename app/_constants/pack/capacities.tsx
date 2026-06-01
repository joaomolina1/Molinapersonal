import IconSpacesCapacityAmphitheatre from "@/_design_system/_icons/Spaces/Capacity/Amphitheatre";
import IconSpacesCapacityBoardTable from "@/_design_system/_icons/Spaces/Capacity/BoardTable";
import IconSpacesCapacityClassroom from "@/_design_system/_icons/Spaces/Capacity/Classroom.svg";
import IconSpacesCapacityRegularTable from "@/_design_system/_icons/Spaces/Capacity/RegularTable.svg";
import IconSpacesCapacityStanding from "@/_design_system/_icons/Spaces/Capacity/Standing.svg";
import IconSpacesCapacityUTable from "@/_design_system/_icons/Spaces/Capacity/UTable";

export const PACK_CAPACITIES = [
  {
    id: "standing",
    text: "Em pé",
    microcopy: "Capacidade sem mesas ou apenas com mesas de apoio",
    icon: <IconSpacesCapacityStanding />,
  },
  {
    id: "regularTable",
    text: "Sentado à mesa",
    microcopy: "Capacidade para servir refeições com os clientes sentados",
    icon: <IconSpacesCapacityRegularTable />,
  },
  {
    id: "classroom",
    text: "Sala de aulas",
    microcopy: "Mesas individuais ou em linha orientadas a um quadro",
    icon: <IconSpacesCapacityClassroom />,
  },
  {
    id: "amphitheatre",
    text: "Plateia",
    microcopy: "Cadeiras orientadas a um quadro",
    icon: <IconSpacesCapacityAmphitheatre />,
  },
  {
    id: "uTable",
    text: "Mesa em U",
    microcopy: "Capacidade com mesa em formato U",
    icon: <IconSpacesCapacityUTable />,
  },
  {
    id: "boardTable",
    text: "Mesa de board",
    microcopy: "Capacidade com mesa de board",
    icon: <IconSpacesCapacityBoardTable />,
  },
] as const;

export type PackCapacity = {
  layout: (typeof PACK_CAPACITIES)[number]["id"] | "service-pack-capacity";
  capacity: number;
};
