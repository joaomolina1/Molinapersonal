import { v4 as uuidv4 } from "uuid";

export const EXTRA_COPY_PREFIX = "(copia) ";

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

export const getExtraPriceTypeLabel = (type: ExtraPriceType): string =>
  EXTRA_PRICE_TYPES.find((item) => item.id === type)?.text ?? type;

export const cloneExtraDraft = (extra: ExtraDraft): ExtraDraft => {
  const description = extra.description?.trim();
  return {
    ...extra,
    id: uuidv4(),
    description: description
      ? `${EXTRA_COPY_PREFIX}${description}`
      : EXTRA_COPY_PREFIX.trim(),
  };
};

export const getExtraDraftError = (extra: ExtraDraft): string | undefined => {
  if (!extra.description?.trim()) {
    return "Indique a descrição do extra";
  }

  if (extra.type === "fixed") {
    if (extra.fixedPrice === undefined) {
      return "Indique o valor fixo";
    }
    return undefined;
  }

  if (extra.type === "per-hour") {
    if (!extra.priceHour) {
      return "Indique o valor por hora";
    }
    return undefined;
  }

  if (extra.type === "per-person") {
    if (!extra.pricePax) {
      return "Indique o valor por pessoa";
    }
    return undefined;
  }

  if (!extra.priceHour || !extra.pricePax) {
    return "Indique o valor por hora e por pessoa";
  }

  return undefined;
};
