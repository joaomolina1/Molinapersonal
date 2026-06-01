import IconSpacesFacilitiesWifi from "@/_design_system/_icons/Spaces/Facilities/Wifi.svg";
import IconSpacesFacilitiesProjector from "@/_design_system/_icons/Spaces/Facilities/Projector.svg";
import IconSpacesFacilitiesTelevision from "@/_design_system/_icons/Spaces/Facilities/Television.svg";
import IconSpacesFacilitiesDigitalTelevision from "@/_design_system/_icons/Spaces/Facilities/DigitalTelevision.svg";
import IconSpacesFacilitiesWhiteboard from "@/_design_system/_icons/Spaces/Facilities/Whiteboard.svg";
import IconSpacesFacilitiesConferenceEasel from "@/_design_system/_icons/Spaces/Facilities/ConferenceEasel.svg";
import IconSpacesFacilitiesOnlineConference from "@/_design_system/_icons/Spaces/Facilities/OnlineConference.svg";
import IconSpacesFacilitiesAirConditioning from "@/_design_system/_icons/Spaces/Facilities/AirConditioning.svg";
import IconSpacesFacilitiesNaturalLight from "@/_design_system/_icons/Spaces/Facilities/NaturalLight.svg";
import IconSpacesFacilitiesCloakroom from "@/_design_system/_icons/Spaces/Facilities/Cloakroom.svg";
import IconSpacesFacilitiesStorageArea from "@/_design_system/_icons/Spaces/Facilities/StorageArea.svg";
import IconSpacesFacilitiesPool from "@/_design_system/_icons/Spaces/Facilities/Pool.svg";
import IconSpacesFacilitiesInflatable from "@/_design_system/_icons/Spaces/Facilities/Inflatable.svg";
import IconSpacesFacilitiesPlayground from "@/_design_system/_icons/Spaces/Facilities/Playground.svg";
import IconSpacesFacilitiesVideowallLed from "@/_design_system/_icons/Spaces/Facilities/VideowallLed.svg";
import IconSpacesFacilitiesPetFriendly from "@/_design_system/_icons/Spaces/Facilities/PetFriendly.svg";
import IconSpacesFacilitiesEcoFriendly from "@/_design_system/_icons/Spaces/Facilities/EcoFriendly.svg";
import IconSpacesFacilitiesEatingArea from "@/_design_system/_icons/Spaces/Facilities/EatingArea.svg";
import IconSpacesFacilitiesKitchen from "@/_design_system/_icons/Spaces/Facilities/Kitchen.svg";
import IconSpacesFacilitiesLockerRoom from "@/_design_system/_icons/Spaces/Facilities/LockerRoom.svg";
import IconSpacesFacilitiesSmokingArea from "@/_design_system/_icons/Spaces/Facilities/SmokingArea.svg";
import IconSpacesFacilitiesSmokeMachine from "@/_design_system/_icons/Spaces/Facilities/SmokeMachine.svg";
import IconSpacesFacilitiesLightSystem from "@/_design_system/_icons/Spaces/Facilities/LightSystem.svg";
import IconSpacesFacilitiesSpeakers from "@/_design_system/_icons/Spaces/Facilities/Speakers.svg";
import IconSpacesFacilitiesMicrophones from "@/_design_system/_icons/Spaces/Facilities/Microphones.svg";
import IconSpacesFacilitiesStage from "@/_design_system/_icons/Spaces/Facilities/Stage.svg";
import IconSpacesFacilitiesPulpit from "@/_design_system/_icons/Spaces/Facilities/Pulpit.svg";
import IconSpacesFacilitiesSoundManagement from "@/_design_system/_icons/Spaces/Facilities/SoundManagement.svg";
import IconSpacesFacilitiesVideoManagement from "@/_design_system/_icons/Spaces/Facilities/VideoManagement.svg";

export const SPACE_FACILITIES = [
  {
    label: "Gerais",
    chips: [
      {
        id: "wifi",
        label: "Wi-Fi",
        icon: <IconSpacesFacilitiesWifi />,
      },
      {
        id: "whiteboard",
        label: "Quadro branco",
        icon: <IconSpacesFacilitiesWhiteboard />,
      },
      {
        id: "storage-area",
        label: "Zona de arrumos",
        icon: <IconSpacesFacilitiesStorageArea />,
      },
      {
        id: "eating-area",
        label: "Copa",
        icon: <IconSpacesFacilitiesEatingArea />,
      },
      {
        id: "smoking-area",
        label: "Zona de fumadores",
        icon: <IconSpacesFacilitiesSmokingArea />,
      },
      {
        id: "pool",
        label: "Piscina",
        icon: <IconSpacesFacilitiesPool />,
      },
      {
        id: "inflatable",
        label: "Insuflável para crianças",
        icon: <IconSpacesFacilitiesInflatable />,
      },
      {
        id: "air-conditioning",
        label: "Ar condicionado",
        icon: <IconSpacesFacilitiesAirConditioning />,
      },
      {
        id: "conference-easel",
        label: "Cavalete de conferência",
        icon: <IconSpacesFacilitiesConferenceEasel />,
      },
      {
        id: "natural-light",
        label: "Luz natural",
        icon: <IconSpacesFacilitiesNaturalLight />,
      },
      {
        id: "cloakroom",
        label: "Bengaleiro",
        icon: <IconSpacesFacilitiesCloakroom />,
      },
      {
        id: "playground",
        label: "Zona para crianças",
        icon: <IconSpacesFacilitiesPlayground />,
      },
      {
        id: "pet-friendly",
        label: "Pet friendly",
        icon: <IconSpacesFacilitiesPetFriendly />,
      },
      {
        id: "eco-friendly",
        label: "Eco friendly",
        icon: <IconSpacesFacilitiesEcoFriendly />,
      },
      {
        id: "kitchen",
        label: "Cozinha",
        icon: <IconSpacesFacilitiesKitchen />,
      },
      {
        id: "locker-room",
        label: "Balneários",
        icon: <IconSpacesFacilitiesLockerRoom />,
      },
    ],
  },
  {
    label: "Audiovisuais",
    chips: [
      {
        id: "projector",
        label: "Projetor",
        icon: <IconSpacesFacilitiesProjector />,
      },
      {
        id: "televison",
        label: "Televisão",
        icon: <IconSpacesFacilitiesTelevision />,
      },
      {
        id: "digital-television",
        label: "Televisão digital com caneta",
        icon: <IconSpacesFacilitiesDigitalTelevision />,
      },
      {
        id: "videowall-led",
        label: "Videowall Led",
        icon: <IconSpacesFacilitiesVideowallLed />,
      },
      {
        id: "online-conference-equipment",
        label: "Equipamento para conferência online",
        icon: <IconSpacesFacilitiesOnlineConference />,
      },
      {
        id: "light-system",
        label: "Sistema de luzes",
        icon: <IconSpacesFacilitiesLightSystem />,
      },
      {
        id: "smoke-machine",
        label: "Máquina de fumo",
        icon: <IconSpacesFacilitiesSmokeMachine />,
      },
      {
        id: "speakers",
        label: "Colunas",
        icon: <IconSpacesFacilitiesSpeakers />,
      },
      {
        id: "microphones",
        label: "Microfones",
        icon: <IconSpacesFacilitiesMicrophones />,
      },
      {
        id: "stage",
        label: "Palco",
        icon: <IconSpacesFacilitiesStage />,
      },
      {
        id: "pulpit",
        label: "Púlpito",
        icon: <IconSpacesFacilitiesPulpit />,
      },
      {
        id: "sound-management",
        label: "Régie de som",
        icon: <IconSpacesFacilitiesSoundManagement />,
      },
      {
        id: "video-management",
        label: "Régie de vídeo",
        icon: <IconSpacesFacilitiesVideoManagement />,
      },
    ],
  },
] as const;

export const SPACE_FACILITIES_FLAT = SPACE_FACILITIES.flatMap((group) =>
  group.chips.map((chip) => chip),
);

export type SpaceFacility =
  (typeof SPACE_FACILITIES)[number]["chips"][number]["id"];
