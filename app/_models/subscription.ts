import { useFetch } from "@/_services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type SubscriptionPlan = "premium" | "expert";
export type SubscriptionInterval = "month" | "year";
export type SubscriptionStatus =
  | "incomplete"
  | "active"
  | "past_due"
  | "canceled";

export class Subscription {
  constructor(data: any) {
    Object.assign(this, data);
  }

  id!: string;
  venueID!: string;
  ownerID!: string;
  plan!: SubscriptionPlan;
  interval!: SubscriptionInterval;
  status!: SubscriptionStatus;
  stripeCustomerID!: string;
  stripeSubscriptionID!: string;
  currentPeriodEnd!: string | null;
  cancelAtPeriodEnd!: boolean;
  createdAt!: string | null;

  get isActive() {
    return this.status === "active";
  }

  get maxFeaturedSpaces() {
    return this.plan === "expert" ? 3 : 1;
  }

  get supportsHome() {
    return this.plan === "expert";
  }

  get lockMonths() {
    return this.plan === "expert" ? 1 : 3;
  }
}

export type FeaturedSpace = {
  id: string;
  spaceID: string;
  mode: "search" | "home";
  lockedUntil: string | null;
  priority: number;
};

export type AdminSubscription = Subscription & {
  venueName: string;
  venueReference: string;
  ownerEmail: string;
};

export const useSubscriptions = () => {
  const fetchApi = useFetch();

  return useQuery<AdminSubscription[]>({
    queryKey: ["subscriptions", "admin"],
    queryFn: () =>
      fetchApi("subscriptions", "").then((data: any[] | null) =>
        (data ?? []).map(
          (row) => Object.assign(new Subscription(row), row) as AdminSubscription,
        ),
      ),
  });
};

export const useVenueSubscription = (venueID?: string) => {
  const fetchApi = useFetch();

  return useQuery<Subscription | null>({
    queryKey: ["subscriptions", "venue", venueID],
    queryFn: () =>
      fetchApi("subscriptions", `venue/${venueID}`).then((data: any) =>
        data ? new Subscription(data) : null,
      ),
    enabled: !!venueID,
  });
};

export const useSubscribeCheckout = () => {
  const fetchApi = useFetch();

  return useMutation<
    { clientSecret: string },
    unknown,
    { venueID: string; plan: SubscriptionPlan; interval: SubscriptionInterval }
  >({
    mutationFn: (body) =>
      fetchApi("subscriptions", "checkout", { method: "POST", body }),
  });
};

export const useBillingPortal = () => {
  const fetchApi = useFetch();

  return useMutation<{ url: string }, unknown, { venueID: string }>({
    mutationFn: (body) =>
      fetchApi("subscriptions", "portal", { method: "POST", body }),
  });
};

export const useFeaturedSpaces = (venueID?: string) => {
  const fetchApi = useFetch();

  return useQuery<FeaturedSpace[]>({
    queryKey: ["subscriptions", "featured", venueID],
    queryFn: () => fetchApi("subscriptions", `featured/venue/${venueID}`),
    enabled: !!venueID,
  });
};

export const useSetFeaturedSpaces = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<
    FeaturedSpace[],
    unknown,
    { venueID: string; spaceIDs: string[]; homeSpaceID?: string | null }
  >({
    mutationFn: (body) =>
      fetchApi("subscriptions", "featured", { method: "POST", body }),
    onSettled: (_data, _error, { venueID }) => {
      queryClient.invalidateQueries({
        queryKey: ["subscriptions", "featured", venueID],
      });
    },
  });
};
