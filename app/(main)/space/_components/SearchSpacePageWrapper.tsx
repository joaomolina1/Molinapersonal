"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import SearchSpacePage from "./SearchSpacePage";

const SearchSpacePageWrapper = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const spaceID = searchParams.get("spaceID") ?? undefined;

  useEffect(() => {
    if (!spaceID) {
      router.replace("/");
    }
  }, [router, spaceID]);

  if (!spaceID) {
    return null;
  }

  return <SearchSpacePage spaceID={spaceID} />;
};

export default SearchSpacePageWrapper;
