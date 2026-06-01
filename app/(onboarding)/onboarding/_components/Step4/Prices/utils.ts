import { DayOfWeek } from "@/_utils/date";
import { TimeDuration } from "@/_utils/number";

export type Price = {
  id: string;
  from: string; // format 2024-01-01T00:00:00Z
  to: string;
  schedules: PriceSchedule[];
};

export type PriceSchedule = {
  id: string;
  type: PriceScheduleType;
  start: TimeDuration | null;
  end: TimeDuration | null;
  minValue: number; // in euros
  valueHour: number; // in euros
  valuePerson: number; // in euros
  daysOfWeek: DayOfWeek[]; // mon, tue, ...
};

export const PRICE_SCHEDULE_TYPES = [
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
] as const;

export const getPriceScheduleType = (
  valuePerson: number = 0,
  valueHour: number = 0,
) => {
  if (valuePerson > 0 && valueHour > 0) return "per-hour-and-person";
  else if (valueHour > 0) return "per-hour";
  else return "per-person";
};

export type PriceScheduleType = (typeof PRICE_SCHEDULE_TYPES)[number]["id"];
