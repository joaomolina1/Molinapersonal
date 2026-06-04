import { useFetch } from "@/_services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type VenueCollaborator = {
  id: string;
  venueID: string;
  userID: string;
  email: string;
  name: string;
  createdAt: string | null;
};

export type VenueCollaboratorLookup = {
  userID: string;
  email: string;
  name: string;
};

export const useVenueCollaborators = (venueId?: string) => {
  const fetchApi = useFetch();

  return useQuery<VenueCollaborator[]>({
    queryKey: ["venue-collaborators", venueId],
    queryFn: () => fetchApi("venues", `${venueId}/collaborators`),
    enabled: !!venueId,
  });
};

export const useAddVenueCollaborator = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<VenueCollaborator, unknown, { venueId: string; email: string }>({
    mutationFn: ({ venueId, email }) =>
      fetchApi("venues", `${venueId}/collaborators`, {
        method: "POST",
        body: { email },
      }),
    onSettled: (_data, _err, { venueId }) => {
      queryClient.invalidateQueries({ queryKey: ["venue-collaborators", venueId] });
    },
  });
};

export const useRemoveVenueCollaborator = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, { venueId: string; userId: string }>({
    mutationFn: ({ venueId, userId }) =>
      fetchApi("venues", `${venueId}/collaborators/${userId}`, {
        method: "DELETE",
      }),
    onSettled: (_data, _err, { venueId }) => {
      queryClient.invalidateQueries({ queryKey: ["venue-collaborators", venueId] });
    },
  });
};
