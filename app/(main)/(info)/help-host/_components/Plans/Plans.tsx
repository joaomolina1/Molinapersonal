"use client";

import { useState } from "react";
import Stack from "@/_design_system/Stack";
import Tag from "@/_design_system/Tag";
import IconUserInterfaceActionsCheck from "@/_design_system/_icons/UserInterface/Actions/Check.svg";
import {
  ANNUAL_DISCOUNT_LABEL,
  PLANS,
  Plan,
} from "@/_constants/plans";
import { createBEMClasses } from "@/_utils/classname";
import { formatMoney } from "@/_utils/number";
import BecomeHostButton from "../BecomeHostButton";

const { block, element } = createBEMClasses("help-host-plans");

type Interval = "month" | "year";

const Plans = () => {
  const [interval, setInterval] = useState<Interval>("year");

  return (
    <div className={block()}>
      <Stack gap="2.5rem" className={element("content")}>
        <Stack gap="1rem" className={element("intro")}>
          <h1>Planos de parceria</h1>
          <h6>
            Comece de forma gratuita e evolua quando fizer sentido. Os planos
            Premium e Expert dão-lhe mais leads, comissões reduzidas e destaque
            dos seus espaços nas zonas com maior procura da RINU.
          </h6>

          <div className={element("billing")}>
            <button
              type="button"
              className={element("billing__option", {
                active: interval === "month",
              })}
              onClick={() => setInterval("month")}
            >
              Mensal
            </button>
            <button
              type="button"
              className={element("billing__option", {
                active: interval === "year",
              })}
              onClick={() => setInterval("year")}
            >
              Anual
            </button>
            <Tag size="small" type="success" text={ANNUAL_DISCOUNT_LABEL} />
          </div>
        </Stack>

        <div className={element("grid")}>
          {PLANS.map((plan) => (
            <PlanCard key={plan.id} plan={plan} interval={interval} />
          ))}
        </div>

        <p className={element("footnote")}>
          Os planos Premium e Expert são faturados por venue. Sem fidelização —
          pode mudar ou cancelar a qualquer momento.
        </p>
      </Stack>
    </div>
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
    <div className={element("card", { featured: plan.featured })}>
      {plan.badge && (
        <div className={element("card__ribbon")}>{plan.badge}</div>
      )}

      <Stack gap="0.25rem">
        <h3>{plan.name}</h3>
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
      {plan.note ? (
        <p className={element("card__note")}>{plan.note}</p>
      ) : (
        <p className={element("card__note")}>&nbsp;</p>
      )}

      <div className={element("card__cta")}>
        <BecomeHostButton />
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
    </div>
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
            <em className={element("features__note")}> ({feature.note})</em>
          )}
        </span>
      </li>
    ))}
  </ul>
);

export default Plans;
