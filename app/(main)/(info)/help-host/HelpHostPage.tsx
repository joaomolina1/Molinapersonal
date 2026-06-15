"use client";

import { createBEMClasses } from "@/_utils/classname";
import Partners from "@/(main)/_components/Partners";
import Intro from "./_components/Intro";
import ReasonsWhy from "./_components/ReasonsWhy";
import Steps from "./_components/Steps";
import Plans from "./_components/Plans";
import HelpFaq from "./_components/HelpFaq";
import BecomeHostButton from "./_components/BecomeHostButton";
import { useEffect, useRef, useState } from "react";

const { block, element } = createBEMClasses("help-host-page");

const HelpHostPage = () => {
  const introRef = useRef<HTMLDivElement>(null);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  useEffect(() => {
    if (introRef.current === null) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShowFloatingButton(false);
      } else {
        setShowFloatingButton(true);
      }
    });

    observer.observe(introRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={block()}>
      <Intro ref={introRef} />
      <div className={element("partners")}>
        <Partners />
      </div>
      <ReasonsWhy />
      <Steps />
      <Plans />
      <HelpFaq />
      {showFloatingButton && (
        <div className={element("floating-button")}>
          <BecomeHostButton />
        </div>
      )}
    </div>
  );
};

export default HelpHostPage;
