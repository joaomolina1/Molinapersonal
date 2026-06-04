import { useFetch } from "@/_services/api";
import { FetchApi } from "@/_services/apiServer";
import { isNotNil } from "@/_utils/filter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export class Attachment {
  constructor(data: any) {
    Object.assign(this, data);
  }

  id!: string;
  url!: string;
  extension!: string;
  filename!: string;
}

export const useCreateAttachment = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<Attachment, unknown, { file: File }>({
    mutationFn: (body) =>
      fetchApi(
        "attachments",
        "",
        { method: "POST", body },
        { contentType: "form-data", tokenAuthenticated: true },
      ).then((attachment: any) => new Attachment(attachment)),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
    },
  });
};

export const useDeleteAttachment = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, string>({
    mutationFn: (id) => fetchApi("attachments", id, { method: "DELETE" }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments"] });
    },
  });
};

export const useAttachment = (id?: string | null) => {
  const fetchApi = useFetch();

  return useQuery<Attachment>({
    queryKey: ["attachments", id],
    queryFn: () =>
      fetchApi("attachments", id).then(
        (attachment: any) => new Attachment(attachment),
      ),
    enabled: !!id,
  });
};

export const getAttachmentsQueryFn =
  (fetchApi: FetchApi) => (ids?: string[]) =>
    ids?.length
      ? fetchApi("attachments", "list", { method: "POST", body: { ids } })
      : [];

export const useAttachmentsQuery = (ids?: string[]) => {
  const fetchApi = useFetch();
  const queryFn = getAttachmentsQueryFn(fetchApi);

  return useQuery<any[]>({
    queryKey: ["attachments", ids, ids?.length],
    queryFn: () => queryFn(ids),
    enabled: !!ids?.length,
  });
};

export const useAttachments = (ids?: string[]) => {
  const attachmentsQuery = useAttachmentsQuery(ids);
  const attachments = attachmentsQuery.data?.map(
    (attachment) => new Attachment(attachment),
  );

  return {
    ...attachmentsQuery,
    data: ids
      ?.map((id) => attachments?.find((attachment) => attachment.id === id))
      .filter(isNotNil),
  };
};
