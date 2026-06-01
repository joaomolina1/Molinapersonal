export const ICAL_IMPORT_STATUS = [
  {
    id: "created",
    label: "Em validação",
    tagType: "neutral",
  },
  {
    id: "failure",
    label: "Erro de ligação",
    tagType: "error",
  },
  {
    id: "success",
    label: "Válido",
    tagType: "success",
  },
] as const;

export type IcalImportStatus = (typeof ICAL_IMPORT_STATUS)[number]["id"];
