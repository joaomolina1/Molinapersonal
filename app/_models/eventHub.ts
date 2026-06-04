import { LeadQualityScore } from "@/_constants/lead/qualityScore";
import { PackFeature } from "@/_constants/pack/features";
import {
  QUOTE_STATUSES,
  QuoteStatus,
} from "@/_constants/quote/statuses";
import { SpaceEventType } from "@/_constants/space/eventTypes";
import { useFetch } from "@/_services/api";
import { TimeDuration } from "@/_utils/number";
import { CalendarDate, parseDate } from "@internationalized/date";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export type EventHubLeadType = "quote" | "contact";
export type EventHubLeadScope = "exclusive" | "shared";
export type EventHubLeadOutcome = "pending" | "won" | "lost";

export type EventHubSuggestedPack = {
  packID: string;
  packName: string;
  packReference: string;
  spaceID: string;
  spaceName: string;
  venueID: string;
  venueName: string;
  status: string;
};

export class EventHubLead {
  constructor(data: any) {
    Object.assign(this, data);
    this.status = data.status ?? "new";
    this.leadType = data.leadType ?? "quote";
    this.leadTypeLabel =
      data.leadTypeLabel ??
      (this.leadType === "quote"
        ? "Pedido de orçamento"
        : "Pedido de contacto");
    this.outcome = data.outcome ?? "pending";
    this.outcomeLabel = data.outcomeLabel ?? "Em aberto";
    this.qualityScore =
      data.qualityScore != null ? (data.qualityScore as LeadQualityScore) : null;
    this.eventDate = data.eventDate
      ? parseDate(data.eventDate as string)
      : null;
    this.startAt = data.startAt
      ? TimeDuration.fromString(data.startAt as string)
      : null;
    this.endAt = data.endAt
      ? TimeDuration.fromString(data.endAt as string)
      : null;
    this.suggestedPacks = data.suggestedPacks ?? [];
    this.attributes = data.attributes ?? [];
  }

  id!: string;
  leadType!: EventHubLeadType;
  leadTypeLabel!: string;
  leadScope!: EventHubLeadScope;
  leadScopeLabel!: string;
  associatedSpaceCount!: number;
  outcome!: EventHubLeadOutcome;
  outcomeLabel!: string;
  qualityScore!: LeadQualityScore | null;
  status!: QuoteStatus;
  createdAt!: string;
  eventKind!: SpaceEventType | null;
  eventDate!: CalendarDate | null;
  startAt!: TimeDuration | null;
  endAt!: TimeDuration | null;
  timezone!: string | null;
  numPeople!: number | null;
  budget!: number | null;
  currency!: string | null;
  notes!: string | null;
  area!: string | null;
  country!: string | null;
  attributes!: PackFeature[];
  companyEvent!: boolean;
  companyName!: string | null;
  contactMethod!: string | null;
  message!: string | null;
  contact!: {
    name: string;
    email: string;
    phoneExtension: number | null;
    phoneNumber: string;
  };
  suggestedPacks!: EventHubSuggestedPack[];

  get statusWording() {
    return QUOTE_STATUSES.find((s) => s.id === this.status);
  }

  get isQuote() {
    return this.leadType === "quote";
  }
}

export type EventHubLeadsQuery = {
  page?: number;
  pageSize?: number;
  status?: QuoteStatus;
};

export type EventHubLeadsResponse = {
  data: EventHubLead[];
  pagination: { page: number; pageSize: number };
  totalResults: number;
};

const EVENT_HUB_PAGE_SIZE = 20;

export const useEventHubLeads = (
  query?: EventHubLeadsQuery,
  options?: { enabled?: boolean },
) => {
  const fetchApi = useFetch();
  const page = query?.page ?? 1;
  const pageSize = query?.pageSize ?? EVENT_HUB_PAGE_SIZE;

  return useQuery<EventHubLeadsResponse>({
    queryKey: ["event-hub", page, pageSize, query?.status],
    queryFn: () =>
      fetchApi(
        "event-hub",
        undefined,
        undefined,
        undefined,
        {
          page,
          page_size: pageSize,
          ...(query?.status ? { status: query.status } : {}),
        },
      ).then((res: {
        data: any[];
        pagination: { page: number; pageSize: number };
        totalResults: number;
      }) => ({
        data: (res.data ?? []).map((lead) => new EventHubLead(lead)),
        pagination: res.pagination,
        totalResults: res.totalResults,
      })),
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
  });
};

export const useEventHubLead = (
  leadType: EventHubLeadType | undefined,
  leadId?: string,
  options?: { enabled?: boolean },
) => {
  const fetchApi = useFetch();

  return useQuery<EventHubLead>({
    queryKey: ["event-hub", leadType, leadId],
    queryFn: () =>
      fetchApi("event-hub", `${leadType}/${leadId}`).then(
        (lead) => new EventHubLead(lead),
      ),
    enabled: !!leadType && !!leadId && (options?.enabled ?? true),
  });
};
