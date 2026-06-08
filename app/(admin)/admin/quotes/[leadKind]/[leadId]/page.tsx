"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Stack from "@/_design_system/Stack";
import { TextButton } from "@/_design_system/Button";
import { useContact } from "@/_models/contact";
import { useQuote } from "@/_models/quote";
import LeadDetailView from "../../_components/LeadDetailView";
import { BoardLead } from "../../_components/LeadsKanban/types";
import { createBEMClasses } from "@/_utils/classname";

const { block } = createBEMClasses("lead-detail-page");

export default function LeadDetailPage() {
  const params = useParams();
  const leadKind = params.leadKind === "contact" ? "contact" : "quote";
  const leadId = String(params.leadId ?? "");

  const { data: quote, isPending: quoteLoading } = useQuote(
    leadKind === "quote" ? leadId : undefined,
  );
  const { data: contact, isPending: contactLoading } = useContact(
    leadKind === "contact" ? leadId : undefined,
  );

  const lead = useMemo((): BoardLead | null => {
    if (leadKind === "quote" && quote) return { kind: "quote", data: quote };
    if (leadKind === "contact" && contact) return { kind: "contact", data: contact };
    return null;
  }, [contact, leadKind, quote]);

  const isLoading = leadKind === "quote" ? quoteLoading : contactLoading;

  return (
    <Stack gap="1.5rem" className={block()}>
      <TextButton text="← Voltar ao quadro" href="/admin/quotes" />
      {isLoading && <p>A carregar pedido…</p>}
      {!isLoading && !lead && <p>Pedido não encontrado.</p>}
      {lead && <LeadDetailView lead={lead} />}
    </Stack>
  );
}
