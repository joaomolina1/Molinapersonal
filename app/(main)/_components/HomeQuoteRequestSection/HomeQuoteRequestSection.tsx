"use client";

import IconUserInterfaceNavigationArrowRight from "@/_design_system/_icons/UserInterface/Navigation/ArrowRight.svg";
import Button, { StylelessButton } from "@/_design_system/Button";
import TextBlock from "@/_design_system/TextBlock";
import { ErrorBoundary } from "@/_services/sentry";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { useQuoteRequestContext } from "../QuoteRequest";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Stack from "@/_design_system/Stack";

const { block, element } = createBEMClasses("home-quote-request-section");

const HomeQuoteRequestSection = () => {
  const pathname = usePathname();
  const isMobile = useMediaQuery("large");
  const { setQuoteRequestModalData } = useQuoteRequestContext();

  const handleQuoteRequestClick = (image?: string) => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "Standard",
      Rinu_ItemType: image ? "image" : "faces",
      Rinu_eLabel1: image ?? undefined,
    });

    if (!isMobile) {
      setQuoteRequestModalData({
        isOpen: true,
        context: { type: "quote-request" },
      });
    }
  };

  return (
    <ErrorBoundary>
      <div className={block()}>
        <Stack gap="1.5rem" className={element("text-action")}>
          <TextBlock
            microtitle="Diga-nos o que procura"
            title={
              <>
                Temos a{" "}
                <span className={element("title__blue")}>solução certa</span>{" "}
                para o seu evento
              </>
            }
            body={
              isMobile
                ? undefined
                : "Cada evento é único e merece a atenção certa. A nossa equipa está disponível para ouvir as suas ideias, compreender os seus objetivos e sugerir espaços e soluções que façam sentido para si. Em 12h úteis recebe propostas gratuitas e personalizadas, para que possa avançar com confiança e sem complicações."
            }
            className={element("title")}
          />
          <Stack row gap="0.75rem" flexWrap="wrap">
            <Button
              type="primary"
              label="Pedir orçamento"
              rightIcon={<IconUserInterfaceNavigationArrowRight />}
              href={isMobile ? "/quote-request" : undefined}
              onClick={() => handleQuoteRequestClick()}
            />
            <div className={element("ai-planner")}>
              <Button
                type="secondary"
                label="AI Planner"
                href="/builder"
                onClick={() => {
                  sendGAEvent("event", "Rinu_CustomClick", {
                    Rinu_ScreenName: pathname,
                    Rinu_ItemCategory: "Standard",
                    Rinu_ItemType: "event_builder_entry",
                  });
                }}
              />
            </div>
          </Stack>
        </Stack>
        <div className={element("photos")}>
          {IMAGES.map((image) => (
            <StylelessButton
              key={image.id}
              href={isMobile ? "/quote-request" : undefined}
              onClick={() => handleQuoteRequestClick(image.id)}
              className={element("photos__item")}
            >
              <div className={element("photos__item__image")}>
                <div>
                  <Image
                    alt=""
                    src={`/quote-request-banner/${image.id}.webp`}
                    fill
                  />
                </div>
              </div>
              <Stack gap="0.25rem" alignItems="center">
                <p>
                  <span>[</span> {image.role} <span>]</span>
                </p>
                <h4>{image.name}</h4>
              </Stack>
            </StylelessButton>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};

const IMAGES = [
  {
    id: "matilde",
    name: "Matilde",
    role: "Event Manager",
  },
  {
    id: "luisa",
    name: "Luísa",
    role: "Event Manager",
  },
  {
    id: "afonso",
    name: "Afonso",
    role: "Event Manager",
  },
  {
    id: "falcao",
    name: "João",
    role: "Event Expert",
  },
];

export default HomeQuoteRequestSection;
