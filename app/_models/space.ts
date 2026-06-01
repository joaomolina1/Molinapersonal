import { SPACE_ACCESSIBILITIES } from "@/_constants/space/accessibilities";
import { SPACE_CATEGORIES_FLAT } from "@/_constants/space/categories";
import { SPACE_CATERING } from "@/_constants/space/catering";
import { SPACE_EVENT_TYPES_FLAT } from "@/_constants/space/eventTypes";
import { SPACE_FACILITIES_FLAT } from "@/_constants/space/facilities";
import { SPACE_KINDS } from "@/_constants/space/kinds";
import { SPACE_PRIVACIES } from "@/_constants/space/privacies";
import { SPACE_SOUND } from "@/_constants/space/sound";
import { useFetch } from "@/_services/api";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { STATUSES, Status } from "@/_constants/status";
import { isNotNil } from "@/_utils/filter";
import { useMemo } from "react";
import { parseDate } from "@internationalized/date";
import { TimeDuration } from "@/_utils/number";
import { Journey } from "./venue";
import { SERVICE_TYPES } from "@/_constants/space/serviceTypes";

export class Space {
  constructor(data: any) {
    Object.assign(this, data);

    this.primaryPhotoID = data.primaryPhotoID?.length
      ? data.primaryPhotoID
      : null;
    this.photoIDs = data.photoIDs ?? [];
    this.journey = data.journey ?? "venues";
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
  attributes!: null | string[];
  area!: number;

  primaryPhotoID!: string | null;
  photoIDs!: string[];

  venueID!: string;

  get allPhotoIDs() {
    return this.primaryPhotoID ? [this.primaryPhotoID, ...this.photoIDs] : [];
  }

  get categoryAttributes() {
    return SPACE_CATEGORIES_FLAT.filter((attr) =>
      this.attributes?.includes(attr.id),
    );
  }

  get categoryAttributesIds() {
    return this.categoryAttributes.map((attr) => attr.id);
  }

  get kindAttribute() {
    return SPACE_KINDS.find((attr) => this.attributes?.includes(attr.id));
  }

  get kindAttributeId() {
    return this.kindAttribute?.id;
  }

  get privacyAttribute() {
    return SPACE_PRIVACIES.find((attr) => this.attributes?.includes(attr.id));
  }

  get privacyAttributeId() {
    return this.privacyAttribute?.id;
  }

  get eventTypeAttributes() {
    return SPACE_EVENT_TYPES_FLAT.filter((attr) =>
      this.attributes?.includes(attr.id),
    );
  }

  get eventTypeAttributesIds() {
    return this.eventTypeAttributes.map((attr) => attr.id);
  }

  get facilitiesAttributes() {
    return SPACE_FACILITIES_FLAT.filter((attr) =>
      this.attributes?.includes(attr.id),
    );
  }

  get facilitiesAttributesIds() {
    return this.facilitiesAttributes.map((attr) => attr.id);
  }

  get accessibilitiesAttributes() {
    return SPACE_ACCESSIBILITIES.filter((attr) =>
      this.attributes?.includes(attr.id),
    );
  }

  get accessibilitiesAttributesIds() {
    return this.accessibilitiesAttributes.map((attr) => attr.id);
  }

  get cateringAttributes() {
    return SPACE_CATERING.filter((attr) => this.attributes?.includes(attr.id));
  }

  get cateringAttributesIds() {
    return this.cateringAttributes.map((attr) => attr.id);
  }

  get soundAttributes() {
    return SPACE_SOUND.filter((attr) => this.attributes?.includes(attr.id));
  }

  get soundAttributesIds() {
    return this.soundAttributes.map((attr) => attr.id);
  }

  get serviceTypeAttribute() {
    return SERVICE_TYPES.find((attr) => this.attributes?.includes(attr.id));
  }

  get serviceTypeAttributeId() {
    return this.serviceTypeAttribute?.id;
  }

  get statusWording() {
    return STATUSES.find((status) => status.id === this.status)!;
  }

  get isInProgress() {
    return this.status === "in_progress";
  }

  get isCompletedPage1() {
    return (
      !!this.name &&
      (this.isServicesJourney
        ? !!this.serviceTypeAttribute && this.eventTypeAttributes.length > 0
        : this.categoryAttributes.length > 0 &&
          !!this.kindAttribute &&
          !!this.privacyAttribute &&
          !!this.area) &&
      !!this.description &&
      this.allPhotoIDs.length >= 3
    );
  }

  get isCompletedPage2() {
    return this.isServicesJourney || this.eventTypeAttributes.length > 0;
  }

  get bookingAttributes() {
    return [
      this.kindAttribute,
      this.privacyAttribute,
      ...this.facilitiesAttributes,
      ...this.accessibilitiesAttributes,
      ...this.cateringAttributes,
      ...this.soundAttributes,
    ].filter(isNotNil);
  }

  get isVenuesJourney() {
    return this.journey === "venues";
  }

  get isServicesJourney() {
    return this.journey === "services";
  }
}

export const useSpaces = (
  { venueID }: { venueID?: string },
  options?: { enabled: boolean },
) => {
  const fetchApi = useFetch();

  const optionsEnabled =
    options?.enabled === true || options?.enabled === undefined;

  return useQuery<Space[]>({
    queryKey: ["spaces", venueID],
    queryFn: () =>
      fetchApi("spaces", `?venueID=${venueID}`).then((spaces: any[]) =>
        spaces.map((space) => new Space(space)),
      ),
    enabled: !!venueID && optionsEnabled,
  });
};

export const useAllSpaces = () => {
  const fetchApi = useFetch();

  return useQuery<Space[]>({
    queryKey: ["spaces"],
    queryFn: () =>
      fetchApi("spaces").then((spaces: any[]) =>
        spaces.map((space) => new Space(space)),
      ),
  });
};

export const useSpacesForVenues = ({
  venueIDs = [],
}: {
  venueIDs?: string[];
}) => {
  const fetchApi = useFetch();

  return useQueries({
    queries: venueIDs.map((venueID) => ({
      queryKey: ["spaces", venueID],
      queryFn: () =>
        fetchApi("spaces", `?venueID=${venueID}`).then((spaces: any[]) =>
          spaces.map((space) => new Space(space)),
        ),
      enabled: !!venueID,
    })),
  });
};

export const useSpace = (id?: string, mode: "public" | "auth" = "auth") => {
  const fetchApi = useFetch();

  const base = (
    {
      auth: "spaces",
      public: "public/spaces",
    } as const
  )[mode];

  const query = useQuery<Space>({
    queryKey: [base, id],
    queryFn: () => fetchApi(base, id),
    enabled: !!id,
  });

  // We need to instanciate the result separately in order to use Hydration the space/[spaceID] page
  // This is needed because the Hydration cannot pass classes from server to the client
  const instanciatedQuery = useMemo(
    () => ({
      isPending: query.isPending,
      isLoading: query.isLoading,
      data: query.data ? new Space(query.data) : undefined,
    }),
    [query.isPending, query.isLoading, query.data],
  );

  return instanciatedQuery;
};

export const useSpacesAvailabilities = (
  ids: string[],
  query: { from: string; to: string }, // ISO Date
) => {
  const fetchApi = useFetch();

  return useQueries({
    queries: ids.map((id) => ({
      queryKey: ["space-availability", id, query],
      queryFn: () =>
        fetchApi(
          "spaces",
          `${id}/availability`,
          undefined,
          undefined,
          query,
        ).then(
          (
            availabilities: {
              date: string;
              hours: { from: string; to: string }[];
            }[],
          ) => {
            return availabilities.map((availability) => ({
              date: parseDate(availability.date),
              hours: availability.hours.map((hour) => ({
                from: TimeDuration.fromString(hour.from),
                to: TimeDuration.fromString(hour.to),
              })),
            }));
          },
        ),
    })),
  });
};

export const useCreateSpace = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<Space, unknown, { venueID: string }>({
    mutationFn: ({ venueID }) =>
      fetchApi("spaces", "", { method: "POST", body: { venueID } }).then(
        (space: any) => new Space(space),
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
    },
  });
};

type UpdateSpaceBody = Partial<
  Omit<Space, "id" | "createdAt" | "ownerID" | "venueID">
>;

export const useUpdateSpace = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<Space, unknown, { id: string; body: UpdateSpaceBody }>({
    mutationFn: ({ id, body }) =>
      fetchApi("spaces", id, { method: "PATCH", body }).then(
        (space: any) => new Space(space),
      ),
    onSettled: (space, _error, { id }) => {
      queryClient.setQueryData(["spaces", id], space);
    },
  });
};

export const useUpdateSpaceStatus = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, { id: string; status: Status }>({
    mutationFn: ({ id, status }) =>
      fetchApi("spaces", `${id}/status`, { method: "PUT", body: { status } }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-list"] });
    },
  });
};

export const useSubmitSpace = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, { id: string }>({
    mutationFn: ({ id }) =>
      fetchApi("spaces", `${id}/submit`, { method: "POST" }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["packs"] });
    },
  });
};

export const useDeleteSpace = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, { id: string }>({
    mutationFn: ({ id }) => fetchApi("spaces", id, { method: "DELETE" }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["spaces"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-list"] });
    },
  });
};
