import { VENUE_PARKING } from "@/_constants/venue/parking";
import { VENUE_SLEEPING } from "@/_constants/venue/sleeping";
import { useFetch } from "@/_services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Status } from "@/_constants/status";
import { isValidPhone } from "@/_design_system/InputPhone";
import { isNotNil } from "@/_utils/filter";
import { FetchApi } from "@/_services/apiServer";
import { useMemo } from "react";

export class Venue {
  constructor(data: any) {
    Object.assign(this, data);

    this.primaryPhotoID = data.primaryPhotoID?.length
      ? data.primaryPhotoID
      : null;
    this.photoIDs = data.photoIDs ?? [];
    this.subscription = data.subscription ?? "basic";
    this.journey = data.journey ?? "venues";
  }

  id!: string;
  reference!: string;
  createdAt!: string;
  updatedAt!: string;

  subscription!: Subscription;
  journey!: Journey;

  status!: Status;

  ownerID!: string;
  accessRole?: "owner" | "collaborator";

  name!: string;
  description!: string;
  attributes!: null | string[];

  primaryPhotoID!: string | null;
  photoIDs!: string[];

  country!: string;
  street1!: string;
  street2!: string;
  postalCode!: string;
  city!: string;
  latitude!: number;
  longitude!: number;

  billingName!: string;
  billingVAT!: string;
  billingAddress!: string;
  billingPostalCode!: string;
  billingCity!: string;
  billingIBAN!: string;
  billingEmail!: string;

  contactName!: string;
  contactPhoneExtension!: number;
  contactPhoneNumber!: number;
  contactEmail!: string;

  commision?: number;

  get allPhotoIDs() {
    return this.primaryPhotoID ? [this.primaryPhotoID, ...this.photoIDs] : [];
  }

  get sleepingAttributes() {
    return VENUE_SLEEPING.filter((attr) => this.attributes?.includes(attr.id));
  }

  get sleepingAttributesIds() {
    return this.sleepingAttributes.map((attr) => attr.id);
  }

  get parkingAttributes() {
    return VENUE_PARKING.filter((attr) => this.attributes?.includes(attr.id));
  }

  get parkingAttributesIds() {
    return this.parkingAttributes.map((attr) => attr.id);
  }

  get isInProgress() {
    return this.status === "in_progress";
  }

  get isCompleted() {
    return (
      !!this.name &&
      this.description.length >= 150 &&
      !!this.latitude &&
      !!this.longitude &&
      !!this.street1 &&
      !!this.postalCode &&
      !!this.city &&
      this.allPhotoIDs.length > 0 &&
      !!this.billingAddress &&
      !!this.billingIBAN &&
      !!this.billingName &&
      !!this.billingVAT &&
      !!this.billingPostalCode &&
      !!this.billingCity &&
      !!this.billingEmail &&
      !!this.contactEmail &&
      !!this.contactName &&
      isValidPhone({
        extension: this.contactPhoneExtension,
        number: this.contactPhoneNumber,
      })
    );
  }

  get bookingAttributes() {
    return [...this.parkingAttributes, ...this.sleepingAttributes].filter(
      isNotNil,
    );
  }

  get isVenuesJourney() {
    return this.journey === "venues";
  }

  get isServicesJourney() {
    return this.journey === "services";
  }
}

export type Subscription = "basic" | "premium" | "expert";
export type Journey = "services" | "venues";

export const useVenues = (options?: { enabled: boolean }) => {
  const fetchApi = useFetch();

  return useQuery<Venue[]>({
    queryKey: ["venues"],
    queryFn: () =>
      fetchApi("venues").then((venues: any[]) =>
        venues.map((venue) => new Venue(venue)),
      ),
    enabled: options?.enabled,
  });
};

export const getVenueQueryFn =
  (fetchApi: FetchApi) =>
  (id?: string, base: "venues" | "public/venues" = "venues") =>
    fetchApi(base, id).then((venue: any) => new Venue(venue));

export const useVenue = (id?: string, mode: "public" | "auth" = "auth") => {
  const fetchApi = useFetch();

  const base = (
    {
      auth: "venues",
      public: "public/venues",
    } as const
  )[mode];

  const query = useQuery<Venue>({
    queryKey: [base, id],
    queryFn: () => fetchApi(base, id),
    enabled: !!id,
  });

  // We need to instanciate the result separately in order to use Hydration the space/[spaceID] page
  // This is needed because the Hydration cannot pass classes from server to the client
  const instanciatedQuery = useMemo(
    () => ({
      isLoading: query.isLoading,
      isPending: query.isPending,
      data: query.data ? new Venue(query.data) : undefined,
    }),
    [query.data, query.isLoading, query.isPending],
  );

  return instanciatedQuery;
};

export const useCreateVenue = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<Venue, unknown, { journey: Journey }>({
    mutationFn: (body) =>
      fetchApi("venues", "", { method: "POST", body }).then(
        (venue: any) => new Venue(venue),
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
    },
  });
};

type UpdateVenueBody = Partial<Omit<Venue, "id" | "createdAt" | "ownerID">>;

export const useUpdateVenue = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<Venue, unknown, { id: string; body: UpdateVenueBody }>({
    mutationFn: ({ id, body }) =>
      fetchApi("venues", id, { method: "PATCH", body }).then(
        (venue: any) => new Venue(venue),
      ),
    onSettled: (updatedVenue, _error, { id }) => {
      queryClient.setQueryData(["venues", id], updatedVenue);

      const venuesQueryData = queryClient.getQueryData(["venues"]) as Venue[];

      if (venuesQueryData) {
        queryClient.setQueryData(
          ["venues"],
          venuesQueryData.map((venue) =>
            venue.id === id ? updatedVenue : venue,
          ),
        );
      }

      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-list"] });
    },
  });
};

export const useUpdateVenueStatus = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, { id: string; status: Status }>({
    mutationFn: ({ id, status }) =>
      fetchApi("venues", `${id}/status`, { method: "PUT", body: { status } }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-list"] });
    },
  });
};

export const useDeleteVenue = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, { id: string }>({
    mutationFn: ({ id }) => fetchApi("venues", id, { method: "DELETE" }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["venues"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-list"] });
    },
  });
};
