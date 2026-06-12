"use client";

import SpaceCard from "@/(main)/search/_components/SearchResults/_components/SpaceCard";
import { getServiceTabFilters } from "@/(main)/search/_utils/attributes";
import Button from "@/_design_system/Button";
import {
  ScrollableTabsRadioGroup,
  TabsRadioGroup,
} from "@/_design_system/Tabs";
import TextBlock from "@/_design_system/TextBlock";
import {
  SearchResult,
  useAttributes,
  useSearchResults,
} from "@/_models/search";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { useState } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/_services/sentry";

const { block, element } = createBEMClasses("home-services");

const HomeServices = () => {
  const isMobile = useMediaQuery("large");
  const title = "Ajudamos a completar o seu evento...";

  const { data: availableAttributes = [] } = useAttributes();
  const serviceTabs = getServiceTabFilters(availableAttributes);

  const [tab, setTab] = useState<(typeof serviceTabs)[number]["id"]>("all");

  const services = useSearchResults({
    query: {
      journey: "services",
      attributes: tab === "all" ? undefined : [tab],
      mode: "home",
      pageSize: 8,
    },
    filter: (results) => results?.slice(0, 8),
  });

  const pathname = usePathname();
  const handleTabChange = (newTab: (typeof serviceTabs)[number]["id"]) => {
    setTab(newTab);
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "Standard",
      Rinu_ItemType: "home_services_category",
      Rinu_eLabel1: newTab,
    });
  };

  const handleServiceClick = (searchResult: SearchResult) => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "Standard",
      Rinu_ItemType: "home_services_card",
      Rinu_eLabel1: searchResult.spaceName,
      Rinu_eLabel2: searchResult.venueName,
      Rinu_eLabel3: searchResult.id,
      Rinu_eLabel4: searchResult.venueID,
    });
  };

  const seeAllHref =
    tab === "all"
      ? "/search?journey=services"
      : `/search?journey=services&category=${tab}`;

  return (
    <ErrorBoundary>
      <div className={block()}>
        <div className={element("content")}>
          <TextBlock
            microtitle="Serviços"
            title={isMobile ? undefined : title}
            subtitle={isMobile ? title : undefined}
            body="Catering, música, fotografia e muito mais — os serviços certos para o seu evento"
            className={element("title")}
          />
          {isMobile ? (
            <TabsRadioGroup
              ariaLabel="Categoria de serviço"
              radioGroupName="home-services-category"
              options={serviceTabs}
              value={tab}
              onChange={handleTabChange}
              className={element("tabs")}
            />
          ) : (
            <ScrollableTabsRadioGroup
              ariaLabel="Categoria de serviço"
              radioGroupName="home-services-category"
              options={serviceTabs}
              value={tab}
              onChange={handleTabChange}
              className={element("tabs-scrollable")}
            />
          )}
          <div className={element("services")}>
            {services?.map((searchResult) => (
              <SpaceCard
                key={searchResult.id}
                searchResult={searchResult}
                onClick={() => handleServiceClick(searchResult)}
              />
            ))}
          </div>
          <Button
            type="primary"
            label="Ver todos os serviços"
            href={seeAllHref}
            className={element("see-all")}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default HomeServices;
