"use client";

import Stack from "@/_design_system/Stack";
import InputSelect from "@/_design_system/InputSelect";
import {
  Quote,
  useQuotePacks,
  useRemoveQuotePack,
  useUpdateQuoteLead,
  useUpdateQuotePackStatus,
} from "@/_models/quote";
import LeadQualityScoreSelect from "../LeadQualityScoreSelect";
import LeadPacksManager from "../LeadPacksManager";
import { buildQuoteLeadPackContext } from "../leadPackContext";
import { LeadQualityScore } from "@/_constants/lead/qualityScore";
import { QUOTE_STATUSES, QuoteStatus } from "@/_constants/quote/statuses";
import { useEffect, useState } from "react";
import { useShowToast } from "@/_design_system/Toast";
import ValueWithLabel from "@/(host)/_components/ValueWithLabel";

const QuotePacksSection = ({ quote }: { quote: Quote }) => {
  const { data: packs = [], isPending } = useQuotePacks(quote.id);
  const { mutateAsync: removePack, isPending: isRemoving } =
    useRemoveQuotePack();
  const { mutateAsync: updatePackStatus, isPending: isUpdatingPack } =
    useUpdateQuotePackStatus();
  const { mutateAsync: updateLead, isPending: isUpdatingLead } =
    useUpdateQuoteLead();
  const [status, setStatus] = useState<QuoteStatus>(quote.status ?? "new");
  const [qualityScore, setQualityScore] = useState<LeadQualityScore | null>(
    quote.qualityScore ?? null,
  );
  const showToast = useShowToast();

  useEffect(() => {
    setStatus(quote.status ?? "new");
    setQualityScore(quote.qualityScore ?? null);
  }, [quote.status, quote.qualityScore]);

  const handleStatusChange = async (next: QuoteStatus | undefined) => {
    if (!next || next === quote.status) return;
    setStatus(next);
    try {
      await updateLead({ quoteId: quote.id, status: next });
      showToast({ text: "Estado atualizado" });
    } catch {
      setStatus(quote.status);
      showToast({ text: "Não foi possível atualizar o estado" });
    }
  };

  const handleQualityScoreChange = async (next: LeadQualityScore | null) => {
    if (next === quote.qualityScore) return;
    setQualityScore(next);
    try {
      await updateLead({ quoteId: quote.id, qualityScore: next });
      showToast({ text: "Score atualizado" });
    } catch {
      setQualityScore(quote.qualityScore ?? null);
      showToast({ text: "Não foi possível atualizar o score" });
    }
  };

  const handleRemove = async (packId: string) => {
    try {
      await removePack({ quoteId: quote.id, packId });
      showToast({ text: "Pack removido" });
    } catch {
      showToast({ text: "Não foi possível remover o pack" });
    }
  };

  const handleToggleWinner = async (
    packId: string,
    next: "suggested" | "won",
  ) => {
    try {
      await updatePackStatus({ quoteId: quote.id, packId, status: next });
      showToast({
        text: next === "won" ? "Pack marcado como vencedor" : "Marcação removida",
      });
    } catch {
      showToast({ text: "Não foi possível atualizar o pack" });
    }
  };

  return (
    <Stack gap="1rem" alignItems="flex-start">
      <ValueWithLabel
        label="Estado do pedido"
        value={
          <InputSelect
            label="Estado"
            value={status}
            onChange={(v) => handleStatusChange(v as QuoteStatus)}
            options={QUOTE_STATUSES.map((s) => ({
              id: s.id,
              text: s.label,
            }))}
            disabled={isUpdatingLead}
          />
        }
      />

      <LeadQualityScoreSelect
        value={qualityScore}
        onChange={handleQualityScoreChange}
        disabled={isUpdatingLead}
      />

      <LeadPacksManager
        packs={packs}
        isLoading={isPending}
        leadContext={buildQuoteLeadPackContext(quote)}
        isMutating={isRemoving || isUpdatingPack}
        onRemove={handleRemove}
        onToggleWinner={handleToggleWinner}
      />
    </Stack>
  );
};

export default QuotePacksSection;
