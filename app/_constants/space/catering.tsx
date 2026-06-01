import IconSpacesCateringBar from "@/_design_system/_icons/Spaces/Catering/Bar.svg";
import IconSpacesCateringClientCatering from "@/_design_system/_icons/Spaces/Catering/ClientCatering.svg";
import IconSpacesCateringClientDrinks from "@/_design_system/_icons/Spaces/Catering/ClientDrinks.svg";
import IconSpacesCateringClientFood from "@/_design_system/_icons/Spaces/Catering/ClientFood.svg";
import IconSpacesCateringPrivateBar from "@/_design_system/_icons/Spaces/Catering/PrivateBar.svg";
import IconSpacesCateringRestaurant from "@/_design_system/_icons/Spaces/Catering/Restaurant.svg";
import IconSpacesCateringSpaceCatering from "@/_design_system/_icons/Spaces/Catering/SpaceCatering.svg";
import IconVenuesTypeOfVenueRooftop from "@/_design_system/_icons/Venues/TypeOfVenue/Rooftop.svg";

export const SPACE_CATERING = [
  {
    id: "exclusive-catering",
    label: "Catering Próprio",
    microcopy:
      "Espaço oferece serviço de catering próprio (se exigir exclusividade neste serviço, não selecione as outras opções de catering)",
    icon: <IconSpacesCateringClientCatering />,
  },
  {
    id: "external-catering",
    label: "Catering Externo",
    microcopy: "Espaço permite que o cliente traga serviço de catering externo",
    icon: <IconSpacesCateringClientFood />,
  },
  {
    id: "private-catering",
    label: "Catering Particular",
    microcopy: "Espaço permite que o cliente traga refeições preparadas",
    icon: <IconSpacesCateringSpaceCatering />,
  },
  {
    id: "exclusive-bar",
    label: "Bar Próprio",
    microcopy:
      "Espaço tem serviço de bar próprio (se exigir exclusividade neste serviço, não selecione as outras opções de bar)",
    icon: <IconSpacesCateringBar />,
  },
  {
    id: "external-bar",
    label: "Bar Externo",
    microcopy: "Espaço permite que o cliente traga serviço de bar externo",
    icon: <IconSpacesCateringClientDrinks />,
  },
  {
    id: "private-bar",
    label: "Bar Particular",
    microcopy: "Espaço permite que o cliente traga as suas próprias bebidas",
    icon: <IconSpacesCateringPrivateBar />,
  },
  {
    id: "client-alcohol",
    label: "Álcool do Cliente",
    microcopy: "Espaço permite que o cliente traga bebidas alcoólicas",
    icon: <IconVenuesTypeOfVenueRooftop />,
  },
  {
    id: "catering-restaurant",
    label: "Restaurante",
    microcopy: "Espaço dispõe de restaurante",
    icon: <IconSpacesCateringRestaurant />,
  },
] as const;

export type SpaceCatering = (typeof SPACE_CATERING)[number]["id"];
