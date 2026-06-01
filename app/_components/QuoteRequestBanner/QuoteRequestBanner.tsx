"use client";

import Button from "@/_design_system/Button";
import { createBEMClasses } from "@/_utils/classname";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { CSSProperties } from "react";
import { BANNER_TYPES, BannerType } from "./bannerData";
import { useQuoteRequestContext } from "@/(main)/_components/QuoteRequest";
import { useMediaQuery } from "@/_utils/mediaQuery";
import Image from "next/image";

const { block, element } = createBEMClasses("quote-request-banner");

const QuoteRequestBanner = ({
  type,
  mode = "home",
}: {
  type: BannerType;
  mode?: "home" | "search";
}) => {
  const pathname = usePathname();
  const isMobile = useMediaQuery("large");
  const { setQuoteRequestModalData } = useQuoteRequestContext();

  const handleQuoteRequestClick = () => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "enquire_request",
      Rinu_ItemType: "fixed",
      Rinu_eLabel1: type,
    });

    if (!isMobile) {
      setQuoteRequestModalData({
        isOpen: true,
        context: { type: "quote-request" },
      });
    }
  };

  const bannerData = BANNER_TYPES[type];

  return (
    <div className={block({ mode })}>
      <div
        className={element("content")}
        style={
          {
            backgroundImage: `url("/quote-request-banner/${type}.webp")`,
          } as CSSProperties
        }
      >
        <div className={element("photo")}>
          <div>
            <Image
              alt=""
              src={`/quote-request-banner/${bannerData.photo}`}
              fill
            />
          </div>
        </div>
        <div className={element("text-action")}>
          <div
            className={element("text", { color: bannerData.theme.textColor })}
          >
            <h4>{bannerData.text}</h4>
            <p>Diga-nos o que procura e nós ajudamos</p>
          </div>
          <div className={element("action")}>
            <Button
              type={bannerData.theme.buttonType}
              href={isMobile ? "/quote-request" : undefined}
              label="Receber propostas"
              onClick={handleQuoteRequestClick}
            />
            <span
              className={element("action__text", {
                color: bannerData.theme.textColor,
              })}
            >
              Resposta em 12h úteis
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteRequestBanner;
