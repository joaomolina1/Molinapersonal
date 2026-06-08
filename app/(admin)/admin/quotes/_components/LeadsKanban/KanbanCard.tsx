"use client";

import { useRef } from "react";
import Tag from "@/_design_system/Tag";
import { SPACE_EVENT_TYPES_FLAT } from "@/_constants/space/eventTypes";
import { useAdminAssignees } from "@/_models/adminAssignees";
import { useRouterPush } from "@/_services/navigation";
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

const KanbanCard = ({ lead }: { lead: BoardLead }) => {
  const summary = boardLeadSummary(lead);
  const isQuote = lead.kind === "quote";
  const routerPush = useRouterPush();
  const draggedRef = useRef(false);
  const { data: admins = [] } = useAdminAssignees();
  const adminNames = lead.data.assignedAdminIds
    .map((id) => admins.find((a) => a.id === id)?.name)
    .filter(Boolean) as string[];

  const eventLabel =
    isQuote && lead.data.event_kind
      ? SPACE_EVENT_TYPES_FLAT.find(({ id }) => id === lead.data.event_kind)
          ?.label ?? lead.data.event_kind
      : null;

  const openLead = () => {
    if (draggedRef.current) {
      draggedRef.current = false;
      return;
    }
    routerPush(`/admin/quotes/${lead.kind}/${lead.data.id}`);
  };

  return (
    <button
      type="button"
      className={element("card", { quote: isQuote, contact: !isQuote })}
      draggable
      onDragStart={(e) => {
        draggedRef.current = true;
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
      onDragEnd={() => {
        window.setTimeout(() => {
          draggedRef.current = false;
        }, 0);
      }}
      onClick={openLead}
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
      <p className={element("card__email")}>{summary.email}</p>
      <p className={element("card__phone")}>{summary.phone}</p>
      {eventLabel && (
        <p className={element("card__event")}>{eventLabel}</p>
      )}
      <p className={element("card__meta")}>{summary.subtitle}</p>
      {adminNames.length > 0 && (
        <p className={element("card__assignees")}>
          {adminNames.join(", ")}
        </p>
      )}
    </button>
  );
};

export default KanbanCard;
