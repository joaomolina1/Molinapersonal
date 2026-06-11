"use client";

import { IconButton } from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import Tag from "@/_design_system/Tag";
import IconUserInterfaceMiscellaneousQuote from "@/_design_system/_icons/UserInterface/Miscellaneous/Quote.svg";
import IconUserInterfaceMiscellaneousRating from "@/_design_system/_icons/UserInterface/Miscellaneous/Rating.svg";
import IconUserInterfaceNavigationArrowLeft from "@/_design_system/_icons/UserInterface/Navigation/ArrowLeft.svg";
import IconUserInterfaceNavigationArrowRight from "@/_design_system/_icons/UserInterface/Navigation/ArrowRight.svg";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { useState } from "react";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/_services/sentry";
import { Testimonial, usePublicTestimonials } from "@/_models/testimonial";

const { block, element } = createBEMClasses("home-testimonials");

const Testimonials = () => {
  const isMobile = useMediaQuery("large");
  const title = "Os nossos utilizadores têm algo a partilhar";

  const { data } = usePublicTestimonials();
  const testimonials =
    data && data.length > 0 ? data : FALLBACK_TESTIMONIALS;

  const ratings = testimonials
    .map((testimonial) => testimonial.rating)
    .filter((rating): rating is number => rating != null);
  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : null;

  const [selected, setSelected] = useState(0);
  const previous = selected === 0 ? testimonials.length - 1 : selected - 1;
  const beforePrevious =
    previous === 0 ? testimonials.length - 1 : previous - 1;
  const next = selected === testimonials.length - 1 ? 0 : selected + 1;
  const afterNext = next === testimonials.length - 1 ? 0 : next + 1;

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
        {averageRating !== null && (
          <Stack
            row
            gap="0.375rem"
            alignItems="center"
            justifyContent="center"
            className={element("summary")}
          >
            <IconUserInterfaceMiscellaneousRating />
            <span className={element("summary__average")}>
              {averageRating.toLocaleString("pt-PT", {
                minimumFractionDigits: 1,
                maximumFractionDigits: 1,
              })}
            </span>
            <span className={element("summary__count")}>
              · {ratings.length}{" "}
              {ratings.length === 1 ? "avaliação" : "avaliações"}
            </span>
          </Stack>
        )}
        <div className={element("carousel")}>
          <div className={element("carousel__frame")}>
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.id ?? index}
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
                <TestimonialCard testimonial={testimonial} />
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

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
  <Stack gap="1rem" className={element("testimonial")}>
    <Stack gap="0.5rem">
      <Stack row justifyContent="space-between" alignItems="center">
        <IconUserInterfaceMiscellaneousQuote />
        {testimonial.rating != null && (
          <span
            className={element("testimonial__rating")}
            aria-label={`${testimonial.rating} em 5 estrelas`}
          >
            {"★".repeat(testimonial.rating)}
            {"☆".repeat(5 - testimonial.rating)}
          </span>
        )}
      </Stack>
      <p className={element("testimonial__text")}>{testimonial.text}</p>
    </Stack>
    <hr />
    <Stack row gap="0.75rem" alignItems="center">
      <span className={element("testimonial__avatar")} aria-hidden>
        {testimonial.initials}
      </span>
      <Stack gap="0.125rem" className={element("testimonial__author")}>
        <p className={element("testimonial__author__name")}>
          {testimonial.authorName}
        </p>
        {testimonial.authorDetail && (
          <p className={element("testimonial__author__detail")}>
            {testimonial.authorDetail}
          </p>
        )}
      </Stack>
      {testimonial.source === "google" && (
        <Tag size="small" text="Google" type="info" />
      )}
    </Stack>
  </Stack>
);

const FALLBACK_TESTIMONIALS = [
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
].map(
  (testimonial, index) =>
    new Testimonial({
      id: `fallback-${index}`,
      authorName: testimonial.author,
      authorDetail: null,
      text: testimonial.text,
      rating: 5,
      source: "manual",
      photoURL: null,
      published: true,
      priority: 0,
    }),
);

export default Testimonials;
