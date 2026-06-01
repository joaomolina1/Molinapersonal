import IconVenuesVenueExtrasFreeStreetParking from "@/_design_system/_icons/Venues/VenueExtras/FreeStreetParking.svg";
import IconVenuesVenueExtrasFreeVenueParking from "@/_design_system/_icons/Venues/VenueExtras/FreeVenueParking.svg";
import IconVenuesVenueExtrasPaidStreetParking from "@/_design_system/_icons/Venues/VenueExtras/PaidStreetParking.svg";
import IconVenuesVenueExtrasPaidVenueParking from "@/_design_system/_icons/Venues/VenueExtras/PaidVenueParking.svg";

export const VENUE_PARKING = [
  {
    id: "free-venue-parking",
    label: "Gratuito e disponível no local",
    icon: <IconVenuesVenueExtrasFreeVenueParking />,
  },
  {
    id: "free-street-parking",
    label: "Gratuito na rua",
    icon: <IconVenuesVenueExtrasFreeStreetParking />,
  },
  {
    id: "paid-venue-parking",
    label: "Pago disponível no local",
    icon: <IconVenuesVenueExtrasPaidVenueParking />,
  },
  {
    id: "paid-street-parking",
    label: "Pago nas proximidades",
    icon: <IconVenuesVenueExtrasPaidStreetParking />,
  },
] as const;

export type VenueParking = (typeof VENUE_PARKING)[number]["id"];
