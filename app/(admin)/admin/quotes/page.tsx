"use client";

import Stack from "@/_design_system/Stack";
import LeadsKanbanBoard from "./_components/LeadsKanban";

export default function AdminQuotes() {
  return (
    <Stack gap="2.5rem">
      <Stack gap="0.5rem">
        <h1 style={{ margin: 0 }}>Pedidos</h1>
        <p style={{ margin: 0, color: "var(--color-text-secondary, #5c5c5c)" }}>
          Quadro kanban — orçamentos e contactos no mesmo fluxo.
        </p>
      </Stack>
      <LeadsKanbanBoard />
    </Stack>
  );
}
