"use client";

import { useState } from "react";
import Stack from "@/_design_system/Stack";
import Tag from "@/_design_system/Tag";
import IconUserInterfaceActionsCheck from "@/_design_system/_icons/UserInterface/Actions/Check.svg";
import { ANNUAL_DISCOUNT_LABEL, PLANS, Plan } from "@/_constants/plans";
import { createBEMClasses } from "@/_utils/classname";
import { formatMoney } from "@/_utils/number";
import BecomeHostButton from "@/(main)/(info)/help-host/_components/BecomeHostButton";
import ScheduleDemoButton from "@/(main)/(info)/help-host/_components/ScheduleDemoButton";

const { element } = createBEMClasses("subscription-plans-page");

type Interval = "month" | "year";

const Pricing = () => {
  const [interval, setInterval] = useState<Interval>("year");

  return (
    <section className={element("pricing")}>
      <div className={element("section-content")}>
        <div className={element("billing")}>
          <div className={element("toggle")} role="group" aria-label="Faturação">
            <button
              type="button"
              className={element("toggle__option", {
                active: interval === "month",
              })}
              onClick={() => setInterval("month")}
            >
              Mensal
            </button>
            <button
              type="button"
              className={element("toggle__option", {
                active: interval === "year",
              })}
              onClick={() => setInterval("year")}
            >
              Anual
            </button>
          </div>
          <Tag size="small" type="success" text={ANNUAL_DISCOUNT_LABEL} />
        </div>

        <div className={element("grid")}>
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} interval={interval} />
          ))}
        </div>

        <p className={element("note")}>
          Os planos Premium e Expert são faturados por venue. Sem fidelização —
          pode mudar de plano ou cancelar a qualquer momento.
        </p>
      </div>
    </section>
  );
};

const PlanCard = ({
  plan,
  interval,
}: {
  plan: Plan;
  interval: Interval;
}) => {
  const isFree = plan.priceMonthly === null;
  const price = interval === "year" ? plan.priceAnnual : plan.priceMonthly;
  const suffix = interval === "year" ? "/ano" : "/mês";

  return (
    <article className={element("card", { featured: plan.featured })}>
      <Stack gap="0.5rem">
        <Stack row gap="0.5rem" alignItems="center" flexWrap="wrap">
          <h3>{plan.name}</h3>
          {!isFree && (
            <span className={element("card__per")}>por venue</span>
          )}
          {plan.badge && (
            <Tag size="small" type="info" text={plan.badge} />
          )}
        </Stack>
        <p className={element("card__subtitle")}>{plan.subtitle}</p>
      </Stack>

      <div className={element("card__price")}>
        {isFree ? (
          "Gratuito"
        ) : (
          <>
            {formatMoney(price ?? 0, { maximumFractionDigits: 0 })}
            <span className={element("card__price__suffix")}>{suffix}</span>
          </>
        )}
      </div>
      {plan.note && <p className={element("card__note")}>{plan.note}</p>}

      <div className={element("card__cta")}>
        {plan.id === "expert" ? <ScheduleDemoButton /> : <BecomeHostButton />}
      </div>

      <FeatureList features={plan.coreFeatures} />

      {plan.extraFeatures.length > 0 && (
        <>
          <hr className={element("card__divider")} />
          {plan.extraFeaturesLabel && (
            <p className={element("card__section-label")}>
              {plan.extraFeaturesLabel}
            </p>
          )}
          <FeatureList features={plan.extraFeatures} />
        </>
      )}
    </article>
  );
};

const FeatureList = ({ features }: { features: Plan["coreFeatures"] }) => (
  <ul className={element("features")}>
    {features.map((feature, index) => (
      <li key={index} className={element("features__item")}>
        <span className={element("features__check")}>
          <IconUserInterfaceActionsCheck />
        </span>
        <span>
          {feature.label}
          {feature.note && (
            <span className={element("features__note")}> ({feature.note})</span>
          )}
        </span>
      </li>
    ))}
  </ul>
);

export default Pricing;
