"use client";

import {
  GUIDE_CONTENT,
  HERO_WORDING,
  LandingEventType,
} from "@/(main)/event/[eventType]/wordings";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";

const { block, element } = createBEMClasses("home-event-guide");

const EventGuide = ({ eventType }: { eventType: LandingEventType }) => {
  const isMobile = useMediaQuery("large");
  const title = `Guia para encontrar o espaço perfeito ${HERO_WORDING[eventType]}`;

  return (
    <Stack gap="1rem" className={block()}>
      <TextBlock
        className={element("title")}
        title={isMobile ? undefined : title}
        subtitle={isMobile ? title : undefined}
      />
      <Stack gap="1.5rem">
        {!!GUIDE_CONTENT[eventType].intro && (
          <p className={element("intro")}>{GUIDE_CONTENT[eventType].intro}</p>
        )}
        <ul className={element("steps")}>
          {GUIDE_CONTENT[eventType].steps.map((step, index) => (
            <li key={index}>
              <p className={element("step-title")}>
                {index + 1}. {step.title}
              </p>
              <p className={element("step-text")}>{step.text}</p>
            </li>
          ))}
        </ul>
        {!!GUIDE_CONTENT[eventType].goodbye && (
          <p className={element("goodbye")}>
            {GUIDE_CONTENT[eventType].goodbye}
          </p>
        )}
      </Stack>
    </Stack>
  );
};

export default EventGuide;
