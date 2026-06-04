"use client";

import { QuoteStatus } from "@/_constants/quote/statuses";
import { createBEMClasses } from "@/_utils/classname";
import { useShowToast } from "@/_design_system/Toast";
import KanbanCard, { DRAG_TYPE, parseLeadDrag } from "./KanbanCard";
import { useUpdateBoardLeadStatus } from "./useUpdateBoardLeadStatus";
import { BoardLead } from "./types";

const { element } = createBEMClasses("leads-kanban");

const KanbanColumn = ({
  statusId,
  label,
  leads,
  onOpenLead,
}: {
  statusId: QuoteStatus;
  label: string;
  leads: BoardLead[];
  onOpenLead: (lead: BoardLead) => void;
}) => {
  const showToast = useShowToast();
  const updateLeadStatus = useUpdateBoardLeadStatus();

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData(DRAG_TYPE);
    const drag = parseLeadDrag(raw);
    if (!drag || drag.fromStatus === statusId) return;

    try {
      await updateLeadStatus(drag, statusId);
      showToast({ text: "Estado atualizado" });
    } catch {
      showToast({ text: "Não foi possível mover o pedido" });
    }
  };

  return (
    <section
      className={element("column")}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
      }}
      onDrop={handleDrop}
    >
      <header className={element("column__header")}>
        <h3>{label}</h3>
        <span className={element("column__count")}>{leads.length}</span>
      </header>
      <div className={element("column__list")}>
        {leads.map((lead) => (
          <KanbanCard
            key={`${lead.kind}-${lead.data.id}`}
            lead={lead}
            onOpen={() => onOpenLead(lead)}
          />
        ))}
      </div>
    </section>
  );
};

export default KanbanColumn;
