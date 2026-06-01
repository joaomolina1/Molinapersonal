"use client";

import { getEventTypeOptions } from "@/(main)/search/_utils/attributes";
import {
  SPACE_EVENT_TYPES_FLAT,
  SpaceEventType,
} from "@/_constants/space/eventTypes";
import HighlightCard from "@/_design_system/HighlightCard";
import TextBlock from "@/_design_system/TextBlock";
import { useAttributes, useSearch } from "@/_models/search";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
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

  const pathname = usePathname();
  const handleEventTypes = (eventType: string) => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "Standard",
      Rinu_ItemType: "inspiration_event_type",
      Rinu_eLabel1: eventType,
    });
  };

  // TEMP: Remove description to avoir spamming the GET /search endpoint
  const showDescription = false;

  // const [showDescription, setShowDescription] = useState(false);

  // useEffect(() => {
  //   const timeId = setTimeout(() => {
  //     setShowDescription(true);
  //   }, 5000);

  //   return () => {
  //     clearTimeout(timeId);
  //   };
  // }, []);

  return (
    <ErrorBoundary>
      <div className={block()}>
        <div className={element("content")}>
          <TextBlock
            microtitle="Tipos de eventos"
            title={isMobile ? undefined : title}
            subtitle={isMobile ? title : undefined}
            body="Apresentamos-lhe tipos de eventos que respondem às suas necessidades"
            className={element("title")}
          />
          <div className={element("grid")}>
            {MAIN_EVENT_TYPES.map((eventType) => (
              <div key={eventType.id} className={element("grid__item")}>
                <HighlightCard
                  label={eventType.label}
                  description={
                    showDescription ? (
                      <EventTypeDescription id={eventType.id} />
                    ) : null
                  }
                  photo={`/space-event-types/${eventType.id}.jpeg`}
                  href={`/search?eventType=${eventType.id}`}
                  size="small"
                  onClick={() => handleEventTypes(eventType.id)}
                />
              </div>
            ))}
          </div>
          <div className={element("all")}>
            <AnimatedScrollingList
              items={eventTypes.map((eventType) => (
                <AnimatedScrollingListTagButton
                  key={eventType.id}
                  id={eventType.id}
                  text={eventType.text}
                  href={`/search?eventType=${eventType.id}`}
                  onClick={() => handleEventTypes(eventType.id)}
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

const EventTypeDescription = ({ id }: { id: SpaceEventType }) => {
  const { data: _searchResults } = useSearch({ eventType: id });
  const total = _searchResults?.totalResults;

  if (!total) {
    return null;
  }

  return `${total} ${total === 1 ? "espaço" : "espaços"}`;
};

export default EventTypes;
