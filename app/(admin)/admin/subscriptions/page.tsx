"use client";

import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import EmptyState from "@/_components/EmptyState";
import SubscriptionsHeader from "./_components/SubscriptionsHeader/SubscriptionsHeader";
import { useSubscriptionsList } from "./_components/useSubscriptionsList";
import SubscriptionsTable from "./_components/SubscriptionsTable/SubscriptionsTable";

export default function AdminSubscriptions() {
  const subscriptionsList = useSubscriptionsList();

  return (
    <Stack gap="2.5rem">
      <TextBlock title="Subscrições" />
      <SubscriptionsHeader subscriptionsList={subscriptionsList} />
      {subscriptionsList.subscriptions.length ? (
        <SubscriptionsTable subscriptionsList={subscriptionsList} />
      ) : (
        <EmptyState
          text={{
            body: "Nenhuma subscrição encontrada para os filtros escolhidos",
          }}
        />
      )}
    </Stack>
  );
}
