export const BOOKING_KINDS = [
  {
    id: "internal",
    labelCalendar: "Evento RINU",
    labelTable: "RINU",
  },
  {
    id: "external",
    labelCalendar: "Evento externo",
    labelTable: "Externa",
  },
  {
    id: "block",
    labelCalendar: "Indisponível",
    labelTable: "Indisponível",
  },
  {
    id: "integration",
    labelCalendar: "Evento importado",
    labelTable: "Importada",
  },
] as const;

export type BookingKind = (typeof BOOKING_KINDS)[number]["id"];
