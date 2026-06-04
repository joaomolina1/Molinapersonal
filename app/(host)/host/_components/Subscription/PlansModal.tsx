import Button from "@/_design_system/Button";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import Tag from "@/_design_system/Tag";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import IconUserInterfaceActionsCheck from "@/_design_system/_icons/UserInterface/Actions/Check.svg";
import {
  ANNUAL_DISCOUNT_LABEL,
  PLANS,
  Plan,
  PlanId,
} from "@/_constants/plans";
import { createBEMClasses } from "@/_utils/classname";
import { formatMoney } from "@/_utils/number";
import { useState } from "react";
import {
  SubscriptionInterval,
  SubscriptionPlan,
  useSubscribeCheckout,
} from "@/_models/subscription";
import SubscriptionCheckoutModal from "./SubscriptionCheckoutModal";

const { block, element } = createBEMClasses("subscription-plans");

const PlansModal = ({
  venueID,
  currentPlan,
  isOpen,
  setIsOpen,
}: {
  venueID: string;
  currentPlan: PlanId;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const [interval, setInterval] = useState<SubscriptionInterval>("year");
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [error, setError] = useState("");

  const {
    mutateAsync: subscribe,
    isPending,
    variables,
  } = useSubscribeCheckout();

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setError("");
    try {
      const { clientSecret } = await subscribe({ venueID, plan, interval });
      setClientSecret(clientSecret);
    } catch {
      setError("Não foi possível iniciar a subscrição. Tente novamente.");
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        ariaLabel="Planos de subscrição"
        width="xx-large"
      >
        <Stack gap="1.5rem" className={block()}>
          <Stack gap="0.5rem">
            <h3>Planos de subscrição</h3>
            <p className={element("lead")}>
              Mais leads, visibilidade e destaque dos seus espaços. Os planos
              Premium e Expert são faturados por venue.
            </p>
          </Stack>

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

          {!!error && <InputError error={error} />}

          <div className={element("grid")}>
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                interval={interval}
                isCurrent={currentPlan === plan.id}
                isLoading={isPending && variables?.plan === plan.id}
                onSubscribe={() =>
                  handleSubscribe(plan.id as SubscriptionPlan)
                }
              />
            ))}
          </div>
        </Stack>
      </Modal>

      {clientSecret && (
        <SubscriptionCheckoutModal
          clientSecret={clientSecret}
          onClose={() => {
            setClientSecret(null);
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
};

const PlanCard = ({
  plan,
  interval,
  isCurrent,
  isLoading,
  onSubscribe,
}: {
  plan: Plan;
  interval: SubscriptionInterval;
  isCurrent: boolean;
  isLoading: boolean;
  onSubscribe: () => void;
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
        <h4>
          {plan.name}
          {!isFree && <span className={element("card__pervenue")}> (por venue)</span>}
        </h4>
        <p className={element("card__subtitle")}>{plan.subtitle}</p>
      </Stack>

      <div className={element("card__price")}>
        {isFree ? (
          "Gratuito"
        ) : (
          <>
            {formatMoney(price ?? 0)}
            <span className={element("card__price__suffix")}>{suffix}</span>
          </>
        )}
      </div>
      {plan.note && <p className={element("card__note")}>{plan.note}</p>}

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

      <div className={element("card__cta")}>
        {isFree ? (
          <Button
            type="secondary"
            label={isCurrent ? "Plano atual" : "Gratuito"}
            disabled
          />
        ) : isCurrent ? (
          <Button type="secondary" label="Plano atual" disabled />
        ) : (
          <Button
            type="primary"
            label={`Subscrever ${plan.name}`}
            onClick={onSubscribe}
            loading={isLoading}
          />
        )}
      </div>
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

export default PlansModal;
