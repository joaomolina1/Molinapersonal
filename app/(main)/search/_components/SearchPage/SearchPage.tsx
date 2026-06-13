"use client";

import { createBEMClasses } from "@/_utils/classname";
import { ModalSearchMap, SidebarSearchMap } from "../SearchMap";
import SearchResults from "../SearchResults";
import { useMediaQuery } from "@/_utils/mediaQuery";
import SearchTabFilters from "../SearchTabFilters";
import {
  useSearchContext,
  useSearchDateStartEndTooltip,
} from "../../useSearchState";
import HeroSearchMobile from "../HeroSearchMobile";
import { useEffect } from "react";
import { SPACE_EVENT_TYPES_FLAT } from "@/_constants/space/eventTypes";
import Stack from "@/_design_system/Stack";
import KeywordSearch from "../KeywordSearch";
import { ModalSearchFilters } from "../SearchFilters";

const { block, element } = createBEMClasses("search-page");

const SearchPage = () => {
  const isMobile = useMediaQuery("large");
  const showDateStartEndTooltip = useSearchDateStartEndTooltip();
  const search = useSearchContext();

  useEffect(() => {
    const eventTypeLabel = SPACE_EVENT_TYPES_FLAT.find(
      ({ id }) => id === search.eventType,
    )?.label.toLowerCase();
    const city = search.city;
    const noun = search.journey === "services" ? "Serviços" : "Espaços";

    document.title = `${
      city && eventTypeLabel
        ? `${noun} para ${eventTypeLabel} em ${city}`
        : city
          ? `${noun} em ${city}`
          : eventTypeLabel
            ? `${noun} para ${eventTypeLabel}`
            : `${noun} para eventos`
    } | RINU`;

    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        city && eventTypeLabel
          ? `Alugar os melhores espaços para ${eventTypeLabel} em ${city}`
          : city
            ? `Alugar os melhores espaços em ${city}`
            : eventTypeLabel
              ? `Alugar os melhores espaços para ${eventTypeLabel}`
              : `Alugar os melhores espaços para qualquer tipo de evento`,
      );
  }, [search]);

  return (
    <div className={block()}>
      <div className={element("columns")}>
        <div className={element("middle")}>
          {isMobile && (
            <Stack row alignItems="center" gap={isMobile ? "0.5rem" : "1rem"}>
              <HeroSearchMobile
                showDateStartEndTooltip={showDateStartEndTooltip}
              />
              <ModalSearchFilters />
            </Stack>
          )}
          <Stack row alignItems="center" gap="1rem">
            <KeywordSearch />
            {!isMobile && <ModalSearchFilters />}
          </Stack>
          <SearchTabFilters />
          <SearchResults />
        </div>
        {!isMobile && <SidebarSearchMap />}
      </div>
      {isMobile && (
        <div className={element("map")}>
          <ModalSearchMap />
        </div>
      )}
    </div>
  );
};

export default SearchPage;
