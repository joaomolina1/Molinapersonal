import Footer from "@/_components/Footer";
import HeroBanner from "./_components/HeroBanner";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { getAttributesQueryFn, getSearchQueryFn } from "@/_models/search";
import { getFetchApiForSession } from "@/_services/apiServer";
import Recommendations from "./_components/Recommendations";
import Categories from "./_components/Categories";
import EventTypes from "./_components/EventTypes";
import Locations from "./_components/Locations";
import HomeLayout from "./_components/HomeLayout";
import Testimonials from "./_components/Testimonials";
import Partners from "./_components/Partners";
import HomeQuoteRequestBanner from "./_components/HomeQuoteRequestBanner";
import { ErrorBoundary } from "@/_services/sentry";
import HomeQuoteRequestSection from "./_components/HomeQuoteRequestSection";
import Clients from "./_components/Clients";

export default async function Home() {
  const queryClient = new QueryClient();
  const fetchApi = getFetchApiForSession(null);
  const searchQueryFn = getSearchQueryFn(fetchApi, "public");
  const attributesQueryFn = getAttributesQueryFn(fetchApi);

  try {
    await queryClient.fetchQuery({
      queryKey: ["search", "public", { mode: "home", pageSize: 8 }],
      queryFn: () => searchQueryFn({ mode: "home", pageSize: 8 }),
      retry: 3,
    });
  } catch (e: any) {
    console.log(`Error on search ${e}`);
  }

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
      <HomeLayout>
        <ErrorBoundary>
          <HeroBanner
            title={["O seu evento", "num só clique"]}
            backgroundUrl="/hero_background.webp"
          />
        </ErrorBoundary>
        <ErrorBoundary>
          <HomeQuoteRequestBanner />
        </ErrorBoundary>
        <ErrorBoundary>
          <Recommendations />
        </ErrorBoundary>
        <ErrorBoundary>
          <HomeQuoteRequestSection />
        </ErrorBoundary>
        <ErrorBoundary>
          <Clients />
        </ErrorBoundary>
        <ErrorBoundary>
          <EventTypes />
        </ErrorBoundary>
        <ErrorBoundary>
          <Categories />
        </ErrorBoundary>
        <ErrorBoundary>
          <Testimonials />
        </ErrorBoundary>
        <ErrorBoundary>
          <Partners />
        </ErrorBoundary>
        <ErrorBoundary>
          <Locations />
        </ErrorBoundary>
        <ErrorBoundary>
          <Footer />
        </ErrorBoundary>
      </HomeLayout>
    </HydrationBoundary>
  );
}
