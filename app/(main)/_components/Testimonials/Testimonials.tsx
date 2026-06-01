"use client";

import { IconButton } from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceMiscellaneousQuote from "@/_design_system/_icons/UserInterface/Miscellaneous/Quote.svg";
import IconUserInterfaceNavigationArrowLeft from "@/_design_system/_icons/UserInterface/Navigation/ArrowLeft.svg";
import IconUserInterfaceNavigationArrowRight from "@/_design_system/_icons/UserInterface/Navigation/ArrowRight.svg";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { useState } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/_services/sentry";

const { block, element } = createBEMClasses("home-testimonials");

const Testimonials = () => {
  const isMobile = useMediaQuery("large");
  const title = "Os nossos utilizadores têm algo a partilhar";

  const [selected, setSelected] = useState(0);
  const previous = selected === 0 ? TESTIMONIALS.length - 1 : selected - 1;
  const beforePrevious =
    previous === 0 ? TESTIMONIALS.length - 1 : previous - 1;
  const next = selected === TESTIMONIALS.length - 1 ? 0 : selected + 1;
  const afterNext = next === TESTIMONIALS.length - 1 ? 0 : next + 1;

  const pathname = usePathname();
  const handleTestimonialScroll = (direction: "left" | "right") => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "Standard",
      Rinu_ItemType: "comment_scroll",
      Rinu_eLabel1: direction,
    });
  };

  return (
    <ErrorBoundary>
      <div className={block()}>
        <TextBlock
          microtitle="Feedback"
          title={isMobile ? undefined : title}
          subtitle={isMobile ? title : undefined}
          className={element("title")}
        />
        <div className={element("carousel")}>
          <div className={element("carousel__frame")}>
            {TESTIMONIALS.map((testimonial, index) => (
              <div
                key={index}
                className={element("carousel__item", {
                  beforePrevious: beforePrevious === index,
                  previous: previous === index,
                  selected: selected === index,
                  next: next === index,
                  afterNext: afterNext === index,
                  hidden:
                    index !== beforePrevious &&
                    index !== previous &&
                    index !== selected &&
                    index !== next &&
                    index !== afterNext,
                })}
              >
                <Stack gap="1rem" className={element("testimonial")}>
                  <Stack gap="0.5rem">
                    <IconUserInterfaceMiscellaneousQuote />
                    <p className={element("testimonial__text")}>
                      {testimonial.text}
                    </p>
                    <IconUserInterfaceMiscellaneousQuote />
                  </Stack>
                  <hr />
                  <p className={element("testimonial__author")}>
                    {testimonial.author}
                  </p>
                </Stack>
              </div>
            ))}
            <IconButton
              icon={<IconUserInterfaceNavigationArrowLeft />}
              onClick={() => {
                setSelected(previous);
                handleTestimonialScroll("left");
              }}
              ariaLabel="Anterior"
              className={element("carousel__arrow", { previous: true })}
              showTooltip={false}
            />
            <IconButton
              icon={<IconUserInterfaceNavigationArrowRight />}
              onClick={() => {
                setSelected(next);
                handleTestimonialScroll("right");
              }}
              ariaLabel="Seguinte"
              className={element("carousel__arrow", { next: true })}
              showTooltip={false}
            />
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

const TESTIMONIALS = [
  {
    author: "Joana Osório",
    text: "Nunca tenho ideias para os meus anos, a RINU ajudou-me a procurar a melhor solução ao melhor preço em passos simples e intuitivos.",
  },
  {
    author: "António M.",
    text: "Tive a ideia de reunir com a minha equipa de trabalho num local diferente. A RINU foi a solução perfeita para marcar a minha sala de reuniões num local inesperado.",
  },
  {
    author: "Maria Miguel",
    text: "Rápido, intuitivo e seguro. Fiz a compra em 6 passos apenas. Fantástico e disruptivo! Que abertura de espírito.",
  },
  {
    author: "Nuno Santos",
    text: "Booking das reservas de espaço. Reservei a minha VENUE de sonho para os meus 40 anos. Obrigado RINU!",
  },
  {
    author: "Helena Martins",
    text: "Vou casar no fim deste ano e o facto de ver a quinta disponível e logo com o preço foi o empurrão que precisei para fazer a reserva pela RINU. Depois da reserva tive um acompanhamento pessoal pela Quinta.",
  },
  {
    author: "João Molina",
    text: "Tinha a expectativa que reservar um espaço para fazer uma reunião era difícil. A RINU mostrou-me que é uma questão de cliques.",
  },
];

export default Testimonials;
