import { PackFeature } from "@/_constants/pack/features";
import { SpaceEventType } from "@/_constants/space/eventTypes";
import { useFetch } from "@/_services/api";
import { TimeDuration } from "@/_utils/number";
import { CalendarDate, parseDate } from "@internationalized/date";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export class Quote {
  constructor(data: any) {
    Object.assign(this, data);

    this.event_date = parseDate(data.event_date as string);
    this.start_at = TimeDuration.fromString(data.start_at as string);
    this.end_at = TimeDuration.fromString(data.end_at as string);
  }

  id!: string;
  created_at!: string;
  user_id!: string;
  name!: string;
  email!: string;
  phone_extension!: number;
  phone_number!: number;
  company_event!: boolean;
  company_name!: string;
  vat_number!: string;
  event_kind!: SpaceEventType;
  area!: string;
  country!: string;
  event_date!: CalendarDate;
  start_at!: TimeDuration | null;
  end_at!: TimeDuration | null;
  timezone!: string;
  budget!: number;
  currency!: string;
  num_people!: number;
  notes!: string;
  attributes!: PackFeature[];
  venue_id?: string;
  space_id?: string;
  pack_id?: string;
}

export const useQuotes = () => {
  const fetchApi = useFetch();

  return useQuery<Quote[]>({
    queryKey: ["quote"],
    queryFn: () =>
      fetchApi("quote").then((quotes: any[]) =>
        quotes.map((quote) => new Quote(quote)),
      ),
  });
};

type CreateQuoteBody = Partial<
  Pick<
    Quote,
    | "user_id"
    | "name"
    | "email"
    | "phone_extension"
    | "phone_number"
    | "company_event"
    | "company_name"
    | "vat_number"
    | "event_kind"
    | "area"
    | "country"
    | "timezone"
    | "budget"
    | "currency"
    | "num_people"
    | "notes"
    | "attributes"
    | "venue_id"
    | "space_id"
    | "pack_id"
  > & {
    event_date: string; // ISO Datetime string at 00:00:00
    start_at: string; // TimeDuration string
    end_at: string; // TimeDuration string
  }
>;

export const useCreateQuote = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, CreateQuoteBody>({
    mutationFn: (body) => fetchApi("quote", "", { method: "POST", body }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["quote"] });
    },
  });
};
