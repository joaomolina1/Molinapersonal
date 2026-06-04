export const QUOTE_STATUSES = [
  {
    id: "new",
    label: "Nova",
    tagType: "info" as const,
  },
  {
    id: "in_follow_up",
    label: "Em acompanhamento",
    tagType: "neutral" as const,
  },
  {
    id: "proposal_sent",
    label: "Proposta enviada",
    tagType: "info" as const,
  },
  {
    id: "won",
    label: "Ganha",
    tagType: "success" as const,
  },
  {
    id: "lost",
    label: "Perdida/Cancelada",
    tagType: "disabled" as const,
  },
] as const;

export type QuoteStatus = (typeof QUOTE_STATUSES)[number]["id"];

export const QUOTE_STATUS_BUCKETS = [
  { id: "new", label: "Novas" },
  { id: "in_follow_up", label: "Em acompanhamento" },
  { id: "proposal_sent", label: "Proposta enviada" },
  { id: "won", label: "Ganhas" },
  { id: "lost", label: "Perdidas/Canceladas" },
] as const;
