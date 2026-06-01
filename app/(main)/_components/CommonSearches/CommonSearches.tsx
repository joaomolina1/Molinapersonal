"use client";

import { allAttributeFiltersFlat } from "@/(main)/search/_utils/attributes";
import {
  SPACE_EVENT_TYPES_FLAT,
  SpaceEventType,
} from "@/_constants/space/eventTypes";
import TextBlock from "@/_design_system/TextBlock";
import { useAttributes } from "@/_models/search";
import { createBEMClasses } from "@/_utils/classname";
import { isNotNil } from "@/_utils/filter";
import { useMediaQuery } from "@/_utils/mediaQuery";
import AnimatedScrollingList, {
  AnimatedScrollingListTagButton,
} from "../AnimatedScrollingList";

const { block, element } = createBEMClasses("landing-common-searches");

const CommonSearches = ({ eventType }: { eventType: SpaceEventType }) => {
  const isMobile = useMediaQuery("large");
  const title = "Outras pessoas também procuraram";

  const { data: availableAttributes = [] } = useAttributes();

  const availableNonEventTypeAttributes = availableAttributes
    .filter(
      (attribute) =>
        !SPACE_EVENT_TYPES_FLAT.find(
          (spaceEventType) => spaceEventType.id === attribute,
        ),
    )
    .map((attribute) =>
      allAttributeFiltersFlat.find(({ id }) => id === attribute),
    )
    .filter(isNotNil);

  const eventTypeLabel = SPACE_EVENT_TYPES_FLAT.find(
    ({ id }) => id === eventType,
  )!.label;

  return (
    <div className={block()}>
      <div className={element("content")}>
        <TextBlock
          microtitle="Sugestões"
          title={isMobile ? undefined : title}
          subtitle={isMobile ? title : undefined}
          body="Apresentamos-lhe algumas sugestões mais procuradas pelos nossos clientes"
          className={element("title")}
        />
        <div className={element("scroll")}>
          <AnimatedScrollingList
            items={availableNonEventTypeAttributes.map((attribute) => (
              <AnimatedScrollingListTagButton
                key={attribute.id}
                id={attribute.id}
                text={`${eventTypeLabel} com ${attribute.label.toLowerCase()}`}
                href={`/search?eventType=${eventType}&attributes=${attribute.id}`}
              />
            ))}
            nbRows={3}
            gap={16}
          />
        </div>
      </div>
    </div>
  );
};

export default CommonSearches;
