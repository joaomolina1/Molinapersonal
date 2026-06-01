export const BOOKING_STATUSES = [
  {
    id: "draft",
    label: "Em criação",
    tagType: "warning",
    displayToHost: false,
    blocksOtherBookings: false,
  },
  {
    id: "inProgress",
    label: "Em processamento",
    tagType: "warning",
    displayToHost: false,
    blocksOtherBookings: true,
  },
  {
    id: "preConfirmed",
    label: "Pré-reserva",
    tagType: "info",
    displayToHost: true,
    blocksOtherBookings: false,
  },
  {
    id: "confirmed",
    label: "Confirmada",
    tagType: "success",
    displayToHost: true,
    blocksOtherBookings: true,
  },
  {
    id: "cancellationRequested",
    label: "Cancelamento solicitado",
    tagType: "disabled",
    displayToHost: true,
    blocksOtherBookings: true,
  },
  {
    id: "cancelled",
    label: "Cancelada",
    tagType: "error",
    displayToHost: true,
    blocksOtherBookings: false,
  },
  {
    id: "deleted",
    label: "Eliminada",
    tagType: "error",
    displayToHost: false,
    blocksOtherBookings: false,
  },
  {
    id: "abandoned",
    label: "Abandonada",
    tagType: "error",
    displayToHost: false,
    blocksOtherBookings: false,
  },
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number]["id"];
