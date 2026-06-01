"use client";

import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import Header from "./Header";
import { PropsWithChildren } from "react";

const { block, element } = createBEMClasses("primary-header");

const PrimaryHeader = ({
  logoLink,
  hideDefaultButton,
  hideSession,
  hideDrawer,
  className,
  children,
}: PropsWithChildren<{
  logoLink?: boolean;
  hideDefaultButton?: boolean;
  hideSession?: boolean;
  hideDrawer?: boolean;
  className?: string;
}>) => {
  const isMobile = useMediaQuery("large");

  return (
    <div className={block(undefined, className)}>
      <div className={element("content")}>
        <Header
          variant={isMobile ? "default" : "inverted"}
          logoLink={logoLink}
          hideDefaultButton={hideDefaultButton}
          hideSession={hideSession}
          hideDrawer={hideDrawer}
        >
          {children}
        </Header>
      </div>
    </div>
  );
};

export default PrimaryHeader;
