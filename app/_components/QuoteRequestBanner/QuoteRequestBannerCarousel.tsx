"use client";

import { createBEMClasses } from "@/_utils/classname";
import QuoteRequestBanner from "./QuoteRequestBanner";
import { useEffect, useState } from "react";
import { BannerType } from "./bannerData";

const { block, element } = createBEMClasses("quote-request-banner-carousel");

const QuoteRequestBannerCarousel = ({
  types = ["corporate-event", "birthday", "children-birthday"],
  mode,
}: {
  types?: BannerType[];
  mode?: "home" | "search";
}) => {
  const [indexAndDirection, setIndexAndDirection] = useState({
    index: 0,
    direction: "next" as "next" | "prev",
  });

  useEffect(() => {
    if (types.length <= 1) return;

    const interval = setInterval(() => {
      // It goes forwards then backwards
      setIndexAndDirection(({ index, direction }) => {
        if (index === 0) {
          return { index: 1, direction: "next" };
        } else if (index === types.length - 1) {
          return { index: index - 1, direction: "prev" };
        } else {
          return {
            index: direction === "next" ? index + 1 : index - 1,
            direction,
          };
        }
      });
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [types.length]);

  return (
    <div className={block()}>
      {types.map((type, index) => (
        <div
          key={type}
          className={element("item", {
            visible: indexAndDirection.index === index,
          })}
        >
          <QuoteRequestBanner type={type} mode={mode} />
        </div>
      ))}
    </div>
  );
};

export default QuoteRequestBannerCarousel;
