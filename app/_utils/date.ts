export const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) =>
  Intl.DateTimeFormat("pt-PT", options).format(date);

export const DAYS_OF_WEEK = [
  {
    id: "mon",
    text: "S",
    label: "Segunda-feira",
  },
  {
    id: "tue",
    text: "T",
    label: "Terça-feira",
  },
  {
    id: "wed",
    text: "Q",
    label: "Quarta-feira",
  },
  {
    id: "thu",
    text: "Q",
    label: "Quinta-feira",
  },
  {
    id: "fri",
    text: "S",
    label: "Sexta-feira",
  },
  {
    id: "sat",
    text: "S",
    label: "Sábado",
  },
  {
    id: "sun",
    text: "D",
    label: "Domingo",
  },
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number]["id"];
