import { PackFeature } from "@/_constants/pack/features";
import {
  LeadQualityScore,
  parseLeadQualityScore,
} from "@/_constants/lead/qualityScore";
import {
  QUOTE_STATUSES,
  QuoteStatus,
} from "@/_constants/quote/statuses";
import { SpaceEventType } from "@/_constants/space/eventTypes";
import { useFetch } from "@/_services/api";
import { TimeDuration } from "@/_utils/number";
import { CalendarDate, parseDate } from "@internationalized/date";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LeadsListParams, quotesListQueryKey } from "@/_models/leadsList";

export type LeadPackExtraParam = {
  id: string;
  hours?: number | null;
  pax?: number | null;
};

export type QuotePackAssociation = {
  id: string;
  quoteID: string;
  packID: string;
  createdAt: string | null;
  createdBy: string | null;
  status: string;
  extraIDs: string[];
  extraParams: LeadPackExtraParam[];
  packName: string;
  packReference: string;
  spaceID: string;
  spaceName: string;
  venueID: string;
  venueName: string;
};

export type CalculatedPackPrice = {
  value: number;
  timeOverflow: boolean;
  schedules: { value: number }[];
  extras: { id: string; description: string; value: number }[];
};

export type AdminPackPreviewExtra = {
  id: string;
  type: "fixed" | "per-hour" | "per-person" | "per-hour-and-person";
  description: string;
  tooltip: string | null;
  priceHour: number;
  pricePax: number;
  fixedPrice: number;
  mandatory: boolean;
  defaultHour?: number | null;
  minHour?: number | null;
  maxHour?: number | null;
  defaultPax?: number | null;
  minPax?: number | null;
  maxPax?: number | null;
};

export type AdminLeadPackPreview = {
  lookup: QuotePackLookup;
  pack: {
    id: string;
    name: string;
    reference: string;
    extras: AdminPackPreviewExtra[];
  };
  price: CalculatedPackPrice | null;
  priceReason: string | null;
};

export type QuotePackLookup = {
  packID: string;
  packName: string;
  packReference: string;
  spaceID: string;
  spaceName: string;
  venueID: string;
  venueName: string;
  isDeleted: boolean;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isPackUuid = (value: string) => UUID_RE.test(value.trim());

export class Quote {
  constructor(data: any) {
    Object.assign(this, data);

    this.status = data.status ?? "new";
    this.assignedAdminIds = Array.isArray(data.assigned_admin_ids)
      ? data.assigned_admin_ids.map(String)
      : Array.isArray(data.assignedAdminIds)
        ? data.assignedAdminIds.map(String)
        : [];
    this.qualityScore =
      data.qualityScore != null
        ? (data.qualityScore as LeadQualityScore)
        : data.quality_score != null
          ? (data.quality_score as LeadQualityScore)
          : null;
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
  status!: QuoteStatus;
  assignedAdminIds!: string[];
  qualityScore!: LeadQualityScore | null;

  get statusWording() {
    return QUOTE_STATUSES.find((s) => s.id === this.status);
  }
}

export const useQuotePackLookup = (packId?: string) => {
  const fetchApi = useFetch();

  return useQuery<QuotePackLookup>({
    queryKey: ["quote-pack-lookup", packId],
    queryFn: () => fetchApi("quote", `pack-lookup/${packId}`),
    enabled: !!packId && isPackUuid(packId),
    retry: false,
  });
};

export const useQuotePacks = (quoteId?: string) => {
  const fetchApi = useFetch();

  return useQuery<QuotePackAssociation[]>({
    queryKey: ["quote-packs", quoteId],
    queryFn: () => fetchApi("quote", `${quoteId}/packs`),
    enabled: !!quoteId,
  });
};

export const useAdminLeadPackPreview = () => {
  const fetchApi = useFetch();

  return useMutation<
    AdminLeadPackPreview,
    unknown,
    {
      packID: string;
      leadType: "quote" | "contact";
      leadId: string;
      extraIDs: string[];
      extraParams: LeadPackExtraParam[];
    }
  >({
    mutationFn: (body) =>
      fetchApi("quote", "pack-preview", { method: "POST", body }),
  });
};

export const useAssociateQuotePack = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<
    QuotePackAssociation,
    unknown,
    {
      quoteId: string;
      packID: string;
      extraIDs?: string[];
      extraParams?: LeadPackExtraParam[];
    }
  >({
    mutationFn: ({ quoteId, packID, extraIDs, extraParams }) =>
      fetchApi("quote", `${quoteId}/packs`, {
        method: "POST",
        body: { packID, extraIDs, extraParams },
      }),
    onSettled: (_data, _err, { quoteId }) => {
      queryClient.invalidateQueries({ queryKey: ["quote-packs", quoteId] });
    },
  });
};

export const useRemoveQuotePack = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, { quoteId: string; packId: string }>({
    mutationFn: ({ quoteId, packId }) =>
      fetchApi("quote", `${quoteId}/packs/${packId}`, { method: "DELETE" }),
    onSettled: (_data, _err, { quoteId }) => {
      queryClient.invalidateQueries({ queryKey: ["quote-packs", quoteId] });
    },
  });
};

export const useUpdateQuotePackStatus = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<
    QuotePackAssociation,
    unknown,
    {
      quoteId: string;
      packId: string;
      status?: "suggested" | "won";
      extraIDs?: string[];
      extraParams?: LeadPackExtraParam[];
    }
  >({
    mutationFn: ({ quoteId, packId, status, extraIDs, extraParams }) =>
      fetchApi("quote", `${quoteId}/packs/${packId}`, {
        method: "PATCH",
        body: {
          ...(status !== undefined ? { status } : {}),
          ...(extraIDs !== undefined ? { extraIDs } : {}),
          ...(extraParams !== undefined ? { extraParams } : {}),
        },
      }),
    onSettled: (_data, _err, { quoteId }) => {
      queryClient.invalidateQueries({ queryKey: ["quote-packs", quoteId] });
    },
  });
};

export const useUpdateQuoteStatus = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, { quoteId: string; status: QuoteStatus }>({
    mutationFn: ({ quoteId, status }) =>
      fetchApi("quote", quoteId, { method: "PATCH", body: { status } }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["quote"] });
    },
  });
};

export const useUpdateQuoteLead = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    unknown,
    {
      quoteId: string;
      status?: QuoteStatus;
      qualityScore?: LeadQualityScore | null;
      assignedAdminIds?: string[];
    }
  >({
    mutationFn: ({ quoteId, status, qualityScore, assignedAdminIds }) =>
      fetchApi("quote", quoteId, {
        method: "PATCH",
        body: {
          ...(status !== undefined ? { status } : {}),
          ...(qualityScore !== undefined ? { qualityScore } : {}),
          ...(assignedAdminIds !== undefined ? { assignedAdminIds } : {}),
        },
      }),
    onSettled: (_data, _err, { quoteId }) => {
      queryClient.invalidateQueries({ queryKey: ["quote"] });
      queryClient.invalidateQueries({ queryKey: ["quotes-list"] });
      queryClient.invalidateQueries({ queryKey: ["quote", quoteId] });
    },
  });
};

export const useQuote = (quoteId?: string) => {
  const fetchApi = useFetch();

  return useQuery<Quote>({
    queryKey: ["quote", quoteId],
    queryFn: () =>
      fetchApi("quote", quoteId!).then((row) => new Quote(row)),
    enabled: !!quoteId,
  });
};

export { parseLeadQualityScore };

export const useQuotes = (params?: LeadsListParams) => {
  const fetchApi = useFetch();

  return useQuery<Quote[]>({
    queryKey: quotesListQueryKey(params),
    queryFn: () =>
      fetchApi("quote", undefined, undefined, undefined, {
        q: params?.q || undefined,
        assigned: params?.assigned,
      }).then((quotes: any[]) =>
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
