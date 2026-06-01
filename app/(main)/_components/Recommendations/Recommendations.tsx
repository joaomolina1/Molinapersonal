"use client";

import SpaceCard from "@/(main)/search/_components/SearchResults/_components/SpaceCard";
import { TabFilterKey, getTabFilters } from "@/(main)/search/_utils/attributes";
import { SpaceEventType } from "@/_constants/space/eventTypes";
import Button from "@/_design_system/Button";
import {
  ScrollableTabsRadioGroup,
  TabsRadioGroup,
} from "@/_design_system/Tabs";
import TextBlock from "@/_design_system/TextBlock";
import { useAttributes, useSearchResults } from "@/_models/search";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { useMemo, useState } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { SearchResult } from "@/_models/search";
import { ErrorBoundary } from "@/_services/sentry";

const { block, element } = createBEMClasses("home-recommendations");

const Recommendations = ({
  defaultEventType,
}: {
  defaultEventType?: SpaceEventType;
}) => {
  const pathname = usePathname();
  const isMobile = useMediaQuery("large");

  const { data: availableAttributes = [] } = useAttributes();
  const tabFilters = getTabFilters(availableAttributes);
  const [tab, setTab] = useState<TabFilterKey>("all");

  const searchParams = useMemo(
    () =>
      defaultEventType
        ? { eventType: defaultEventType }
        : tab === "all"
          ? undefined
          : { attributes: [tab] },
    [defaultEventType, tab],
  );

  const recommendedSpaces = useSearchResults({
    query: { ...searchParams, mode: "home", pageSize: defaultEventType ? 12 : 8 },
    filter: (results) => results?.slice(0, defaultEventType ? 12 : 8),
  });

  const handleIconsMostSearched = (id: TabFilterKey) => {
    setTab(id);
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "Standard",
      Rinu_ItemType: "Icons_most_searched",
      Rinu_eLabel1: id,
    });
  };

  const handleSpacesMostSearched = (searchResult: SearchResult) => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "Standard",
      Rinu_ItemType: "Spaces_most_searched",
      Rinu_eLabel1: searchResult.spaceName,
      Rinu_eLabel2: searchResult.venueName,
      Rinu_eLabel3: searchResult.id,
      Rinu_eLabel4: searchResult.venueID,
    });
  };

  return (
    <ErrorBoundary>
      <div className={block()}>
        <TextBlock
          className={element("title")}
          microtitle={isMobile ? undefined : "Deixe-se guiar"}
          title={isMobile ? undefined : <RecommendationsTitle />}
          subtitle={isMobile ? <RecommendationsTitle /> : undefined}
        />

        {!defaultEventType &&
          (isMobile ? (
            <TabsRadioGroup
              ariaLabel="Filtro de categoria"
              radioGroupName="category-filter"
              options={tabFilters}
              value={tab}
              onChange={setTab}
              className={element("tabs")}
            />
          ) : (
            <ScrollableTabsRadioGroup
              ariaLabel="Filtro de categoria"
              radioGroupName="category-filter"
              options={tabFilters}
              value={tab}
              onChange={handleIconsMostSearched}
              className={element("tabs-scrollable")}
            />
          ))}

        <div className={element("spaces")}>
          {recommendedSpaces?.map((searchResult) => (
            <SpaceCard
              key={searchResult.id}
              searchResult={searchResult}
              onClick={() => handleSpacesMostSearched(searchResult)}
            />
          ))}
        </div>

        {!!defaultEventType && (
          <Button
            type="primary"
            label="Ver todos os espaços"
            href={`/search?eventType=${defaultEventType}`}
            className={element("see-all")}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

const RecommendationsTitle = () => (
  <>
    Veja os <span className={element("title__blue")}>espaços</span> mais
    procurados
  </>
);

export default Recommendations;
