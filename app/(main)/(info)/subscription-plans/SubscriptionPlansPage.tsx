"use client";

import HelpFaqCta from "@/_components/HelpFaqCta";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { createBEMClasses } from "@/_utils/classname";
import BecomeHostButton from "@/(main)/(info)/help-host/_components/BecomeHostButton";
import ScheduleDemoButton from "@/(main)/(info)/help-host/_components/ScheduleDemoButton";
import Pricing from "./_components/Pricing";
import Comparison from "./_components/Comparison";
import Highlights from "./_components/Highlights";
import { PLAN_FAQS } from "./_components/data";

const { block, element } = createBEMClasses("subscription-plans-page");

const SubscriptionPlansPage = () => (
  <div className={block()}>
    <section className={element("hero")}>
      <div className={element("section-content")}>
        <Stack gap="2rem" className={element("hero__content")}>
          <TextBlock
            microtitle="Para parceiros RINU"
            title="Planos de subscrição"
            body="Comece de forma gratuita e evolua quando fizer sentido. Os planos Premium e Expert dão-lhe mais leads, comissões reduzidas e destaque dos seus espaços nas zonas com maior procura."
          />
          <Stack row gap="0.75rem" flexWrap="wrap">
            <BecomeHostButton />
            <ScheduleDemoButton />
          </Stack>
        </Stack>
      </div>
    </section>

    <Pricing />
    <Comparison />
    <Highlights />

    <div className={element("faq")}>
      <div className={element("faq__content")}>
        <HelpFaqCta
          faqs={PLAN_FAQS}
          cta={{
            text: "Registe o seu espaço e escolha o plano ideal no seu painel de parceiro, ou agende uma demonstração para falar connosco.",
            actions: [
              <BecomeHostButton key="host" />,
              <ScheduleDemoButton key="demo" />,
            ],
          }}
        />
      </div>
    </div>
  </div>
);

export default SubscriptionPlansPage;
