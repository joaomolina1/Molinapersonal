import Button from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import Tag from "@/_design_system/Tag";
import { Venue } from "@/_models/venue";
import {
  useBillingPortal,
  useVenueSubscription,
} from "@/_models/subscription";
import { getPlan, PlanId } from "@/_constants/plans";
import { createBEMClasses } from "@/_utils/classname";
import { useState } from "react";
import PlansModal from "./PlansModal";
import FeaturedSpacesModal from "./FeaturedSpacesModal";

const { block, element } = createBEMClasses("subscription-section");

const SubscriptionSection = ({ venue }: { venue: Venue }) => {
  const { data: subscription } = useVenueSubscription(venue.id);
  const { mutateAsync: openPortal, isPending: isPortalPending } =
    useBillingPortal();

  const [isPlansOpen, setIsPlansOpen] = useState(false);
  const [isFeaturedOpen, setIsFeaturedOpen] = useState(false);

  const currentPlanId: PlanId =
    subscription?.isActive && subscription.plan ? subscription.plan : "standard";
  const plan = getPlan(currentPlanId);
  const isActivePaid = !!subscription?.isActive;
  const canUpgrade = !isActivePaid || subscription?.plan === "premium";

  const handlePortal = async () => {
    try {
      const { url } = await openPortal({ venueID: venue.id });
      if (url) window.location.href = url;
    } catch {
      // no-op; surface handled by Stripe portal availability
    }
  };

  return (
    <div className={block()}>
      <Stack
        row
        gap="1rem"
        alignItems="center"
        justifyContent="space-between"
        className={element("header")}
      >
        <Stack row gap="0.75rem" alignItems="center">
          <span className={element("label")}>Subscrição</span>
          <Tag
            size="small"
            type={isActivePaid ? "success" : "neutral"}
            text={plan?.name ?? "Standard"}
          />
          {subscription?.cancelAtPeriodEnd && (
            <Tag size="small" type="warning" text="Cancela no fim do período" />
          )}
        </Stack>

        <Stack row gap="0.5rem" alignItems="center">
          {isActivePaid && (
            <Button
              type="secondary"
              label="Espaços em destaque"
              onClick={() => setIsFeaturedOpen(true)}
            />
          )}
          {canUpgrade && (
            <Button
              type="primary"
              label="Upgrade"
              onClick={() => setIsPlansOpen(true)}
            />
          )}
          {isActivePaid && (
            <Button
              type="link"
              label="Gerir subscrição"
              onClick={handlePortal}
              loading={isPortalPending}
            />
          )}
        </Stack>
      </Stack>

      <PlansModal
        venueID={venue.id}
        currentPlan={currentPlanId}
        isOpen={isPlansOpen}
        setIsOpen={setIsPlansOpen}
      />

      {isActivePaid && subscription && (
        <FeaturedSpacesModal
          venueID={venue.id}
          subscription={subscription}
          isOpen={isFeaturedOpen}
          setIsOpen={setIsFeaturedOpen}
        />
      )}
    </div>
  );
};

export default SubscriptionSection;
