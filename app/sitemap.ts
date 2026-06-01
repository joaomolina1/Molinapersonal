import { MetadataRoute } from "next";
import { getFetchApiForSession } from "./_services/apiServer";
import { Space } from "./_models/space";
import { LANDING_EVENT_TYPES } from "./(main)/event/[eventType]/wordings";
import { Photo } from "./_models/photo";
import { retry } from "./_utils/retry";
import { getPublishedArticles } from "./(main)/(info)/blog/_data/articles";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fetchApi = getFetchApiForSession(null);
  let allSpaces: Space[] = [];
  let photos: Photo[] = [];

  try {
    allSpaces =
      (await retry(async () => {
        const spaces = await fetchApi("public/spaces").then((data: any[]) =>
          data.map((item) => new Space(item)),
        );
        return spaces.filter(
          (space) => space.status === "active" && space.isVenuesJourney,
        );
      })) ?? [];
    photos = await fetchApi("photos", "list", {
      method: "POST",
      body: { ids: allSpaces?.flatMap((space) => space.photoIDs) },
    }).then((data: any[]) => data.map((item) => new Photo(item)));
  } catch {
    // API unavailable during build; emit static URLs only
  }

  const publishedArticles = getPublishedArticles();

  return [
    { url: `https://rinu.pt` },
    { url: `https://rinu.pt/search` },
    { url: `https://rinu.pt/help-host` },
    { url: `https://rinu.pt/about-us` },
    { url: `https://rinu.pt/help-customer` },
    { url: `https://rinu.pt/contacts` },
    { url: `https://rinu.pt/categories` },
    { url: `https://rinu.pt/blog` },
    ...publishedArticles.map((article) => ({
      url: `https://rinu.pt/blog/${article.slug}`,
      lastModified: article.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...allSpaces
      .filter((space) => space.status === "active")
      .map((space) => ({
        url: `https://rinu.pt/space/${space.id}`,
        images: photos
          .filter((photo) => space.photoIDs.includes(photo.id))
          .map((photo) => photo.medium),
      })),
    ...LANDING_EVENT_TYPES.map((eventType) => ({
      url: `https://rinu.pt/event/${eventType}`,
    })),
  ];
}

// https://github.com/vercel/next.js/discussions/72221
export const dynamic = "force-static";
