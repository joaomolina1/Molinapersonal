"use client";

import Stack from "@/_design_system/Stack";
import InputSelect from "@/_design_system/InputSelect";
import {
  Contact,
  useContactPacks,
  useRemoveContactPack,
  useUpdateContactLead,
  useUpdateContactPackStatus,
} from "@/_models/contact";
import { QUOTE_STATUSES, QuoteStatus } from "@/_constants/quote/statuses";
import { LeadQualityScore } from "@/_constants/lead/qualityScore";
import { useEffect, useState } from "react";
import LeadQualityScoreSelect from "../LeadQualityScoreSelect";
import LeadPacksManager from "../LeadPacksManager";
import { buildContactLeadPackContext } from "../leadPackContext";
import { useShowToast } from "@/_design_system/Toast";
import ValueWithLabel from "@/(host)/_components/ValueWithLabel";

const ContactPacksSection = ({ contact }: { contact: Contact }) => {
  const { data: packs = [], isPending } = useContactPacks(contact.id);
  const { mutateAsync: removePack, isPending: isRemoving } =
    useRemoveContactPack();
  const { mutateAsync: updatePackStatus, isPending: isUpdatingPack } =
    useUpdateContactPackStatus();
  const { mutateAsync: updateLead, isPending: isUpdatingLead } =
    useUpdateContactLead();
  const [status, setStatus] = useState<QuoteStatus>(contact.status ?? "new");
  const [qualityScore, setQualityScore] = useState<LeadQualityScore | null>(
    contact.qualityScore ?? null,
  );
  const showToast = useShowToast();

  useEffect(() => {
    setStatus(contact.status ?? "new");
    setQualityScore(contact.qualityScore ?? null);
  }, [contact.status, contact.qualityScore]);

  const handleStatusChange = async (next: QuoteStatus | undefined) => {
    if (!next || next === contact.status) return;
    setStatus(next);
    try {
      await updateLead({ contactId: contact.id, status: next });
      showToast({ text: "Estado atualizado" });
    } catch {
      setStatus(contact.status);
      showToast({ text: "Não foi possível atualizar o estado" });
    }
  };

  const handleQualityScoreChange = async (next: LeadQualityScore | null) => {
    if (next === contact.qualityScore) return;
    setQualityScore(next);
    try {
      await updateLead({ contactId: contact.id, qualityScore: next });
      showToast({ text: "Score atualizado" });
    } catch {
      setQualityScore(contact.qualityScore ?? null);
      showToast({ text: "Não foi possível atualizar o score" });
    }
  };

  const handleRemove = async (packId: string) => {
    try {
      await removePack({ contactId: contact.id, packId });
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
      await updatePackStatus({ contactId: contact.id, packId, status: next });
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
        leadContext={buildContactLeadPackContext(contact)}
        isMutating={isRemoving || isUpdatingPack}
        onRemove={handleRemove}
        onToggleWinner={handleToggleWinner}
      />
    </Stack>
  );
};

export default ContactPacksSection;
