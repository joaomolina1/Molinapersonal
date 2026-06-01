import { useFetch } from "@/_services/api";
import { useSession } from "@/_services/session";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export class Watchlist {
  constructor(data: any) {
    Object.assign(this, data);

    this.spaces = data.spaces ?? [];
  }

  id!: string;
  spaces!: string[];
}

export const useWatchlist = () => {
  const fetchApi = useFetch();
  const [session] = useSession();

  return useQuery<Watchlist>({
    queryKey: ["watchlist"],
    queryFn: () =>
      fetchApi("watchlist", "default").then(
        (watchlist: any) => new Watchlist(watchlist),
      ),
    enabled: !!session && !session.roles.includes("admin"),
  });
};

export const useAddToWatchlist = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, { id: string }>({
    mutationFn: ({ id }) =>
      fetchApi("watchlist", "default/add", {
        method: "POST",
        body: { spaces: [id] },
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
};

export const useRemoveFromWatchlist = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, { id: string }>({
    mutationFn: ({ id }) =>
      fetchApi("watchlist", `default/${id}`, {
        method: "DELETE",
      }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
};
