import { useFetch } from "@/_services/api";
import { FetchApi } from "@/_services/apiServer";
import { isNotNil } from "@/_utils/filter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export class Photo {
  constructor(data: any) {
    Object.assign(this, data);
  }

  id!: string;
  url!: string;
  smallURL?: string;
  mediumURL?: string;
  largeURL?: string;

  get small() {
    return this.smallURL || this.url;
  }

  get medium() {
    return this.mediumURL || this.url;
  }

  get large() {
    return this.largeURL || this.url;
  }
}

export const getPhotoURLs = (
  photos: Photo[],
  size: "small" | "medium" | "large",
) => photos.map((photo) => photo[size]).filter((url) => !!url);

export const useCreatePhoto = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<Photo, unknown, { file: File }>({
    mutationFn: (body) =>
      fetchApi(
        "photos",
        "",
        { method: "POST", body },
        { contentType: "form-data", tokenAuthenticated: true },
      ).then((photo: any) => new Photo(photo)),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
};

export const useDeletePhoto = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, string>({
    mutationFn: (id) => fetchApi("photos", id, { method: "DELETE" }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
};

export const usePhoto = (id?: string | null) => {
  const fetchApi = useFetch();

  return useQuery<Photo>({
    queryKey: ["photos", id],
    queryFn: () =>
      fetchApi("photos", id).then((photo: any) => new Photo(photo)),
    enabled: !!id,
  });
};

export const getPhotosQueryFn = (fetchApi: FetchApi) => (ids?: string[]) =>
  ids?.length
    ? fetchApi("photos", "list", { method: "POST", body: { ids } })
    : [];

export const usePhotosQuery = (ids?: string[]) => {
  const fetchApi = useFetch();
  const queryFn = getPhotosQueryFn(fetchApi);

  return useQuery<any[]>({
    queryKey: ["photos", ids, ids?.length],
    queryFn: () => queryFn(ids),
    enabled: !!ids,
  });
};

export const usePhotos = (ids?: string[]) => {
  const photosQuery = usePhotosQuery(ids);
  const photos = photosQuery.data?.map((photo) => new Photo(photo));

  return {
    ...photosQuery,
    data: ids
      ?.map((id) => photos?.find((photo) => photo.id === id))
      .filter(isNotNil),
  };
};
