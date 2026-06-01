"use client";

import Stack from "@/_design_system/Stack";
import { createBEMClasses } from "@/_utils/classname";
import { CSSProperties, Ref, useEffect, useState } from "react";
import { BookingLarge, BookingSmall, Statistics } from "./AppSnippets";
import BecomeHostButton from "../BecomeHostButton";
import ScheduleDemoButton from "../ScheduleDemoButton";

const { block, element } = createBEMClasses("help-host-intro");

const Intro = ({ ref }: { ref?: Ref<HTMLDivElement> }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setWidth(window.innerWidth);
  }, []);

  return (
    <div className={block()} style={{ "--dvw": width } as CSSProperties}>
      <div className={element("main")}>
        <Stack gap="2.5rem">
          <Stack gap="1rem">
            <h1>A revolução no mundo dos eventos</h1>
            <h2>
              Uma plataforma GRATUITA dedicada à marcação e gestão de eventos
            </h2>
            <p>
              Permita que os nossos clientes descubram o seu espaço e aumente a
              sua rentabilidade. Registe-se hoje e mostre o seu espaço a
              milhares de pessoas que procuram o local perfeito para realizar o
              seu próximo evento.
            </p>
          </Stack>
          <div className={element("actions")} ref={ref}>
            <BecomeHostButton />
            <ScheduleDemoButton />
          </div>
        </Stack>
        <div className={element("image")} />
      </div>
      <div className={element("rectange")} />
      <div className={element("ellipse")} />
      <div className={element("app")}>
        <div className={element("app__content")}>
          <BookingSmall />
          <Stack row gap="5rem" alignItems="flex-start">
            <BookingLarge />
            <Statistics />
          </Stack>
        </div>
      </div>
    </div>
  );
};

export default Intro;
