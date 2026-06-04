"use client";

import Stack from "@/_design_system/Stack";
import Tag from "@/_design_system/Tag";
import InputSelect from "@/_design_system/InputSelect";
import Pagination from "@/_design_system/Pagination";
import ValueWithLabel from "@/(host)/_components/ValueWithLabel";
import IconUserInterfaceNavigationArrowUp from "@/_design_system/_icons/UserInterface/Navigation/ArrowUp.svg";
import IconUserInterfaceNavigationArrowDown from "@/_design_system/_icons/UserInterface/Navigation/ArrowDown.svg";
import { EventHubLead, useEventHubLeads } from "@/_models/eventHub";
import { formatLeadQualityScore } from "@/_constants/lead/qualityScore";
import {
  QUOTE_STATUS_BUCKETS,
  QuoteStatus,
} from "@/_constants/quote/statuses";
import { SPACE_EVENT_TYPES_FLAT } from "@/_constants/space/eventTypes";
import { PACK_FEATURES_FLAT } from "@/_constants/pack/features";
import { CONTACT_METHODS } from "@/(main)/_components/QuoteRequest/QuoteRequestForm/QuoteRequestForm";
import { formatMoney } from "@/_utils/number";
import { useState } from "react";
import { createBEMClasses } from "@/_utils/classname";

const { block, element } = createBEMClasses("event-hub-leads");

const STATUS_FILTER_OPTIONS = [
  { id: "", text: "Todos os estados" },
  ...QUOTE_STATUS_BUCKETS.map((b) => ({ id: b.id, text: b.label })),
];

const OUTCOME_TAG: Record<
  EventHubLead["outcome"],
  { type: "success" | "neutral-2" | "info" } | null
> = {
  won: { type: "success" },
  lost: { type: "neutral-2" },
  pending: null,
};

const EventHubLeads = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const statusQuery = statusFilter ? (statusFilter as QuoteStatus) : undefined;

  const { data, isPending } = useEventHubLeads({ page, status: statusQuery });

  const leads = data?.data ?? [];
  const pageSize = data?.pagination.pageSize ?? 20;
  const totalResults = data?.totalResults ?? 0;
  const numPages = Math.max(1, Math.ceil(totalResults / pageSize));

  const handleStatusChange = (value: string | undefined) => {
    setStatusFilter(value ?? "");
    setPage(1);
    setExpandedKey(null);
  };

  if (isPending && !data) {
    return <p>A carregar leads...</p>;
  }

  return (
    <div className={block()}>
      <Stack gap="1.5rem">
        <InputSelect
          label="Estado"
          value={statusFilter}
          onChange={handleStatusChange}
          options={STATUS_FILTER_OPTIONS}
        />

        {leads.length === 0 ? (
          <p>
            {totalResults === 0 && !statusFilter
              ? "Ainda não existem leads associadas aos packs dos seus espaços Premium ou Expert."
              : "Nenhuma lead encontrada para os filtros selecionados."}
          </p>
        ) : (
          <div className={element("list")}>
            {leads.map((lead) => {
              const key = `${lead.leadType}-${lead.id}`;
              return (
                <LeadRow
                  key={key}
                  lead={lead}
                  expanded={expandedKey === key}
                  onToggle={() =>
                    setExpandedKey(expandedKey === key ? null : key)
                  }
                />
              );
            })}
          </div>
        )}

        {numPages > 1 && (
          <Pagination page={page} setPage={setPage} numPages={numPages} />
        )}
      </Stack>
    </div>
  );
};

const LeadRow = ({
  lead,
  expanded,
  onToggle,
}: {
  lead: EventHubLead;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const typeLabel = lead.isQuote
    ? (SPACE_EVENT_TYPES_FLAT.find(({ id }) => id === lead.eventKind)?.label ??
      "Orçamento")
    : (CONTACT_METHODS.find((m) => m.id === lead.contactMethod)?.label ??
      "Contacto");

  const dateLabel = lead.isQuote
    ? (lead.eventDate?.toString() ?? "Sem data")
    : new Date(lead.createdAt).toLocaleDateString("pt-PT");

  const outcomeTag = OUTCOME_TAG[lead.outcome];

  return (
    <div className={element("row", { expanded })}>
      <button
        type="button"
        className={element("row__header")}
        onClick={onToggle}
        aria-expanded={expanded}
      >
        <Stack gap="0.5rem" alignItems="flex-start">
          <Stack row gap="0.5rem" alignItems="center" flexWrap="wrap">
            <Tag
              size="small"
              text={lead.leadTypeLabel}
              type={lead.isQuote ? "info" : "neutral"}
            />
            <Tag
              size="small"
              text={lead.leadScopeLabel}
              type={lead.leadScope === "exclusive" ? "success" : "neutral-2"}
            />
            {lead.statusWording && (
              <Tag
                size="small"
                text={lead.statusWording.label}
                type={lead.statusWording.tagType}
              />
            )}
            {outcomeTag && (
              <Tag size="small" text={lead.outcomeLabel} type={outcomeTag.type} />
            )}
            <Tag
              size="small"
              type="neutral-2"
              text={`Score RINU: ${formatLeadQualityScore(lead.qualityScore)}`}
            />
          </Stack>
          <Stack row gap="0.75rem" alignItems="center" flexWrap="wrap">
            <span className={element("row__title")}>{typeLabel}</span>
            <span className={element("row__meta")}>{dateLabel}</span>
            {lead.isQuote && lead.numPeople != null && (
              <span className={element("row__meta")}>
                {lead.numPeople} pessoas
              </span>
            )}
            {lead.isQuote && lead.budget != null && (
              <span className={element("row__meta")}>
                {formatMoney(lead.budget, { maximumFractionDigits: 0 })}
              </span>
            )}
          </Stack>
        </Stack>

        <span className={element("row__chevron")}>
          {expanded ? (
            <IconUserInterfaceNavigationArrowUp />
          ) : (
            <IconUserInterfaceNavigationArrowDown />
          )}
        </span>
      </button>

      {expanded && <LeadDetails lead={lead} />}
    </div>
  );
};

const LeadDetails = ({ lead }: { lead: EventHubLead }) => {
  const eventLabel = lead.isQuote
    ? (SPACE_EVENT_TYPES_FLAT.find(({ id }) => id === lead.eventKind)?.label ??
      lead.eventKind ??
      "-")
    : (CONTACT_METHODS.find((m) => m.id === lead.contactMethod)?.label ??
      lead.contactMethod ??
      "-");

  return (
    <div className={element("details")}>
      <div className={element("details__grid")}>
        <ValueWithLabel label="Âmbito" value={lead.leadScopeLabel} />
        <ValueWithLabel label="Resultado" value={lead.outcomeLabel} />
        <ValueWithLabel
          label="Score de qualidade"
          value={formatLeadQualityScore(lead.qualityScore)}
        />
        {lead.isQuote ? (
          <>
            <ValueWithLabel label="Tipo de evento" value={eventLabel || "-"} />
            <ValueWithLabel
              label="Data e hora"
              value={
                lead.eventDate
                  ? `${lead.eventDate.toString()} ${lead.startAt?.timeLabel ?? ""} - ${lead.endAt?.timeLabel ?? ""}`
                  : "-"
              }
            />
            <ValueWithLabel
              label="Nº de pessoas"
              value={String(lead.numPeople || "-")}
            />
            <ValueWithLabel
              label="Budget"
              value={lead.budget != null ? formatMoney(lead.budget) : "-"}
            />
            <ValueWithLabel label="Zona" value={lead.area || "-"} />
          </>
        ) : (
          <ValueWithLabel label="Método de contacto" value={eventLabel} />
        )}
      </div>

      <div className={element("details__section")}>
        <strong>Packs sugeridos</strong>
        <Stack gap="0.375rem" alignItems="flex-start">
          {lead.suggestedPacks.map((pack) => (
            <Stack
              key={pack.packID}
              row
              gap="0.5rem"
              alignItems="center"
              flexWrap="wrap"
            >
              <span>
                {pack.packName} · {pack.spaceName} · {pack.venueName}
              </span>
              {pack.status === "won" && (
                <Tag size="small" type="success" text="Ganhou" />
              )}
            </Stack>
          ))}
        </Stack>
      </div>

      {lead.isQuote && lead.attributes.length > 0 && (
        <ValueWithLabel
          label="Serviços adicionais"
          value={
            PACK_FEATURES_FLAT.filter(({ id }) => lead.attributes.includes(id))
              .map(({ label }) => label)
              .join(", ") || "-"
          }
        />
      )}

      {lead.isQuote
        ? lead.notes && <ValueWithLabel label="Notas" value={lead.notes} />
        : lead.message && (
            <ValueWithLabel label="Mensagem" value={lead.message} />
          )}

      <div className={element("details__section")}>
        <strong>Contacto (mascarado)</strong>
        <div className={element("details__grid")}>
          <ValueWithLabel label="Nome" value={lead.contact.name || "-"} />
          <ValueWithLabel label="Email" value={lead.contact.email || "-"} />
          <ValueWithLabel
            label="Telefone"
            value={
              lead.contact.phoneExtension && lead.contact.phoneNumber
                ? `+${lead.contact.phoneExtension} ${lead.contact.phoneNumber}`
                : "-"
            }
          />
        </div>
      </div>

      {lead.isQuote && lead.companyEvent && (
        <ValueWithLabel label="Empresa" value={lead.companyName || "-"} />
      )}
    </div>
  );
};

export default EventHubLeads;
