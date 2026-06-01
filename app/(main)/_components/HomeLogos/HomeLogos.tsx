"use client";

import TextBlock from "@/_design_system/TextBlock";
import { createBEMClasses } from "@/_utils/classname";
import AnimatedScrollingList from "../AnimatedScrollingList";
import Image from "next/image";

const { block, element } = createBEMClasses("home-logos");

const HomeLogos = ({
  label,
  logos,
}: {
  label: string;
  logos: { src: string; width: number }[];
}) => {
  return (
    <div className={block()}>
      <div className={element("content")}>
        <TextBlock microtitle={label} className={element("title")} />
        <div className={element("logos")}>
          <AnimatedScrollingList
            items={logos.map(({ src, width }) => (
              <div key={src} style={{ width, minWidth: width }}>
                <Image src={src} alt="" width={width} height={40} />
              </div>
            ))}
            nbRows={1}
            gap={56}
          />
        </div>
      </div>
    </div>
  );
};

export default HomeLogos;
