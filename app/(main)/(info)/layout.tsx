import Footer from "@/_components/Footer";
import SearchHeader from "../search/_components/Header";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getFetchApiForSession } from "@/_services/apiServer";
import { getAttributesQueryFn } from "@/_models/search";

export default async function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const queryClient = new QueryClient();
  const fetchApi = getFetchApiForSession(null);
  const attributesQueryFn = getAttributesQueryFn(fetchApi);

  try {
    await queryClient.prefetchQuery({
      queryKey: ["search-attributes"],
      queryFn: () => attributesQueryFn(),
    });
  } catch {
    // API may be unavailable during build or cold start
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <SearchHeader />
      {children}
      <Footer />
    </HydrationBoundary>
  );
}
