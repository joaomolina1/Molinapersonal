import IconVenuesVenueExtrasCanSleep from "@/_design_system/_icons/Venues/VenueExtras/CanSleep.svg";

export const VENUE_SLEEPING = [
  {
    id: "can-sleep",
    label: "É possível dormir no local",
    icon: <IconVenuesVenueExtrasCanSleep />,
  },
] as const;

export type VenueSleeping = (typeof VENUE_SLEEPING)[number]["id"];
