import IconVenuesTypeOfVenueApartment from "@/_design_system/_icons/Venues/TypeOfVenue/Apartment.svg";
import IconVenuesTypeOfVenueAuditorium from "@/_design_system/_icons/Venues/TypeOfVenue/Auditorium.svg";
import IconVenuesTypeOfVenueBar from "@/_design_system/_icons/Venues/TypeOfVenue/Bar.svg";
import IconVenuesTypeOfVenueBoat from "@/_design_system/_icons/Venues/TypeOfVenue/Boat.svg";
import IconVenuesTypeOfVenueCastle from "@/_design_system/_icons/Venues/TypeOfVenue/Castle.svg";
import IconVenuesTypeOfVenueChurch from "@/_design_system/_icons/Venues/TypeOfVenue/Church.svg";
import IconVenuesTypeOfVenueCinema from "@/_design_system/_icons/Venues/TypeOfVenue/Cinema.svg";
import IconVenuesTypeOfVenueClubHouse from "@/_design_system/_icons/Venues/TypeOfVenue/ClubHouse.svg";
import IconVenuesTypeOfVenueCoffeeShop from "@/_design_system/_icons/Venues/TypeOfVenue/CoffeeShop.svg";
import IconVenuesTypeOfVenueConcertHall from "@/_design_system/_icons/Venues/TypeOfVenue/ConcertHall.svg";
import IconVenuesTypeOfVenueConferenceRoom from "@/_design_system/_icons/Venues/TypeOfVenue/ConferenceRoom.svg";
import IconVenuesTypeOfVenueConvent from "@/_design_system/_icons/Venues/TypeOfVenue/Convent.svg";
import IconVenuesTypeOfVenueCountryHouse from "@/_design_system/_icons/Venues/TypeOfVenue/CountryHouse.svg";
import IconVenuesTypeOfVenueCowork from "@/_design_system/_icons/Venues/TypeOfVenue/Cowork.svg";
import IconVenuesTypeOfVenueDanceStudio from "@/_design_system/_icons/Venues/TypeOfVenue/DanceStudio.svg";
import IconVenuesTypeOfVenueFarm from "@/_design_system/_icons/Venues/TypeOfVenue/Farm.svg";
import IconVenuesTypeOfVenueGallery from "@/_design_system/_icons/Venues/TypeOfVenue/Gallery.svg";
import IconVenuesTypeOfVenueGarden from "@/_design_system/_icons/Venues/TypeOfVenue/Garden.svg";
import IconVenuesTypeOfVenueGreenhouse from "@/_design_system/_icons/Venues/TypeOfVenue/Greenhouse.svg";
import IconVenuesTypeOfVenueHotel from "@/_design_system/_icons/Venues/TypeOfVenue/Hotel.svg";
import IconVenuesTypeOfVenueIndoorRoom from "@/_design_system/_icons/Venues/TypeOfVenue/IndoorRoom.svg";
import IconVenuesTypeOfVenueIndustrial from "@/_design_system/_icons/Venues/TypeOfVenue/Industrial.svg";
import IconVenuesTypeOfVenueInn from "@/_design_system/_icons/Venues/TypeOfVenue/Inn.svg";
import IconVenuesTypeOfVenueLibrary from "@/_design_system/_icons/Venues/TypeOfVenue/Library.svg";
import IconVenuesTypeOfVenueLounge from "@/_design_system/_icons/Venues/TypeOfVenue/Lounge.svg";
import IconVenuesTypeOfVenueMeetingRoom from "@/_design_system/_icons/Venues/TypeOfVenue/MeetingRoom.svg";
import IconVenuesTypeOfVenueMonument from "@/_design_system/_icons/Venues/TypeOfVenue/Monument.svg";
import IconVenuesTypeOfVenueMuseum from "@/_design_system/_icons/Venues/TypeOfVenue/Museum.svg";
import IconVenuesTypeOfVenueNightclub from "@/_design_system/_icons/Venues/TypeOfVenue/Nightclub.svg";
import IconVenuesTypeOfVenueOutdoorVenue from "@/_design_system/_icons/Venues/TypeOfVenue/OutdoorVenue.svg";
import IconVenuesTypeOfVenuePalace from "@/_design_system/_icons/Venues/TypeOfVenue/Palace.svg";
import IconVenuesTypeOfVenuePartyRoom from "@/_design_system/_icons/Venues/TypeOfVenue/PartyRoom.svg";
import IconVenuesTypeOfVenuePenthouse from "@/_design_system/_icons/Venues/TypeOfVenue/Penthouse.svg";
import IconVenuesTypeOfVenuePhotographyStudio from "@/_design_system/_icons/Venues/TypeOfVenue/PhotographyStudio.svg";
import IconVenuesTypeOfVenuePrivateHouse from "@/_design_system/_icons/Venues/TypeOfVenue/PrivateHouse.svg";
import IconVenuesTypeOfVenueRestaurant from "@/_design_system/_icons/Venues/TypeOfVenue/Restaurant.svg";
import IconVenuesTypeOfVenueRooftop from "@/_design_system/_icons/Venues/TypeOfVenue/Rooftop.svg";
import IconVenuesTypeOfVenueSchool from "@/_design_system/_icons/Venues/TypeOfVenue/School.svg";
import IconVenuesTypeOfVenueShop from "@/_design_system/_icons/Venues/TypeOfVenue/Shop.svg";
import IconVenuesTypeOfVenueSoundStudio from "@/_design_system/_icons/Venues/TypeOfVenue/SoundStudio.svg";
import IconVenuesTypeOfVenueSpa from "@/_design_system/_icons/Venues/TypeOfVenue/Spa.svg";
import IconVenuesTypeOfVenueSportsCenter from "@/_design_system/_icons/Venues/TypeOfVenue/SportsCenter.svg";
import IconVenuesTypeOfVenueTent from "@/_design_system/_icons/Venues/TypeOfVenue/Tent.svg";
import IconVenuesTypeOfVenueTerrace from "@/_design_system/_icons/Venues/TypeOfVenue/Terrace.svg";
import IconVenuesTypeOfVenueTheatre from "@/_design_system/_icons/Venues/TypeOfVenue/Theatre.svg";
import IconVenuesTypeOfVenueThemePark from "@/_design_system/_icons/Venues/TypeOfVenue/ThemePark.svg";
import IconVenuesTypeOfVenueUniqueSpace from "@/_design_system/_icons/Venues/TypeOfVenue/UniqueSpace.svg";
import IconVenuesTypeOfVenueVilla from "@/_design_system/_icons/Venues/TypeOfVenue/Villa.svg";
import IconVenuesTypeOfVenueWarehouse from "@/_design_system/_icons/Venues/TypeOfVenue/Warehouse.svg";
import IconVenuesTypeOfVenueWineCellar from "@/_design_system/_icons/Venues/TypeOfVenue/WineCellar.svg";

// Source for google types: https://developers.google.com/maps/documentation/places/web-service/place-types

export const SPACE_CATEGORIES = [
  {
    label: "Mais populares",
    chips: [
      {
        id: "bar",
        label: "Bar",
        icon: <IconVenuesTypeOfVenueBar />,
        googleTypes: ["bar"],
      },
      {
        id: "coffee-shop",
        label: "Café",
        icon: <IconVenuesTypeOfVenueCoffeeShop />,
        googleTypes: ["bakery", "cafe"],
      },
      {
        id: "conference-room",
        label: "Sala de conferências",
        icon: <IconVenuesTypeOfVenueConferenceRoom />,
        googleTypes: [],
      },
      {
        id: "outdoor-venue",
        label: "Local exterior",
        icon: <IconVenuesTypeOfVenueOutdoorVenue />,
        googleTypes: ["campground", "park", "rv_park"],
      },
      {
        id: "hotel",
        label: "Hotel",
        icon: <IconVenuesTypeOfVenueHotel />,
        googleTypes: ["lodging"],
      },
      {
        id: "restaurant",
        label: "Restaurante",
        icon: <IconVenuesTypeOfVenueRestaurant />,
        googleTypes: ["restaurant"],
      },
      {
        id: "indoor-room",
        label: "Sala interior",
        icon: <IconVenuesTypeOfVenueIndoorRoom />,
        googleTypes: ["room"],
      },
    ],
  },
  {
    label: "Outras categorias",
    toggleButton: {
      closedLabel: "Ver mais categorias",
      openedLabel: "Ver menos categorias",
    },
    chips: [
      {
        id: "apartment",
        label: "Apartamento",
        icon: <IconVenuesTypeOfVenueApartment />,
        googleTypes: [],
      },
      {
        id: "warehouse",
        label: "Armazém",
        icon: <IconVenuesTypeOfVenueWarehouse />,
        googleTypes: [],
      },
      {
        id: "auditorium",
        label: "Auditório",
        icon: <IconVenuesTypeOfVenueAuditorium />,
        googleTypes: [],
      },
      {
        id: "boat",
        label: "Barco",
        icon: <IconVenuesTypeOfVenueBoat />,
        googleTypes: [],
      },
      {
        id: "library",
        label: "Biblioteca",
        icon: <IconVenuesTypeOfVenueLibrary />,
        googleTypes: ["book_store", "library"],
      },
      {
        id: "country-house",
        label: "Casa de campo",
        icon: <IconVenuesTypeOfVenueCountryHouse />,
        googleTypes: [],
      },
      {
        id: "castle",
        label: "Castelo",
        icon: <IconVenuesTypeOfVenueCastle />,
        googleTypes: [],
      },
      {
        id: "sports-center",
        label: "Centro desportivo",
        icon: <IconVenuesTypeOfVenueSportsCenter />,
        googleTypes: ["gym", "stadium"],
      },
      {
        id: "cinema",
        label: "Cinema",
        icon: <IconVenuesTypeOfVenueCinema />,
        googleTypes: ["movie_theater"],
      },
      {
        id: "club-house",
        label: "Club House",
        icon: <IconVenuesTypeOfVenueClubHouse />,
        googleTypes: ["casino"],
      },
      {
        id: "convent",
        label: "Convento",
        icon: <IconVenuesTypeOfVenueConvent />,
        googleTypes: [],
      },
      {
        id: "cowork",
        label: "Cowork",
        icon: <IconVenuesTypeOfVenueCowork />,
        googleTypes: [],
      },
      {
        id: "nightclub",
        label: "Discoteca",
        icon: <IconVenuesTypeOfVenueNightclub />,
        googleTypes: ["night_club"],
      },
      {
        id: "dance-studio",
        label: "Estúdio de dança",
        icon: <IconVenuesTypeOfVenueDanceStudio />,
        googleTypes: [],
      },
      {
        id: "photography-studio",
        label: "Estúdio de fotografia/vídeo",
        icon: <IconVenuesTypeOfVenuePhotographyStudio />,
        googleTypes: [],
      },
      {
        id: "sound-studio",
        label: "Estúdio de som",
        icon: <IconVenuesTypeOfVenueSoundStudio />,
        googleTypes: [],
      },
      {
        id: "gallery",
        label: "Galeria",
        icon: <IconVenuesTypeOfVenueGallery />,
        googleTypes: [],
      },
      {
        id: "church",
        label: "Igreja",
        icon: <IconVenuesTypeOfVenueChurch />,
        googleTypes: [
          "church",
          "hindu_temple",
          "mosque",
          "synagogue",
          "place_of_worship",
        ],
      },
      {
        id: "museum",
        label: "Museu",
        icon: <IconVenuesTypeOfVenueMuseum />,
        googleTypes: ["art_gallery", "museum"],
      },
      {
        id: "farm",
        label: "Quinta",
        icon: <IconVenuesTypeOfVenueFarm />,
        googleTypes: [],
      },
      {
        id: "concert-hall",
        label: "Sala de espetáculos",
        icon: <IconVenuesTypeOfVenueConcertHall />,
        googleTypes: [],
      },
      {
        id: "spa",
        label: "Spa",
        icon: <IconVenuesTypeOfVenueSpa />,
        googleTypes: ["beauty_salon", "hair_care", "spa"],
      },
      {
        id: "theatre",
        label: "Teatro",
        icon: <IconVenuesTypeOfVenueTheatre />,
        googleTypes: [],
      },
      {
        id: "party-room",
        label: "Salão de festas",
        icon: <IconVenuesTypeOfVenuePartyRoom />,
        googleTypes: [],
      },
      {
        id: "garden",
        label: "Jardim",
        icon: <IconVenuesTypeOfVenueGarden />,
        googleTypes: [],
      },
      {
        id: "penthouse",
        label: "Penthouse",
        icon: <IconVenuesTypeOfVenuePenthouse />,
        googleTypes: [],
      },
      {
        id: "villa",
        label: "Villa",
        icon: <IconVenuesTypeOfVenueVilla />,
        googleTypes: [],
      },
      {
        id: "palace",
        label: "Palácio",
        icon: <IconVenuesTypeOfVenuePalace />,
        googleTypes: [],
      },
      {
        id: "lounge",
        label: "Zona Lounge",
        icon: <IconVenuesTypeOfVenueLounge />,
        googleTypes: [],
      },
      {
        id: "terrace",
        label: "Esplanada",
        icon: <IconVenuesTypeOfVenueTerrace />,
        googleTypes: [],
      },
      {
        id: "wine-cellar",
        label: "Adega",
        icon: <IconVenuesTypeOfVenueWineCellar />,
        googleTypes: ["liquor_store"],
      },
      {
        id: "shop",
        label: "Loja",
        icon: <IconVenuesTypeOfVenueShop />,
        googleTypes: [
          "bicycle_store",
          "clothing_store",
          "convenience_store",
          "department_store",
          "drugstore",
          "electronics_store",
          "furniture_store",
          "hardware_store",
          "home_goods_store",
          "jewelry_store",
          "pet_store",
          "shoe_store",
          "store",
        ],
      },
      {
        id: "theme-park",
        label: "Parque temático",
        icon: <IconVenuesTypeOfVenueThemePark />,
        googleTypes: ["amusement_park"],
      },
      {
        id: "unique-space",
        label: "Espaços singulares",
        icon: <IconVenuesTypeOfVenueUniqueSpace />,
        googleTypes: [],
      },
      {
        id: "meeting-room",
        label: "Sala de reuniões",
        icon: <IconVenuesTypeOfVenueMeetingRoom />,
        googleTypes: [],
      },
      {
        id: "rooftop",
        label: "Terraço/rooftop",
        icon: <IconVenuesTypeOfVenueRooftop />,
        googleTypes: [],
      },
      {
        id: "tent",
        label: "Tenda para eventos",
        icon: <IconVenuesTypeOfVenueTent />,
        googleTypes: [],
      },
      {
        id: "industrial",
        label: "Espaço industrial",
        icon: <IconVenuesTypeOfVenueIndustrial />,
        googleTypes: [],
      },
      {
        id: "greenhouse",
        label: "Estufa",
        icon: <IconVenuesTypeOfVenueGreenhouse />,
        googleTypes: [],
      },
      {
        id: "school",
        label: "Escola",
        icon: <IconVenuesTypeOfVenueSchool />,
        googleTypes: [
          "school",
          "preschool",
          "secondary_school",
          "primary_school",
        ],
      },
      {
        id: "inn",
        label: "Pousada",
        icon: <IconVenuesTypeOfVenueInn />,
        googleTypes: ["inn"],
      },
      {
        id: "monument",
        label: "Monumento",
        icon: <IconVenuesTypeOfVenueMonument />,
        googleTypes: ["monument", "cultural_landmark", "historical_place"],
      },
      {
        id: "private-house",
        label: "Casa particular",
        icon: <IconVenuesTypeOfVenuePrivateHouse />,
        googleTypes: [],
      },
    ],
  },
] as const;

export const SPACE_CATEGORIES_FLAT = SPACE_CATEGORIES.flatMap((group) =>
  group.chips.map((chip) => chip),
);

export type SpaceCategory =
  (typeof SPACE_CATEGORIES)[number]["chips"][number]["id"];
