import { getFetchApiForSession } from "@/_services/apiServer";
import SearchSpacePage from "../_components/SearchSpacePage";
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import { Space } from "@/_models/space";
import { Venue } from "@/_models/venue";
import { getPhotosQueryFn, Photo } from "@/_models/photo";
import { Metadata } from "next";
import { retry } from "@/_utils/retry";

type Props = {
  params: Promise<{ spaceID: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const spaceID = params.spaceID;

  const fetchApi = getFetchApiForSession(null);

  let space: Space | undefined = undefined;
  let venue: Venue | undefined = undefined;
  let photo: Photo | undefined = undefined;

  try {
    space = await retry(
      async () => new Space(await fetchApi("public/spaces", spaceID)),
    );
    venue = space
      ? await retry(
          async () =>
            new Venue(await fetchApi("public/venues", space?.venueID)),
        )
      : undefined;
    photo = space
      ? await retry(
          async () => new Photo(await fetchApi("photos", space?.photoIDs[0])),
        )
      : undefined;
  } catch (e) {
    console.log(`Error generating metadata for space page ${spaceID}`, e);
  }

  const title =
    space && venue
      ? `${space?.name} · ${venue?.name} | Disponibilidade e preços`
      : "Espaços para eventos";
  const description =
    space && venue
      ? `${space?.name} · ${venue?.name} | Espaços para alugar em ${venue?.billingCity} | ${venue?.description?.slice(0, 60)}...`
      : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: photo?.large,
    },
  };
}

export default async function SpacePage(props: Props) {
  const params = await props.params;
  const spaceID = params.spaceID;

  const queryClient = new QueryClient();
  const fetchApi = getFetchApiForSession(null);
  const photosQueryFn = getPhotosQueryFn(fetchApi);

  try {
    const space = new Space(
      await queryClient.fetchQuery({
        queryKey: ["public/spaces", spaceID],
        queryFn: () => fetchApi("public/spaces", spaceID),
      }),
    );

    const venue = new Venue(
      await queryClient.fetchQuery({
        queryKey: ["public/venues", space.venueID],
        queryFn: () => fetchApi("public/venues", space.venueID),
      }),
    );

    const photoIds = [...space.allPhotoIDs, ...venue.allPhotoIDs];

    await queryClient.prefetchQuery({
      queryKey: ["photos", photoIds, photoIds?.length],
      queryFn: () => photosQueryFn(photoIds),
    });
  } catch (e) {
    console.log(
      `Error fetching data while pre-rendering space page ${spaceID}`,
      e,
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SearchSpacePage spaceID={spaceID} />
    </HydrationBoundary>
  );
}

export async function generateStaticParams() {
  return [];
}
