"use client";

import SpacePage from "@/_components/SpacePage";
import { useSpace } from "@/_models/space";
import { useVenue } from "@/_models/venue";
import { useSession } from "@/_services/session";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const SearchSpacePage = ({ spaceID }: { spaceID: string }) => {
  const router = useRouter();
  const [session] = useSession();

  const mode = session?.roles.includes("admin") ? "auth" : "public";

  const { data: space, isLoading: isLoadingSpace } = useSpace(spaceID, mode);

  const { data: venue, isLoading: isLoadingVenue } = useVenue(
    space?.venueID,
    mode,
  );

  useEffect(() => {
    if (!(isLoadingSpace || isLoadingVenue) && (!space || !venue)) {
      router.replace("/");
    }
  }, [isLoadingSpace, isLoadingVenue, router, space, venue]);

  if (isLoadingSpace || isLoadingVenue) {
    return null;
  }

  if (!space || !venue) {
    router.replace("/");
    return null;
  }

  return <SpacePage space={space} venue={venue} mode={mode} />;
};

export default SearchSpacePage;
