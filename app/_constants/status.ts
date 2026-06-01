export const STATUSES = [
  {
    id: "in_progress",
    label: "Em criação",
    tagType: "warning",
  },
  {
    id: "pending_approval",
    label: "Em aprovação",
    tagType: "info",
  },
  {
    id: "active",
    label: "Ativo",
    tagType: "success",
  },
  {
    id: "paused",
    label: "Em pausa",
    tagType: "disabled",
  },
  {
    id: "inactive",
    label: "Inativo",
    tagType: "error",
  },
  {
    id: "inactive_admin",
    label: "Propostas RINU",
    tagType: "error",
  },
] as const;

export type Status = (typeof STATUSES)[number]["id"];
