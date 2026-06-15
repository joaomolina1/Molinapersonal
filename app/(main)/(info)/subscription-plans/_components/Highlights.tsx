"use client";

import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { createBEMClasses } from "@/_utils/classname";
import { HIGHLIGHTS } from "./data";

const { element } = createBEMClasses("subscription-plans-page");

const Highlights = () => (
  <section className={element("highlights")}>
    <div className={element("section-content")}>
      <TextBlock
        title="O que ganha com um plano pago"
        body="As vantagens incluídas nos planos Premium e Expert."
      />
      <div className={element("highlights__grid")}>
        {HIGHLIGHTS.map((highlight) => (
          <div className={element("highlight")} key={highlight.title}>
            <div className={element("highlight__icon")}>{highlight.icon}</div>
            <Stack gap="0.25rem">
              <h5>{highlight.title}</h5>
              <p>{highlight.description}</p>
            </Stack>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Highlights;
