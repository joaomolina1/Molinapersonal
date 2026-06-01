import IconPacksFeaturesCateringBreakfast from "@/_design_system/_icons/Packs/Features/Catering/Breakfast.svg";
import IconPacksFeaturesChildrenEntertainers from "@/_design_system/_icons/Packs/Features/Children/Entertainers.svg";
import IconPacksFeaturesChildrenGames from "@/_design_system/_icons/Packs/Features/Children/Games.svg";
import IconPacksFeaturesChildrenFacialPainting from "@/_design_system/_icons/Packs/Features/Children/FacialPainting.svg";
import IconPacksFeaturesCateringCoffeeBreak from "@/_design_system/_icons/Packs/Features/Catering/CoffeeBreak.svg";
import IconPacksFeaturesCateringCocktail from "@/_design_system/_icons/Packs/Features/Catering/Cocktail.svg";
import IconPacksFeaturesCateringSnack from "@/_design_system/_icons/Packs/Features/Catering/Snack.svg";
import IconPacksFeaturesCateringStartersSnacks from "@/_design_system/_icons/Packs/Features/Catering/StartersSnacks.svg";
import IconPacksFeaturesServicesDJ from "@/_design_system/_icons/Packs/Features/Services/DJ.svg";
import IconPacksFeaturesServicesInstrumentalist from "@/_design_system/_icons/Packs/Features/Services/Instrumentalist.svg";
import IconPacksFeaturesServicesValletParking from "@/_design_system/_icons/Packs/Features/Services/ValletParking.svg";
import IconPacksFeaturesServicesParkAssist from "@/_design_system/_icons/Packs/Features/Services/ParkAssist.svg";
import IconPacksFeaturesServicesHostess from "@/_design_system/_icons/Packs/Features/Services/Hostess.svg";
import IconPacksFeaturesActivitiesSports from "@/_design_system/_icons/Packs/Features/Activities/Sports.svg";
import IconPacksFeaturesActivitiesLudic from "@/_design_system/_icons/Packs/Features/Activities/Ludic.svg";
import IconPacksFeaturesActivitiesChildren from "@/_design_system/_icons/Packs/Features/Activities/Children.svg";
import IconPacksFeaturesActivitiesCrafts from "@/_design_system/_icons/Packs/Features/Activities/Crafts.svg";
import IconSpacesEventTypeCorporateEnterpriseLunch from "@/_design_system/_icons/Spaces/EventType/Corporate/EnterpriseLunch.svg";
import IconVenuesTypeOfVenueBar from "@/_design_system/_icons/Venues/TypeOfVenue/Bar.svg";
import IconSpacesEventTypeCulturePhotoSession from "@/_design_system/_icons/Spaces/EventType/Culture/PhotoSession.svg";
import IconSpacesEventTypeCultureVideoRecording from "@/_design_system/_icons/Spaces/EventType/Culture/VideoRecording.svg";
import IconSpacesFacilitiesInflatable from "@/_design_system/_icons/Spaces/Facilities/Inflatable.svg";
import IconVenuesTypeOfVenueHotel from "@/_design_system/_icons/Venues/TypeOfVenue/Hotel.svg";
import IconPacksFeaturesServicesAudiovisual from "@/_design_system/_icons/Packs/Features/Services/Audiovisual.svg";
import IconPacksFeaturesServicesEventPlanner from "@/_design_system/_icons/Packs/Features/Services/EventPlanner.svg";
import IconPacksFeaturesCateringBrunch from "@/_design_system/_icons/Packs/Features/Catering/Brunch.svg";
import IconPacksFeaturesServicesDecoration from "@/_design_system/_icons/Packs/Features/Services/Decoration.svg";
import IconPacksFeaturesServicesCleaning from "@/_design_system/_icons/Packs/Features/Services/Cleaning.svg";
import IconPacksFeaturesServicesFurniture from "@/_design_system/_icons/Packs/Features/Services/Furniture.svg";
import IconPacksFeaturesServicesSecurity from "@/_design_system/_icons/Packs/Features/Services/Security.svg";
import IconPacksFeaturesServicesParking from "@/_design_system/_icons/Packs/Features/Services/Parking.svg";
import IconPacksFeaturesServicesLiveBand from "@/_design_system/_icons/Packs/Features/Services/LiveBand.svg";
import IconPacksFeaturesServicesKaraoke from "@/_design_system/_icons/Packs/Features/Services/Karaoke.svg";

export const PACK_FEATURES = [
  {
    label: "Catering",
    chips: [
      {
        id: "coffee-break",
        label: "Coffee Break",
        icon: <IconPacksFeaturesCateringCoffeeBreak />,
      },
      {
        id: "breakfast",
        label: "Pequeno-almoço",
        icon: <IconPacksFeaturesCateringBreakfast />,
      },
      {
        id: "cocktail",
        label: "Cocktail",
        icon: <IconPacksFeaturesCateringCocktail />,
      },
      {
        id: "lunch",
        label: "Almoço",
        icon: <IconSpacesEventTypeCorporateEnterpriseLunch />,
      },
      {
        id: "snack",
        label: "Lanche",
        icon: <IconPacksFeaturesCateringSnack />,
      },
      {
        id: "dinner",
        label: "Jantar",
        icon: <IconSpacesEventTypeCorporateEnterpriseLunch />,
      },
      {
        id: "supper",
        label: "Ceia",
        icon: <IconPacksFeaturesCateringStartersSnacks />,
      },
      {
        id: "bar",
        label: "Bar",
        icon: <IconVenuesTypeOfVenueBar />,
      },
      {
        id: "brunch",
        label: "Brunch",
        icon: <IconPacksFeaturesCateringBrunch />,
      },
    ],
  },
  {
    label: "Serviços",
    chips: [
      {
        id: "dj",
        label: "DJ",
        icon: <IconPacksFeaturesServicesDJ />,
      },
      {
        id: "instrumentalist",
        label: "Instrumentista",
        icon: <IconPacksFeaturesServicesInstrumentalist />,
      },
      {
        id: "photographer",
        label: "Fotógrafo",
        icon: <IconSpacesEventTypeCulturePhotoSession />,
      },
      {
        id: "videographer",
        label: "Vídeografo",
        icon: <IconSpacesEventTypeCultureVideoRecording />,
      },
      {
        id: "vallet-parking",
        label: "Vallet Parking",
        icon: <IconPacksFeaturesServicesValletParking />,
      },
      {
        id: "park-assist",
        label: "Park Assist",
        icon: <IconPacksFeaturesServicesParkAssist />,
      },
      {
        id: "hostess",
        label: "Hospedeiras",
        icon: <IconPacksFeaturesServicesHostess />,
      },
      {
        id: "audiovisual",
        label: "Audiovisuais",
        icon: <IconPacksFeaturesServicesAudiovisual />,
      },
      {
        id: "event-planner",
        label: "Event planner",
        icon: <IconPacksFeaturesServicesEventPlanner />,
      },
      {
        id: "decoration",
        label: "Decoração",
        icon: <IconPacksFeaturesServicesDecoration />,
      },
      {
        id: "cleaning",
        label: "Limpeza",
        icon: <IconPacksFeaturesServicesCleaning />,
      },
      {
        id: "furniture",
        label: "Mobiliário",
        icon: <IconPacksFeaturesServicesFurniture />,
      },
      {
        id: "security",
        label: "Segurança",
        icon: <IconPacksFeaturesServicesSecurity />,
      },
      {
        id: "parking",
        label: "Estacionamento",
        icon: <IconPacksFeaturesServicesParking />,
      },
      {
        id: "live-band",
        label: "Banda ao vivo",
        icon: <IconPacksFeaturesServicesLiveBand />,
      },
      {
        id: "karaoke",
        label: "Karaoke",
        icon: <IconPacksFeaturesServicesKaraoke />,
      },
    ],
  },
  {
    label: "Atividades",
    chips: [
      {
        id: "activities-sports",
        label: "Desportivas",
        icon: <IconPacksFeaturesActivitiesSports />,
      },
      {
        id: "activities-ludic",
        label: "Lúdicas ou Recreativas",
        icon: <IconPacksFeaturesActivitiesLudic />,
      },
      {
        id: "activities-children",
        label: "Para crianças",
        icon: <IconPacksFeaturesActivitiesChildren />,
      },
      {
        id: "activities-crafts",
        label: "Manualidades",
        icon: <IconPacksFeaturesActivitiesCrafts />,
      },
    ],
  },
  {
    label: "Crianças",
    chips: [
      {
        id: "children-entertainers",
        label: "Animadores de crianças",
        icon: <IconPacksFeaturesChildrenEntertainers />,
      },
      {
        id: "inflatable",
        label: "Insuflável",
        icon: <IconSpacesFacilitiesInflatable />,
      },
      {
        id: "games",
        label: "Jogos",
        icon: <IconPacksFeaturesChildrenGames />,
      },
      {
        id: "facial-painting",
        label: "Pinturas faciais",
        icon: <IconPacksFeaturesChildrenFacialPainting />,
      },
    ],
  },
  {
    label: "Alojamento",
    chips: [
      {
        id: "overnight-stay",
        label: "Dormida",
        icon: <IconVenuesTypeOfVenueHotel />,
      },
    ],
  },
] as const;

export const PACK_FEATURES_FLAT = PACK_FEATURES.flatMap((group) =>
  group.chips.map((chip) => chip),
);

export type PackFeature = (typeof PACK_FEATURES)[number]["chips"][number]["id"];
