import { SpaceEventType } from "@/_constants/space/eventTypes";
import { useFetch } from "@/_services/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { FetchApi } from "@/_services/apiServer";
import { SpaceCategory } from "@/_constants/space/categories";
import { SpaceKind } from "@/_constants/space/kinds";
import { SpacePrivacy } from "@/_constants/space/privacies";
import { SpaceFacility } from "@/_constants/space/facilities";
import { SpaceCatering } from "@/_constants/space/catering";
import { SpaceSound } from "@/_constants/space/sound";
import { SpaceAccessibility } from "@/_constants/space/accessibilities";
import { PackFeature } from "@/_constants/pack/features";
import {
  AttributeFilterKey,
  TabFilterKey,
} from "@/(main)/search/_utils/attributes";
import { HighlightMode } from "@/_constants/highlights";
import { Subscription } from "./venue";
import { Status, STATUSES } from "@/_constants/status";
import { useSession } from "@/_services/session";

export class SearchResult {
  constructor({ photoURLs = [], ...data }: any) {
    Object.assign(this, data);

    this.photoURLs = (photoURLs as string[]).filter((url) => !!url);
    this.subscription = data.subscription ?? "basic";
  }

  id!: string;
  createdAt!: string;

  spaceName!: string;
  venueName!: string;
  venueID!: string;
  status!: Status;

  subscription!: Subscription;

  address!: {
    country: string;
    street1: string;
    street2: string;
    postalCode: string;
    city: string;
    latitude: number;
    longitude: number;
  };

  price!: {
    min: number | null;
    pax: number | null;
    hour: number | null;
  };

  capacity!: number;
  recommended!: boolean;
  highlighted!: boolean;

  photoURLs!: string[];

  get formattedPrice() {
    const paxPrice =
      this.price.pax !== null && this.price.pax > 0
        ? { type: "pessoa" as const, amount: this.price.pax }
        : null;
    const hourPrice =
      this.price.hour !== null && this.price.hour > 0
        ? { type: "hora" as const, amount: this.price.hour }
        : null;

    const price =
      !!paxPrice && !!hourPrice
        ? paxPrice.amount <= hourPrice.amount
          ? paxPrice
          : hourPrice
        : (paxPrice ?? hourPrice);

    return price;
  }

  get statusWording() {
    return STATUSES.find((status) => status.id === this.status)!;
  }
}

type SearchQuery = {
  eventType?: SpaceEventType;
  date?: string;
  start?: string;
  end?: string;
  numPeople?: number;
  attributes?: (AttributeFilterKey | TabFilterKey | SpaceEventType)[];
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  venueID?: string;
  mode?: HighlightMode;
  budgetMin?: number;
  budgetMax?: number;
  q?: string;
  page?: number;
  pageSize?: number;
};

export const getSearchQueryFn =
  (fetchApi: FetchApi, mode: "public" | "auth") => (query?: SearchQuery) =>
    fetchApi(
      mode === "auth" ? "search" : "public/search",
      undefined,
      undefined,
      undefined,
      query,
      "v2",
    );

type SearchResponse = {
  data: any[];
  pagination: {
    page: number;
    pageSize: number;
  };
  totalResults: number;
};

export const useSearch = (
  query?: SearchQuery,
  options?: { enabled: boolean },
) => {
  const [session] = useSession();
  const fetchApi = useFetch();
  const mode = session?.roles.includes("admin") ? "auth" : "public";
  const queryFn = getSearchQueryFn(fetchApi, mode);

  return useQuery<SearchResponse>({
    queryKey: ["search", mode, query],
    queryFn: () => queryFn(query),
    placeholderData: keepPreviousData,
    enabled: options?.enabled,
    retry: 3,
    staleTime: 60_000,
  });
};

export const instanciateSearchResults = (searchResults?: any[]) =>
  searchResults?.map((searchResult) => new SearchResult(searchResult));

export const useSearchResults = ({
  query,
  options,
  filter,
}: {
  query?: SearchQuery;
  options?: { enabled: boolean };
  filter?: (
    searchResults: SearchResult[] | undefined,
  ) => SearchResult[] | undefined;
}) => {
  const { data: _searchResults } = useSearch(query, options);
  const searchResults = instanciateSearchResults(_searchResults?.data);

  const filteredSearchResults = filter ? filter(searchResults) : searchResults;

  return filteredSearchResults;
};

export type City = {
  Name: string;
  Top: number;
  Left: number;
  Bottom: number;
  Right: number;
};

export const getCitiesQueryFn = (fetchApi: FetchApi) => () =>
  fetchApi("search", "places").then((cities: City[] | null) => cities ?? []);

export const useCities = ({ enabled }: { enabled: boolean }) => {
  const fetchApi = useFetch();
  const queryFn = getCitiesQueryFn(fetchApi);

  return useQuery({
    queryKey: ["search-places"],
    queryFn,
    enabled,
    retry: 10,
  });
};

export const getAttributesQueryFn = (fetchApi: FetchApi) => () =>
  fetchApi("search", "attributes").then(
    (attributes: Attribute[] | null) => attributes ?? [],
  );

export type Attribute =
  | SpaceCategory
  | SpaceKind
  | SpacePrivacy
  | SpaceEventType
  | SpaceFacility
  | SpaceAccessibility
  | SpaceCatering
  | SpaceSound
  | PackFeature;

export const useAttributes = () => {
  const fetchApi = useFetch();
  const queryFn = getAttributesQueryFn(fetchApi);

  return useQuery<Attribute[]>({
    queryKey: ["search-attributes"],
    queryFn,
    retry: 10,
  });
};
