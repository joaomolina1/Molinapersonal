import { numericFormatter } from "react-number-format";
import { formatDate } from "./date";
import { isNotNil } from "./filter";

export const formatMoney = (
  value?: number | null,
  options: Omit<Intl.NumberFormatOptions, "style"> = {},
) => {
  if (!isNotNil(value)) {
    return "-";
  }

  // de-PT shows "." as thousands separator, "," as decimal separator, and "€" after the number
  return new Intl.NumberFormat("de-PT", {
    ...options,
    style: "currency",
    currency: "EUR",
    useGrouping: true,
  }).format(value);
};

export const formatPercentage = (value?: number | null) => {
  if (!isNotNil(value)) {
    return "-";
  }

  return new Intl.NumberFormat("pt-PT", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatInt = (value?: number | null) => {
  if (!isNotNil(value)) {
    return "-";
  }

  return numericFormatter(value.toString(), { thousandSeparator: "." });
};

export class TimeDuration {
  constructor(string: string, number: number) {
    this.string = string;
    this.number = number;
    this.id = `${number}`;
  }

  // Format: 0h0m0s or 11h30m0s
  string: string;

  // In hours: 0 or 11.5
  number: number;

  // Number as string
  id: string;

  static fromString = (string: string) => {
    const hourRegex = new RegExp(/(\d+)h/g);
    const minuteRegex = new RegExp(/(\d+)m/g);

    const hourGroups = hourRegex.exec(string);
    const minuteGroups = minuteRegex.exec(string);

    if (!hourGroups && !minuteGroups) {
      return null;
    }

    const hours = hourGroups ? parseInt(hourGroups[1]) : 0;
    const minutes = minuteGroups ? parseInt(minuteGroups[1]) : 0;

    const number = hours + minutes / 60;

    return new TimeDuration(string, number);
  };

  static fromNumber = (number: number) => {
    const minutesInHours = number % 1;
    const hours = number - minutesInHours;
    const minutes = minutesInHours * 60;

    return new TimeDuration(`${hours}h${minutes}m0s`, number);
  };

  get timeLabel() {
    const minutesInHours = this.number % 1;
    const hours = this.number - minutesInHours;
    const minutes = minutesInHours * 60;

    const date = new Date();
    date.setHours(hours);
    date.setMinutes(minutes);

    const extraDays = Math.floor(hours / 24);

    const timeText = formatDate(date, { timeStyle: "short" });

    return extraDays >= 1 ? `${timeText} (+${extraDays})` : timeText;
  }

  get selectOption() {
    return {
      id: this.id,
      text: this.timeLabel,
      value: this.number,
    };
  }
}
