"use client";

import HighlightCard from "@/_design_system/HighlightCard";
import TextBlock from "@/_design_system/TextBlock";
import { ErrorBoundary } from "@/_services/sentry";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";

const { block, element } = createBEMClasses("home-locations");

const CITIES_1 = ["Lisboa", "Setúbal"];
const CITIES_2 = ["Porto", "Santarém"];

const Locations = () => {
  const isMobile = useMediaQuery("large");
  const title = "Com opções de norte a sul de Portugal";

  const pathname = usePathname();
  const handleEventLocation = (city: string) => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "Standard",
      Rinu_ItemType: "event_location",
      Rinu_eLabel1: city,
    });
  };

  return (
    <ErrorBoundary>
      <div className={block()}>
        <TextBlock
          microtitle="Localizações"
          subtitle={isMobile ? title : undefined}
          title={isMobile ? undefined : title}
          body="Apresentamos-lhe espaços nos pontos principais de Portugal, para garantir a sua comodidade"
          className={element("title")}
        />
        <div className={element("grid")}>
          {[CITIES_1, CITIES_2].map((column, index) => (
            <div className={element("grid__column", { index })} key={index}>
              {column.map((city) => (
                <div className={element("grid__column__item")} key={city}>
                  <HighlightCard
                    photo={`/cities/${city}.jpeg`}
                    label={city}
                    size={isMobile ? "small" : "large"}
                    href={`/search?city=${city}`}
                    onClick={() => handleEventLocation(city)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Locations;
