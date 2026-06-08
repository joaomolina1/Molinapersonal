"use client";

import Stack from "@/_design_system/Stack";
import Button from "@/_design_system/Button";
import Tag from "@/_design_system/Tag";
import { IconButton } from "@/_design_system/Button";
import IconUserInterfaceActionsClose from "@/_design_system/_icons/UserInterface/Actions/Close.svg";
import { useState } from "react";
import AssociatePackModal, {
  AssociatePackLeadContext,
} from "../AssociatePackModal";
import LeadPackExtrasEditor from "../LeadPackExtrasEditor";
import { createBEMClasses } from "@/_utils/classname";
import { ContactPackAssociation } from "@/_models/contact";
import { QuotePackAssociation } from "@/_models/quote";

const { block, element } = createBEMClasses("lead-packs-manager");

const MAX_PACKS = 5;

type LeadPackAssociation = QuotePackAssociation | ContactPackAssociation;

const LeadPacksManager = ({
  packs,
  isLoading,
  leadContext,
  isMutating,
  onRemove,
  onToggleWinner,
}: {
  packs: LeadPackAssociation[];
  isLoading: boolean;
  leadContext: AssociatePackLeadContext;
  isMutating: boolean;
  onRemove: (packId: string) => void;
  onToggleWinner: (packId: string, next: "suggested" | "won") => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedPackId, setExpandedPackId] = useState<string | null>(null);

  return (
    <Stack gap="0.75rem" alignItems="flex-start" className={block()}>
      <strong>
        Packs associados ({packs.length}/{MAX_PACKS})
      </strong>
      <p className={element("hint")}>
        Marque vencedores e configure extras (horas/pax) em cada pack associado.
      </p>

      {isLoading && <p>A carregar packs...</p>}

      {!isLoading && packs.length === 0 && (
        <p>Nenhum pack associado a este pedido.</p>
      )}

      {packs.map((pack) => {
        const isWinner = pack.status === "won";
        const isExpanded = expandedPackId === pack.packID;
        return (
          <div
            key={pack.id}
            className={element("item", { winner: isWinner })}
          >
            <Stack gap="0.25rem" alignItems="flex-start">
              <Stack row gap="0.5rem" alignItems="center" flexWrap="wrap">
                <span className={element("item__name")}>
                  {pack.packName || pack.packReference}
                </span>
                {isWinner && (
                  <Tag size="small" type="success" text="Vencedor" />
                )}
              </Stack>
              <span className={element("item__meta")}>
                {pack.spaceName} · {pack.venueName}
              </span>
              {pack.extraIDs.length > 0 && (
                <span className={element("item__meta")}>
                  {pack.extraIDs.length} extra(s) selecionado(s)
                </span>
              )}
            </Stack>

            <Stack row gap="0.5rem" alignItems="center" flexWrap="wrap">
              <Button
                type={isWinner ? "primary" : "secondary"}
                label={isWinner ? "Vencedor ✓" : "Marcar vencedor"}
                onClick={() =>
                  onToggleWinner(
                    pack.packID,
                    isWinner ? "suggested" : "won",
                  )
                }
                disabled={isMutating}
              />
              <Button
                type="secondary"
                label={isExpanded ? "Ocultar extras" : "Configurar extras"}
                onClick={() =>
                  setExpandedPackId(isExpanded ? null : pack.packID)
                }
              />
              <IconButton
                ariaLabel="Remover pack"
                icon={<IconUserInterfaceActionsClose />}
                type="neutral"
                onClick={() => onRemove(pack.packID)}
                disabled={isMutating}
              />
            </Stack>

            {isExpanded && (
              <LeadPackExtrasEditor
                leadContext={leadContext}
                association={pack}
              />
            )}
          </div>
        );
      })}

      <Button
        type="secondary"
        label="Adicionar pack"
        onClick={() => setIsModalOpen(true)}
        disabled={packs.length >= MAX_PACKS}
      />

      <AssociatePackModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        leadContext={leadContext}
        associatedPackIds={packs.map((p) => p.packID)}
        currentCount={packs.length}
        stacked
      />
    </Stack>
  );
};

export default LeadPacksManager;
