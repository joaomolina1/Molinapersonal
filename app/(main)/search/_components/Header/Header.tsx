"use client";

import {
  HeroSearch,
  LiveHeroSearch,
} from "@/(main)/_components/HeroBanner/HeroSearch";
import { PrimaryHeader } from "@/_components/Header";
import Stack from "@/_design_system/Stack";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { useSearchDateStartEndTooltip } from "../../useSearchState";

const SearchHeader = () => {
  return (
    <PrimaryHeader>
      <Suspense fallback={null}>
        <SearchHeaderContent />
      </Suspense>
    </PrimaryHeader>
  );
};

const SearchHeaderContent = () => {
  const isMobile = useMediaQuery("large");

  const pathname = usePathname();
  const showDateStartEndTooltip = useSearchDateStartEndTooltip();

  return (
    <Stack row gap="1.25rem">
      {!isMobile &&
        (pathname === "/search" ? (
          <LiveHeroSearch
            mode="header"
            showDateStartEndTooltip={showDateStartEndTooltip}
          />
        ) : (
          <HeroSearch mode="header" />
        ))}
    </Stack>
  );
};

export default SearchHeader;
