"use client";

import { getEventTypeOptions } from "@/(main)/search/_utils/attributes";
import {
  SPACE_EVENT_TYPES_FLAT,
  SpaceEventType,
} from "@/_constants/space/eventTypes";
import SpaceCard from "@/(main)/search/_components/SearchResults/_components/SpaceCard";
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
import AnimatedScrollingList, {
  AnimatedScrollingListTagButton,
} from "../AnimatedScrollingList";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/_services/sentry";

const { block, element } = createBEMClasses("home-event-types");

const MAIN_EVENT_TYPES = (
  [
    "corporate-event",
    "birthday",
    "conference",
    "photo-session",
    "gastronomic-experience",
  ] satisfies SpaceEventType[]
).map((id) => SPACE_EVENT_TYPES_FLAT.find((eventType) => eventType.id === id)!);

const EventTypes = () => {
  const isMobile = useMediaQuery("large");
  const title = "Ajudamos a inspirar-se...";

  const { data: availableAttributes = [] } = useAttributes();
  const eventTypes = getEventTypeOptions(availableAttributes);

  const [eventType, setEventType] = useState<SpaceEventType>(
    MAIN_EVENT_TYPES[0].id,
  );

  const spaces = useSearchResults({
    query: { eventType, mode: "home", pageSize: 8 },
    filter: (results) => results?.slice(0, 8),
  });

  const pathname = usePathname();
  const handleEventTypes = (selectedEventType: string) => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "Standard",
      Rinu_ItemType: "inspiration_event_type",
      Rinu_eLabel1: selectedEventType,
    });
  };

  const handleTabChange = (selectedEventType: SpaceEventType) => {
    setEventType(selectedEventType);
    handleEventTypes(selectedEventType);
  };

  const handleSpaceClick = (searchResult: SearchResult) => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "Standard",
      Rinu_ItemType: "inspiration_space",
      Rinu_eLabel1: searchResult.spaceName,
      Rinu_eLabel2: searchResult.venueName,
      Rinu_eLabel3: searchResult.id,
      Rinu_eLabel4: searchResult.venueID,
    });
  };

  const tabOptions = MAIN_EVENT_TYPES.map(({ id, label, icon }) => ({
    id,
    label,
    icon,
  }));

  return (
    <ErrorBoundary>
      <div className={block()}>
        <div className={element("content")}>
          <TextBlock
            microtitle="Tipos de eventos"
            title={isMobile ? undefined : title}
            subtitle={isMobile ? title : undefined}
            body="Espaços em destaque para os tipos de eventos mais procurados"
            className={element("title")}
          />
          {isMobile ? (
            <TabsRadioGroup
              ariaLabel="Tipo de evento"
              radioGroupName="inspiration-event-type"
              options={tabOptions}
              value={eventType}
              onChange={handleTabChange}
              className={element("tabs")}
            />
          ) : (
            <ScrollableTabsRadioGroup
              ariaLabel="Tipo de evento"
              radioGroupName="inspiration-event-type"
              options={tabOptions}
              value={eventType}
              onChange={handleTabChange}
              className={element("tabs-scrollable")}
            />
          )}
          <div className={element("spaces")}>
            {spaces?.map((searchResult) => (
              <SpaceCard
                key={searchResult.id}
                searchResult={searchResult}
                onClick={() => handleSpaceClick(searchResult)}
              />
            ))}
          </div>
          <Button
            type="primary"
            label="Ver todos os espaços"
            href={`/search?eventType=${eventType}`}
            className={element("see-all")}
            onClick={() => handleEventTypes(eventType)}
          />
          <div className={element("all")}>
            <AnimatedScrollingList
              items={eventTypes.map((option) => (
                <AnimatedScrollingListTagButton
                  key={option.id}
                  id={option.id}
                  text={option.text}
                  href={`/search?eventType=${option.id}`}
                  onClick={() => handleEventTypes(option.id)}
                />
              ))}
              nbRows={3}
              gap={16}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default EventTypes;
