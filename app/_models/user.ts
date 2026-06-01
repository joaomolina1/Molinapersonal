import { useFetch } from "@/_services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export class User {
  constructor(data: any) {
    Object.assign(this, data);
  }

  id!: string;
  name!: string;
  email!: string;
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
