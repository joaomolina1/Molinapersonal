"use client";

import Tag from "@/_design_system/Tag";
import { createBEMClasses } from "@/_utils/classname";
import { BoardLead, boardLeadSummary, type BoardLeadDrag } from "./types";

const { element } = createBEMClasses("leads-kanban");

const DRAG_TYPE = "application/x-rinu-lead";

export const parseLeadDrag = (raw: string): BoardLeadDrag | null => {
  try {
    return JSON.parse(raw) as BoardLeadDrag;
  } catch {
    return null;
  }
};

export { DRAG_TYPE };

const KanbanCard = ({
  lead,
  onOpen,
}: {
  lead: BoardLead;
  onOpen: () => void;
}) => {
  const summary = boardLeadSummary(lead);
  const isQuote = lead.kind === "quote";

  return (
    <button
      type="button"
      className={element("card", { quote: isQuote, contact: !isQuote })}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData(
          DRAG_TYPE,
          JSON.stringify({
            kind: summary.kind,
            id: summary.id,
            fromStatus: summary.status,
          }),
        );
        e.dataTransfer.effectAllowed = "move";
      }}
      onClick={onOpen}
    >
      <div className={element("card__head")}>
        <Tag
          size="small"
          type={isQuote ? "info" : "neutral"}
          text={isQuote ? "Orçamento" : "Contacto"}
        />
        {summary.qualityScore != null && (
          <span className={element("card__score")}>
            RINU {summary.qualityScore}/5
          </span>
        )}
      </div>
      <p className={element("card__name")}>{summary.name}</p>
      <p className={element("card__meta")}>{summary.subtitle}</p>
      <p className={element("card__phone")}>{summary.phone}</p>
    </button>
  );
};

export default KanbanCard;
