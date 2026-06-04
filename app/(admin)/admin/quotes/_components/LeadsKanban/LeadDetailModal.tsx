"use client";

import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import Tag from "@/_design_system/Tag";
import ValueWithLabel from "@/(host)/_components/ValueWithLabel";
import CopyIconButton from "@/_components/CopyIconButton";
import { TextButton } from "@/_design_system/Button";
import { PACK_FEATURES_FLAT } from "@/_constants/pack/features";
import { SPACE_EVENT_TYPES_FLAT } from "@/_constants/space/eventTypes";
import { CONTACT_METHODS } from "@/(main)/_components/QuoteRequest/QuoteRequestForm/QuoteRequestForm";
import { formatMoney } from "@/_utils/number";
import { createBEMClasses } from "@/_utils/classname";
import QuotePacksSection from "../QuotePacksSection";
import ContactPacksSection from "../ContactPacksSection";
import { BoardLead } from "./types";

const { block, element } = createBEMClasses("lead-detail-modal");

const LeadDetailModal = ({
  lead,
  isOpen,
  onOpenChange,
}: {
  lead: BoardLead | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const isQuote = lead?.kind === "quote";

  return (
    <Modal
      isOpen={isOpen && !!lead}
      onOpenChange={onOpenChange}
      width="x-large"
      ariaLabel={isQuote ? "Pedido de orçamento" : "Pedido de contacto"}
      className={block()}
    >
      {!lead ? null : (
      <Stack gap="1.5rem" alignItems="flex-start">
        <Stack row gap="0.75rem" alignItems="center" flexWrap="wrap">
          <Tag
            size="small"
            type={isQuote ? "info" : "neutral"}
            text={isQuote ? "Pedido de orçamento" : "Pedido de contacto"}
          />
          {lead.data.statusWording && (
            <Tag
              size="small"
              type={lead.data.statusWording.tagType}
              text={lead.data.statusWording.label}
            />
          )}
        </Stack>

        {isQuote ? (
          <QuotePacksSection quote={lead.data} />
        ) : (
          <ContactPacksSection contact={lead.data} />
        )}

        <Stack gap="0.75rem" alignItems="flex-start" className={element("fields")}>
          <Stack row gap="0.25rem" alignItems="center">
            <ValueWithLabel label="ID" value={lead.data.id} />
            <CopyIconButton text={lead.data.id} />
          </Stack>
          <ValueWithLabel label="Nome" value={lead.data.name || "—"} />
          <ValueWithLabel label="Email" value={lead.data.email || "—"} />
          <ValueWithLabel
            label="Telefone"
            value={
              lead.data.phone_extension && lead.data.phone_number
                ? `+${lead.data.phone_extension}${lead.data.phone_number}`
                : "—"
            }
          />

          {isQuote ? (
            <>
              <ValueWithLabel
                label="Data do evento"
                value={lead.data.event_date.toString()}
              />
              <ValueWithLabel
                label="Horário"
                value={
                  lead.data.start_at && lead.data.end_at
                    ? `${lead.data.start_at.timeLabel} – ${lead.data.end_at.timeLabel}`
                    : "—"
                }
              />
              <ValueWithLabel
                label="Budget"
                value={formatMoney(lead.data.budget)}
              />
              <ValueWithLabel
                label="Nº de pessoas"
                value={String(lead.data.num_people ?? "—")}
              />
              <ValueWithLabel
                label="Tipo de evento"
                value={
                  SPACE_EVENT_TYPES_FLAT.find(
                    ({ id }) => id === lead.data.event_kind,
                  )?.label ?? "—"
                }
              />
              <ValueWithLabel
                label="Evento empresarial"
                value={lead.data.company_event ? "Sim" : "Não"}
              />
              <ValueWithLabel
                label="Empresa"
                value={lead.data.company_name || "—"}
              />
              <ValueWithLabel
                label="NIF/NIPC"
                value={lead.data.vat_number || "—"}
              />
              <ValueWithLabel label="Zona" value={lead.data.area || "—"} />
              <ValueWithLabel label="País" value={lead.data.country || "—"} />
              <ValueWithLabel
                label="Serviços adicionais"
                value={
                  PACK_FEATURES_FLAT.filter(({ id }) =>
                    lead.data.attributes?.includes(id),
                  )
                    .map(({ label }) => label)
                    .join(", ") || "—"
                }
              />
              <ValueWithLabel
                label="Espaço em contexto"
                value={
                  lead.data.space_id ? (
                    <Stack>
                      <TextButton
                        text="Abrir espaço"
                        href={`/space/${lead.data.space_id}`}
                        target="_blank"
                      />
                      <p>Pack: {lead.data.pack_id || "—"}</p>
                    </Stack>
                  ) : (
                    "—"
                  )
                }
              />
              <div style={{ maxWidth: 600 }}>
                <ValueWithLabel label="Notas" value={lead.data.notes || "—"} />
              </div>
            </>
          ) : (
            <>
              <ValueWithLabel
                label="Método"
                value={
                  CONTACT_METHODS.find((m) => m.id === lead.data.kind)?.label ??
                  "—"
                }
              />
              <div style={{ maxWidth: 600 }}>
                <ValueWithLabel
                  label="Mensagem"
                  value={lead.data.message || "—"}
                />
              </div>
              <ValueWithLabel
                label="Espaço em contexto"
                value={
                  lead.data.space_id ? (
                    <TextButton
                      text={lead.data.space_name || lead.data.space_id}
                      href={`/space/${lead.data.space_id}`}
                      target="_blank"
                    />
                  ) : (
                    "—"
                  )
                }
              />
            </>
          )}
        </Stack>
      </Stack>
      )}
    </Modal>
  );
};

export default LeadDetailModal;
