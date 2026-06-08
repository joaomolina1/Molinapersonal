"use client";

import { useMemo } from "react";
import Stack from "@/_design_system/Stack";
import EmptyState from "@/_components/EmptyState";
import { QUOTE_STATUS_BUCKETS } from "@/_constants/quote/statuses";
import { QuoteStatus } from "@/_constants/quote/statuses";
import { createBEMClasses } from "@/_utils/classname";
import KanbanColumn from "./KanbanColumn";
import LeadsBoardToolbar from "./LeadsBoardToolbar";
import { useLeadsBoard } from "./useLeadsBoard";
import { useLeadsBoardFilters } from "./useLeadsBoardFilters";
import { BoardLead } from "./types";

const { block } = createBEMClasses("leads-kanban");

const LeadsKanbanBoard = () => {
  const { query, setQuery, assigned, setAssigned, listParams } =
    useLeadsBoardFilters();
  const { leads, isLoading } = useLeadsBoard(listParams);

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

  const totalVisible = leads.length;

  return (
    <Stack gap="1.5rem" className={block()}>
      <LeadsBoardToolbar
        query={query}
        onQueryChange={setQuery}
        assigned={assigned}
        onAssignedChange={setAssigned}
      />

      <p className={`${block()}__hint`}>
        Arraste os cartões entre colunas para atualizar o estado. Clique num
        cartão para abrir a página do pedido.{" "}
        {totalVisible > 0 && (
          <span>
            A mostrar <strong>{totalVisible}</strong> pedido(s).
          </span>
        )}
      </p>

      {isLoading && !leads.length && <p>A carregar pedidos…</p>}

      {!isLoading && !leads.length && (
        <EmptyState
          text={{
            body: "Nenhum pedido corresponde à pesquisa ou filtro",
          }}
        />
      )}

      {!!leads.length && (
        <div className={`${block()}__board`}>
          {QUOTE_STATUS_BUCKETS.map((bucket) => (
            <KanbanColumn
              key={bucket.id}
              statusId={bucket.id}
              label={bucket.label}
              leads={byStatus[bucket.id]}
            />
          ))}
        </div>
      )}
    </Stack>
  );
};

export default LeadsKanbanBoard;
