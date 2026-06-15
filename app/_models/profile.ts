import { useFetch } from "@/_services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type Profile = {
  id: string;
  name: string;
  roles: string[];
  kind: string | null;
  dateOfBirth: string | null;
  phoneExtension: number | null;
  phoneNumber: number | null;
  photoURL: string | null;
};

const mapProfile = (data: any): Profile => ({
  id: data.id,
  name: data.name ?? "",
  roles: Array.isArray(data.roles) ? data.roles : [],
  kind: data.kind ?? null,
  dateOfBirth: data.date_of_birth ?? null,
  phoneExtension: data.phone_extension ?? null,
  phoneNumber: data.phone_number ?? null,
  photoURL: data.photo_url ?? null,
});

export const useMyProfile = () => {
  const fetchApi = useFetch();

  return useQuery<Profile>({
    queryKey: ["profile", "me"],
    queryFn: () => fetchApi("users").then(mapProfile),
  });
};

export type UpdateProfileBody = {
  name?: string;
  phoneExtension?: number | null;
  phoneNumber?: number | null;
  dateOfBirth?: string | null;
};

export const useUpdateProfile = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<Profile, unknown, UpdateProfileBody>({
    mutationFn: (body) =>
      fetchApi("users", "", { method: "PATCH", body }).then(mapProfile),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useUploadAvatar = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<{ photoURL: string }, unknown, { file: File }>({
    mutationFn: ({ file }) =>
      fetchApi(
        "users",
        "avatar",
        { method: "POST", body: { file } },
        {
          contentType: "form-data",
          tokenAuthenticated: true,
          cookieAuthenticated: false,
        },
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};
