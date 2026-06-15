import { useFetch } from "@/_services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export class User {
  constructor(data: any) {
    Object.assign(this, data);
    this.roles = Array.isArray(data.roles) ? data.roles : [];
  }

  id!: string;
  name!: string;
  email!: string;
  roles!: string[];

  get isAdmin() {
    return this.roles.includes("admin");
  }

  get isComercial() {
    return this.roles.includes("comercial");
  }
}

type UsersQuery = {
  q?: string;
  page?: number;
  page_size?: number;
};

export const useUsers = (query?: UsersQuery) => {
  const fetchApi = useFetch();

  return useQuery<User[]>({
    queryKey: ["users", query],
    queryFn: () =>
      fetchApi("users", "list", undefined, undefined, query).then(
        (users: any[] | null) => (users ?? []).map((user) => new User(user)),
      ),
  });
};

export const useUpdateUserEmail = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<void, unknown, { userId: string; email: string }>({
    mutationFn: ({ userId, email }) =>
      fetchApi("users", `${userId}/email`, {
        method: "PATCH",
        body: { email },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useUpdateUserRoles = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<
    { id: string; roles: string[] },
    unknown,
    { userId: string; roles: string[] }
  >({
    mutationFn: ({ userId, roles }) =>
      fetchApi("users", `${userId}/roles`, {
        method: "PATCH",
        body: { roles },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
};

export const useFindUserByEmail = () => {
  const fetchApi = useFetch();

  return useMutation<
    { userID: string; email: string; name: string },
    unknown,
    { email: string }
  >({
    mutationFn: ({ email }) =>
      fetchApi(
        "venues",
        "collaborators/search",
        undefined,
        undefined,
        { email },
      ),
  });
};

export const useTransferVenueOwner = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<void, unknown, { venueID: string; ownerID: string }>({
    mutationFn: ({ venueID, ownerID }) =>
      fetchApi("venues", `${venueID}/owner`, {
        method: "PATCH",
        body: { ownerId: ownerID },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
      await queryClient.invalidateQueries({ queryKey: ["venues"] });
    },
  });
};
