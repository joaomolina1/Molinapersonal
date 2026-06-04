import { PACK_FEATURES, PackFeature } from "@/_constants/pack/features";
import { useFetch } from "@/_services/api";
import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { DayOfWeek } from "@/_utils/date";
import { PACK_CAPACITIES, PackCapacity } from "@/_constants/pack/capacities";
import { STATUSES, Status } from "@/_constants/status";
import { getPricesError } from "@/(onboarding)/onboarding/_components/Step4/Prices";
import { v4 as uuidv4 } from "uuid";
import { TimeDuration } from "@/_utils/number";
import { Journey } from "./venue";
import {
  PACK_SERVICE_TYPE_FEATURES_FLAT,
  PackServiceTypeFeature,
} from "@/_constants/space/serviceTypes";
import {
  getPriceScheduleType,
  Price,
} from "@/(onboarding)/onboarding/_components/Step4/Prices/utils";
import {
  Extra,
  getExtraPriceType,
} from "@/(onboarding)/onboarding/_components/Step4/Extras/utils";
import { getExtrasError } from "@/(onboarding)/onboarding/_components/Step4/Extras/Extras";
import { TravelExpenses } from "@/(onboarding)/onboarding/_components/Step4/TravelExpensesIntervals/utils";
import { getTravelExpensesIntervalsError } from "@/(onboarding)/onboarding/_components/Step4/TravelExpensesIntervals";

export class Pack {
  constructor(data: any) {
    Object.assign(this, data);

    this.primaryPhotoID = data.primaryPhotoID?.length
      ? data.primaryPhotoID
      : null;
    this.photoIDs = data.photoIDs ?? [];
    this.attachmentIDs = data.attachmentIDs ?? [];
    this.spaceIDs = Array.isArray(data.spaceIDs) ? data.spaceIDs : [];
    this.journey = data.journey ?? "venues";
    this.upfrontPercentage = data.upfrontPercentage ?? 20;

    const minTimeStr =
      data.minTime != null && String(data.minTime).length > 0
        ? String(data.minTime)
        : null;
    this.minTime = minTimeStr ? TimeDuration.fromString(minTimeStr) : null;

    const maxTimeStr =
      data.maxTime != null && String(data.maxTime).length > 0
        ? String(data.maxTime)
        : null;
    this.maxTime = maxTimeStr ? TimeDuration.fromString(maxTimeStr) : null;

    this.prices = data.prices
      ? (data.prices as any[]).map((price) => ({
          id: uuidv4(),
          from: price.from as string,
          to: price.to as string,
          schedules: price.schedules
            ? (price.schedules as any[]).map((schedule) => ({
                id: uuidv4(),
                start: TimeDuration.fromString(schedule.start as string),
                end: TimeDuration.fromString(schedule.end as string),
                valueHour: schedule.valueHour as number,
                valuePerson: schedule.valuePerson as number,
                minValue: schedule.minValue as number,
                type: getPriceScheduleType(
                  schedule.valuePerson as number,
                  schedule.valueHour as number,
                ),
                daysOfWeek: schedule.daysOfWeek
                  ? (schedule.daysOfWeek as DayOfWeek[])
                  : [],
              }))
            : [],
        }))
      : [];

    this.extras = data.extras
      ? (data.extras as any[]).map((extra) => ({
          id: extra.id ?? uuidv4(),
          type: getExtraPriceType(
            extra.pricePax as number,
            extra.priceHour as number,
          ),
          description: extra.description,
          tooltip: extra.tooltip ?? null,
          priceHour: extra.priceHour,
          pricePax: extra.pricePax,
          fixedPrice: extra.fixedPrice,
          mandatory: extra.mandatory,
          defaultHour: extra.defaultHour ?? null,
          minHour: extra.minHour ?? null,
          maxHour: extra.maxHour ?? null,
          defaultPax: extra.defaultPax ?? null,
          minPax: extra.minPax ?? null,
          maxPax: extra.maxPax ?? null,
        }))
      : [];

    this.travelExpenses = data.travelExpenses
      ? {
          from_billing: data.travelExpenses.from_billing,
          country: data.travelExpenses.country ?? "",
          street1: data.travelExpenses.street1 ?? "",
          street2: data.travelExpenses.street2 ?? "",
          postalCode: data.travelExpenses.postalCode ?? "",
          city: data.travelExpenses.city ?? "",
          latitude: data.travelExpenses.latitude ?? 0,
          longitude: data.travelExpenses.longitude ?? 0,
          intervals: (data.travelExpenses.intervals as any[]).map(
            (interval) => ({
              id: uuidv4(),
              from: interval.from,
              to: interval.to,
              price: interval.price,
            }),
          ),
        }
      : null;

    this.price = data.price
      ? {
          value: data.price.value,
          timeOverflow: data.price.timeOverflow,
          schedules: ((data.price.schedules ?? []) as any[]).map(
            (schedule) => ({
              duration: TimeDuration.fromString(schedule.duration as string),
              pax: schedule.pax,
              ratioPax: schedule.ratioPax,
              value: schedule.value,
              minValue: schedule.minValue,
              valueHour: schedule.valueHour,
              valuePax: schedule.valuePax,
            }),
          ),
          extras: ((data.price.extras ?? []) as any[]).map((extra) => ({
            id: extra.id,
            description: extra.description,
            value: extra.value,
          })),
        }
      : null;
  }

  id!: string;
  reference!: string;
  createdAt!: string;
  updatedAt!: string;

  journey!: Journey;

  status!: Status;

  ownerID!: string;

  name!: string;
  description!: string;
  attributes!: null | (PackFeature | PackServiceTypeFeature)[];
  noticeDays!: number;
  minTime!: TimeDuration | null;
  maxTime!: TimeDuration | null;
  capacities!: PackCapacity[];
  cancellationPeriod!: string;
  upfrontPercentage!: number;
  prices!: Price[];
  extras!: Extra[];
  travelExpenses!: TravelExpenses | null;

  // Missing fields on the API
  // distancePrices

  primaryPhotoID!: string | null;
  photoIDs!: string[];
  attachmentIDs!: string[];

  spaceIDs!: string[];

  price!: null | CalculatedPrice;

  unavailabilityReason!: "" | "capacity" | "minTime" | "dateStartEnd";

  get primarySpaceID() {
    return this.spaceIDs[0] ?? null;
  }

  get allPhotoIDs() {
    return this.primaryPhotoID ? [this.primaryPhotoID, ...this.photoIDs] : [];
  }

  get featureAttributes() {
    return PACK_FEATURES.flatMap((group) =>
      group.chips.map((chip) => chip),
    ).filter((chip) => this.attributes?.includes(chip.id));
  }

  get featureAttributesIds() {
    return this.featureAttributes.map((attr) => attr.id);
  }

  get serviceTypeFeatureAttributes() {
    return PACK_SERVICE_TYPE_FEATURES_FLAT.filter(({ id }) =>
      this.attributes?.includes(id),
    );
  }

  get serviceTypeFeatureAttributesIds() {
    return this.serviceTypeFeatureAttributes.map((attr) => attr.id);
  }

  get statusWording() {
    return STATUSES.find((status) => status.id === this.status)!;
  }

  get isInProgress() {
    return this.status === "in_progress";
  }

  get isCompleted() {
    return (
      !!this.name &&
      !!this.description &&
      !getPricesError(this.prices) &&
      !getExtrasError(this.extras) &&
      (this.isServicesJourney
        ? this.serviceTypeFeatureAttributesIds.length > 0 &&
          !getTravelExpensesIntervalsError(this.travelExpenses?.intervals ?? [])
        : this.capacities.some(({ capacity }) => capacity > 0)) &&
      !!this.cancellationPeriod
    );
  }

  get maxCapacity() {
    return Math.max(...this.capacities.map(({ capacity }) => capacity));
  }

  get formattedCapacities() {
    return PACK_CAPACITIES.map((capacity) => ({
      ...capacity,
      people:
        this.capacities.find(({ layout }) => layout === capacity.id)
          ?.capacity ?? 0,
    })).filter((capacity) => capacity.people > 0);
  }

  get formattedMinMaxTime() {
    return !!this.minTime?.number && !!this.maxTime?.number
      ? `Entre ${this.minTime.number}h a ${this.maxTime.number}h`
      : this.maxTime?.number
        ? `Até ${this.maxTime.number}h`
        : this.minTime?.number
          ? `Mínimo ${this.minTime.number}h`
          : null;
  }

  get bookingAttributes() {
    return this.featureAttributes;
  }

  get unavailabilityReasonLabel() {
    switch (this.unavailabilityReason) {
      case "":
        return null;
      case "capacity":
        return "Número máximo de pessoas excedido";
      case "minTime":
        if (this.minTime) {
          return `Duração mínima de ${this.minTime.number}h`;
        } else {
          return "Duração mínima não alcançada";
        }
      case "dateStartEnd":
        return "Sem disponibilidade na data e horário selecionados";
      default:
        return null;
    }
  }

  get isVenuesJourney() {
    return this.journey === "venues";
  }

  get isServicesJourney() {
    return this.journey === "services";
  }
}

export type CalculatedPrice = {
  value: number;
  timeOverflow: boolean;
  schedules: {
    duration: TimeDuration | null;
    pax: number;
    ratioPax: number | null; // [0, 1]
    value: number;
    minValue: number;
    valueHour: number;
    valuePax: number;
  }[];
  extras: {
    id: string;
    description: string;
    value: number;
  }[];
};

type ListPacksQuery = {
  date: string; // ISO Datetime at midnight
  start: string;
  end: string;
  num_persons: number;
  extras: string;
  extra_params?: string;
};

export const usePacks = (
  {
    spaceID,
    query,
    mode = "auth",
    onFetchDone,
  }: {
    spaceID?: string;
    query?: ListPacksQuery;
    mode?: "public" | "auth";
    onFetchDone?: (packs: Pack[]) => void;
  },
  options?: { enabled?: boolean; keepPreviousData?: boolean },
) => {
  const fetchApi = useFetch();

  const base = (
    {
      auth: "packs",
      public: "public/packs",
    } as const
  )[mode];

  const optionsEnabled =
    options?.enabled === true || options?.enabled === undefined;

  return useQuery<Pack[]>({
    queryKey: [base, spaceID, query],
    queryFn: () =>
      fetchApi(base, `space/${spaceID}`, undefined, undefined, query).then(
        (packs: any[]) => {
          const formattedPacks = packs.map((pack) => new Pack(pack));

          onFetchDone?.(formattedPacks);
          return formattedPacks;
        },
      ),
    enabled: !!spaceID && optionsEnabled,
    placeholderData: options?.keepPreviousData ? keepPreviousData : undefined,
  });
};

export const usePacksForSpaces = ({
  spaceIDs = [],
}: {
  spaceIDs?: string[];
}) => {
  const fetchApi = useFetch();

  return useQueries({
    queries: spaceIDs.map((spaceID) => ({
      queryKey: ["packs", spaceID],
      queryFn: () =>
        fetchApi("packs", `space/${spaceID}`).then((packs: any[]) =>
          packs.map((pack) => new Pack(pack)),
        ),
      enabled: !!spaceID,
    })),
  });
};

export const usePack = (id?: string) => {
  const fetchApi = useFetch();

  return useQuery<Pack>({
    queryKey: ["packs", id],
    queryFn: () => fetchApi("packs", id).then((pack: any) => new Pack(pack)),
    enabled: !!id,
  });
};

export const useCreatePack = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<Pack, unknown, { spaceID: string }>({
    mutationFn: ({ spaceID }) =>
      fetchApi("packs", "", { method: "POST", body: { spaceID } }).then(
        (pack: any) => new Pack(pack),
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["packs"] });
    },
  });
};

type UpdatePackBody = Partial<
  Omit<
    Pack,
    | "id"
    | "createdAt"
    | "ownerID"
    | "spaceIDs"
    | "minTime"
    | "maxTime"
    | "prices"
    | "extras"
    | "travelExpenses"
  > & {
    minTime: string; // TimeDuration string or ""
    maxTime: string; // TimeDuration string or ""
    prices: Partial<{
      from: string;
      to: string;
      schedules: Partial<{
        start: string;
        end: string;
        minValue: number;
        valueHour: number;
        valuePerson: number;
        daysOfWeek: string[];
      }>[];
    }>[];
    extras: Partial<{
      description: string;
      fixedPrice: number;
      pricePax: number;
      priceHour: number;
    }>[];
    travelExpenses:
      | undefined
      | Partial<{
          from_billing: boolean;
          country: string;
          street1: string;
          street2: string;
          postalCode: string;
          city: string;
          latitude: number;
          longitude: number;
          intervals: Partial<{
            from: number;
            to: number;
            price: number;
          }>[];
        }>;
  }
>;

export const useUpdatePack = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<Pack, unknown, { id: string; body: UpdatePackBody }>({
    mutationFn: ({ id, body }) =>
      fetchApi("packs", id, { method: "PATCH", body }).then(
        (pack: any) => new Pack(pack),
      ),
    onSettled: (pack, _error, { id }) => {
      queryClient.setQueryData(["packs", id], pack);
    },
  });
};

export const useUpdatePackStatus = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, { id: string; status: Status }>({
    mutationFn: ({ id, status }) =>
      fetchApi("packs", `${id}/status`, { method: "PUT", body: { status } }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-list"] });
    },
  });
};

export const useDeletePack = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, { id: string }>({
    mutationFn: ({ id }) => fetchApi("packs", id, { method: "DELETE" }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["packs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-list"] });
    },
  });
};

export const useCreatePackCopy = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, { id: string }>({
    mutationFn: ({ id }) => fetchApi("packs", `${id}/copy`, { method: "POST" }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["packs"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-list"] });
    },
  });
};
