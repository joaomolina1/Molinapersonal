"use client";

import { useMemo, useState } from "react";
import Stack from "@/_design_system/Stack";
import EmptyState from "@/_components/EmptyState";
import { QUOTE_STATUS_BUCKETS } from "@/_constants/quote/statuses";
import { QuoteStatus } from "@/_constants/quote/statuses";
import { createBEMClasses } from "@/_utils/classname";
import KanbanColumn from "./KanbanColumn";
import LeadDetailModal from "./LeadDetailModal";
import { useLeadsBoard } from "./useLeadsBoard";
import { BoardLead } from "./types";

const { block } = createBEMClasses("leads-kanban");

const LeadsKanbanBoard = () => {
  const { leads, isLoading } = useLeadsBoard();
  const [selectedLead, setSelectedLead] = useState<BoardLead | null>(null);

  const byStatus = useMemo(() => {
    const map = Object.fromEntries(
      QUOTE_STATUS_BUCKETS.map((b) => [b.id, [] as BoardLead[]]),
    ) as Record<QuoteStatus, BoardLead[]>;

    for (const lead of leads) {
      const status = lead.data.status ?? "new";
      if (map[status]) map[status].push(lead);
    }
    return map;
  }, [leads]);

  if (isLoading && !leads.length) {
    return <p>A carregar pedidos…</p>;
  }

  if (!leads.length) {
    return (
      <EmptyState
        text={{
          body: "Nenhum pedido de orçamento ou contacto",
        }}
      />
    );
  }

  return (
    <Stack gap="1.5rem" className={block()}>
      <p className={`${block()}__hint`}>
        Arraste os cartões entre colunas para atualizar o estado. Orçamentos e
        pedidos de contacto partilham o mesmo fluxo — a etiqueta no cartão indica
        o tipo.
      </p>

      <div className={`${block()}__board`}>
        {QUOTE_STATUS_BUCKETS.map((bucket) => (
          <KanbanColumn
            key={bucket.id}
            statusId={bucket.id}
            label={bucket.label}
            leads={byStatus[bucket.id]}
            onOpenLead={setSelectedLead}
          />
        ))}
      </div>

      <LeadDetailModal
        lead={selectedLead}
        isOpen={!!selectedLead}
        onOpenChange={(open) => {
          if (!open) setSelectedLead(null);
        }}
      />
    </Stack>
  );
};

export default LeadsKanbanBoard;
