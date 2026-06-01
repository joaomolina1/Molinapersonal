export const HIGHLIGHT_STATUSES = [
  {
    id: "active",
    label: "Ativo",
    tagType: "success",
  },
  {
    id: "inactive",
    label: "Inativo",
    tagType: "disabled",
  },
] as const;

export type HighlightStatus = (typeof HIGHLIGHT_STATUSES)[number]["id"];

export const HIGHLIGHT_MODES = [
  {
    id: "none",
    label: "Sem destaque",
  },
  {
    id: "home",
    label: "Página inicial",
  },
  {
    id: "search",
    label: "Página de oferta",
  },
] as const;

export type HighlightMode = (typeof HIGHLIGHT_MODES)[number]["id"];
