export type Extra = {
  id: string;
  type: ExtraPriceType;
  description: string;
  tooltip?: string | null;
  priceHour: number; // in euros
  pricePax: number; // in euros
  fixedPrice: number; // in euros
  mandatory: boolean;
  defaultHour?: number | null;
  minHour?: number | null;
  maxHour?: number | null;
  defaultPax?: number | null;
  minPax?: number | null;
  maxPax?: number | null;
};

export const EXTRA_PRICE_TYPES = [
  {
    id: "per-person",
    text: "Pessoa",
  },
  {
    id: "per-hour",
    text: "Hora",
  },
  {
    id: "per-hour-and-person",
    text: "Hora e Pessoa",
  },
  {
    id: "fixed",
    text: "Fixo",
  },
] as const;

export type ExtraPriceType = (typeof EXTRA_PRICE_TYPES)[number]["id"];

export const getExtraPriceType = (
  pricePax: number = 0,
  priceHour: number = 0,
): ExtraPriceType => {
  if (pricePax > 0 && priceHour > 0) return "per-hour-and-person";
  else if (priceHour > 0) return "per-hour";
  else if (pricePax > 0) return "per-person";
  else return "fixed";
};

export type ExtraDraft = Partial<Omit<Extra, "id" | "type" | "mandatory">> &
  Pick<Extra, "id" | "type" | "mandatory">;
