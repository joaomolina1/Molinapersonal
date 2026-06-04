"use client";

import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import Button from "@/_design_system/Button";
import { useVenues } from "@/_models/venue";
import EventHubLeads from "./_components/EventHubLeads";
import EmptyState from "@/_components/EmptyState";

export default function EventHubPage() {
  const { data: venues = [], isPending } = useVenues();

  const hasPaidTier = venues.some(
    (v) => v.subscription === "premium" || v.subscription === "expert",
  );

  if (isPending) {
    return <p>A carregar...</p>;
  }

  if (!hasPaidTier) {
    return (
      <Stack gap="1.5rem">
        <TextBlock
          title="Event Hub"
          subtitle="Disponível para fornecedores com plano Premium ou Expert"
        />
        <EmptyState
          text={{
            subtitle: "Atualize a sua subscrição para aceder ao Event Hub",
            body: "No Event Hub pode ver leads de orçamento e de contacto onde os seus packs foram sugeridos pela equipa comercial.",
          }}
        />
        <Button type="primary" label="Ir para o Dashboard" href="/host" />
      </Stack>
    );
  }

  return (
    <Stack gap="1.5rem">
      <TextBlock
        title="Event Hub"
        subtitle="Leads de orçamento e contacto onde os seus packs foram sugeridos"
      />
      <EventHubLeads />
    </Stack>
  );
}
