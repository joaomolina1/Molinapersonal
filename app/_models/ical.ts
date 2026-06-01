import { IcalImportStatus } from "@/_constants/ical/status";
import { useFetch } from "@/_services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export class SpaceIcals {
  constructor(data: any) {
    Object.assign(this, data);
  }

  exports!: {
    id: string;
    name: string; // ??
    spaceID: string;
    enabled: boolean;
    path: string;
  }[];

  imports!: {
    id: string;
    name: string;
    url: string;
    spaceID: string;
    enabled: boolean;
    lastSync: string | null;
    status: IcalImportStatus; // ??
  }[];
}

export const useSpaceIcals = (
  spaceID: string,
  options?: { refetchInterval?: number; enabled?: boolean },
) => {
  const fetchApi = useFetch();

  return useQuery<SpaceIcals>({
    queryKey: ["ical", spaceID],
    queryFn: () =>
      fetchApi("ical", `space/${spaceID}`).then(
        (icals: any) => new SpaceIcals(icals),
      ),
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled,
  });
};

export const useEnableExportIcal = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<
    void,
    unknown,
    { id: string; spaceID: string; enabled: boolean }
  >({
    mutationFn: ({ id, enabled }) =>
      fetchApi("ical", id, {
        method: "PUT",
        body: {
          enabled,
          kind: "export",
        },
      }),
    onSettled: (_data, _error, { spaceID }) => {
      queryClient.invalidateQueries({ queryKey: ["ical", spaceID] });
    },
  });
};

export const useDeleteImportIcal = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<void, unknown, { id: string; spaceID: string }>({
    mutationFn: ({ id }) => fetchApi("ical", id, { method: "DELETE" }),
    onSettled: (_data, _error, { spaceID }) => {
      queryClient.invalidateQueries({ queryKey: ["ical", spaceID] });
    },
  });
};

type CreateExportIcalBody = {
  space: string;
};

export const useCreateExportIcal = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<void, unknown, CreateExportIcalBody>({
    mutationFn: (body) => fetchApi("ical", "export", { method: "POST", body }),
    onSettled: (_data, _error, { space }) => {
      queryClient.invalidateQueries({ queryKey: ["ical", space] });
    },
  });
};

type CreateImportIcalBody = {
  spaceId: string;
  url: string;
  name: string;
};

export const useCreateImportIcal = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<void, unknown, CreateImportIcalBody>({
    mutationFn: (body) => fetchApi("ical", "import", { method: "POST", body }),
    onSettled: (_data, _error, { spaceId }) => {
      queryClient.invalidateQueries({ queryKey: ["ical", spaceId] });
    },
  });
};

export const useRefreshImportIcals = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<void, unknown, { spaceID: string }>({
    mutationFn: ({ spaceID }) =>
      fetchApi("ical", `space/${spaceID}/refresh`, { method: "POST" }),
    onSettled: (_data, _error, { spaceID }) => {
      queryClient.invalidateQueries({ queryKey: ["ical", spaceID] });
    },
  });
};
