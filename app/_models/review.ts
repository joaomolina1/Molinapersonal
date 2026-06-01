import { useFetch } from "@/_services/api";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export class Review {
  constructor(data: any) {
    Object.assign(this, data);

    this.photos = ((data.photos as string[]) ?? []).filter((photo) => !!photo);
  }

  id!: string;
  ownerID!: string;
  ownerName!: string;
  createdAt!: string;
  rating!: number;
  comment!: string;
  photos!: string[];

  get rateCategory() {
    return getRatingCategory(this.rating);
  }
}

export const getRatingCategory = (rating: number) => {
  return rating < 3 ? "Normal" : rating < 4 ? "Bom" : "Fantástico";
};

type ListSpaceReviewsQuery = {
  entity: string;
  kind: "space";
  page: number;
  page_size: number;
};

export const useReviews = (query: ListSpaceReviewsQuery) => {
  const fetchApi = useFetch();

  return useQuery<Review[]>({
    queryKey: ["reviews", query],
    queryFn: () =>
      fetchApi("reviews", undefined, undefined, undefined, query).then(
        (reviews: any[]) => reviews.map((review) => new Review(review)),
      ),
    placeholderData: keepPreviousData,
  });
};

type GetReviewStatsQuery = {
  entity: string;
  kind: "space";
};

export const useReviewsStats = (query: GetReviewStatsQuery) => {
  const fetchApi = useFetch();

  return useQuery<{ count: number; average_rating: number }>({
    queryKey: ["reviews", query],
    queryFn: () => fetchApi("reviews", "stats", undefined, undefined, query),
  });
};

type CreateReviewBody = {
  entity: string;
  kind: "space";
  rating: number;
  comment: string;
  photos: string[];
  name: string;
};

export const useCreateReview = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, CreateReviewBody>({
    mutationFn: (body) => fetchApi("reviews", "", { method: "POST", body }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};

export const useDeleteReview = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, { id: string }>({
    mutationFn: ({ id }) => fetchApi("reviews", id, { method: "DELETE" }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });
};
