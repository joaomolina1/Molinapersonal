"use client";

import { createBEMClasses } from "@/_utils/classname";
import { SubscriptionsList } from "../useSubscriptionsList";
import InputText from "@/_design_system/InputText";
import IconUserInterfaceActionsSearch from "@/_design_system/_icons/UserInterface/Actions/Search.svg";
import InputSelect from "@/_design_system/InputSelect";
import Stack from "@/_design_system/Stack";

const { block } = createBEMClasses("admin-subscriptions-header");

const SubscriptionsHeader = ({
  subscriptionsList,
}: {
  subscriptionsList: SubscriptionsList;
}) => {
  return (
    <Stack row gap="1rem" className={block()}>
      <InputText
        value={subscriptionsList.query}
        onChange={subscriptionsList.setQuery}
        label="Pesquisa"
        leftIcon={<IconUserInterfaceActionsSearch />}
      />
      <InputSelect
        value={subscriptionsList.plan}
        onChange={subscriptionsList.setPlan}
        label="Plano"
        options={[...subscriptionsList.planOptions]}
      />
      <InputSelect
        value={subscriptionsList.status}
        onChange={subscriptionsList.setStatus}
        label="Estado"
        options={[...subscriptionsList.statusOptions]}
      />
    </Stack>
  );
};

export default SubscriptionsHeader;
