import CommonSearches from "@/(main)/_components/CommonSearches";
import EventGuide from "@/(main)/_components/EventGuide";
import HeroBanner from "@/(main)/_components/HeroBanner";
import HomeLayout from "@/(main)/_components/HomeLayout";
import HomeQuoteRequestBanner from "@/(main)/_components/HomeQuoteRequestBanner";
import Recommendations from "@/(main)/_components/Recommendations";
import Testimonials from "@/(main)/_components/Testimonials";
import Footer from "@/_components/Footer";
import { getAttributesQueryFn } from "@/_models/search";
import { getFetchApiForSession } from "@/_services/apiServer";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { Metadata } from "next";
import {
  BANNER_TYPES_FOR_LANDING_EVENTS,
  HERO_WORDING,
  LANDING_EVENT_TYPES,
  LandingEventType,
  TITLE_WORDING,
} from "./wordings";

type Props = {
  params: Promise<{ eventType: LandingEventType }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const eventType = params.eventType;
  const eventTypeName = TITLE_WORDING[eventType];

  return {
    title: eventTypeName,
    openGraph: {
      title: eventTypeName,
      images: `/landing/${eventType}.jpeg`,
    },
  };
}

export default async function EventTypeLanding(props: Props) {
  const params = await props.params;
  const eventType = params.eventType;

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

  const bannerTypes = BANNER_TYPES_FOR_LANDING_EVENTS[eventType];

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeLayout>
        <HeroBanner
          title={["Encontre o lugar perfeito", HERO_WORDING[eventType]]}
          subtitle="Temos vários espaços à sua espera"
          backgroundUrl={`/landing/${eventType}.jpeg`}
          defaultEventType={eventType}
        />
        {!!bannerTypes && <HomeQuoteRequestBanner types={bannerTypes} />}
        <Recommendations defaultEventType={eventType} />
        <CommonSearches eventType={eventType} />
        <EventGuide eventType={eventType} />
        <Testimonials />
        <Footer />
      </HomeLayout>
    </HydrationBoundary>
  );
}

export function generateStaticParams() {
  return LANDING_EVENT_TYPES.map((eventType) => ({ eventType }));
}
