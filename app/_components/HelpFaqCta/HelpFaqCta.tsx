"use client";

import { StylelessButton } from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import IconUserInterfaceNavigationArrowDown from "@/_design_system/_icons/UserInterface/Navigation/ArrowDown.svg";
import IconUserInterfaceNavigationArrowUp from "@/_design_system/_icons/UserInterface/Navigation/ArrowUp.svg";
import { createBEMClasses } from "@/_utils/classname";
import { ReactNode, useCallback, useState } from "react";

export type HelpFaqCtaProps = {
  faqs: {
    question: string;
    answer: ReactNode;
  }[];
  cta: {
    text: string;
    actions: [ReactNode, ReactNode];
  };
};

const { block, element } = createBEMClasses("help-faq-cta");

const HelpFaqCta = ({ faqs, cta }: HelpFaqCtaProps) => {
  return (
    <div className={block()}>
      <div className={element("faqs")}>
        <h1>
          As respostas
          <br />
          às suas dúvidas
        </h1>
        <ul>
          {faqs.map((faq, index) => (
            <Faq key={index} faq={faq} />
          ))}
        </ul>
      </div>
      <div className={element("cta")}>
        <div className={element("cta__image")} />
        <Stack gap="1.5rem" className={element("cta__content")}>
          <Stack gap="1rem">
            <h1>Vamos a isso?</h1>
            <h6>{cta.text}</h6>
          </Stack>
          <div className={element("cta__actions")}>
            {cta.actions[0]}
            {cta.actions[1]}
          </div>
        </Stack>
      </div>
    </div>
  );
};

const Faq = ({ faq }: { faq: HelpFaqCtaProps["faqs"][number] }) => {
  const [expanded, setExpanded] = useState(false);

  const [height, setHeight] = useState(0);

  const ref = useCallback((node: HTMLParagraphElement) => {
    if (node !== null) {
      setHeight(node.scrollHeight);
    }
  }, []);

  return (
    <li>
      <StylelessButton onClick={() => setExpanded(!expanded)}>
        <Stack
          row
          gap="1.5rem"
          alignItems="center"
          justifyContent="space-between"
          className={element("faqs__question")}
        >
          <p>{faq.question}</p>
          {expanded ? (
            <IconUserInterfaceNavigationArrowUp />
          ) : (
            <IconUserInterfaceNavigationArrowDown />
          )}
        </Stack>
        <div
          ref={ref}
          className={element("faqs__answer", { expanded })}
          style={{ maxHeight: expanded ? height : 0 }}
        >
          {faq.answer}
        </div>
      </StylelessButton>
    </li>
  );
};

export default HelpFaqCta;
