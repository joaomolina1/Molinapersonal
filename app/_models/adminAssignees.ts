import { useFetch } from "@/_services/api";
import { useQuery } from "@tanstack/react-query";

export type AdminAssignee = {
  id: string;
  name: string;
  email?: string;
};

export const useAdminAssignees = () => {
  const fetchApi = useFetch();

  return useQuery<AdminAssignee[]>({
    queryKey: ["admin-assignees"],
    queryFn: async () => {
      const rows = (await fetchApi("users", "list")) as {
        id: string;
        name?: string;
        roles?: string[];
      }[];
      return (rows ?? [])
        .filter((row) => Array.isArray(row.roles) && row.roles.includes("admin"))
        .map((row) => ({
          id: String(row.id),
          name: row.name?.trim() || String(row.id).slice(0, 8),
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "pt"));
    },
    staleTime: 60_000,
  });
};
