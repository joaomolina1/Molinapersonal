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
import { createBEMClasses } from "@/_utils/classname";

const { block, element } = createBEMClasses("lead-packs-manager");

const MAX_PACKS = 5;

export type LeadPackItem = {
  id: string;
  packID: string;
  packName: string;
  packReference: string;
  spaceName: string;
  venueName: string;
  status: string;
};

const LeadPacksManager = ({
  packs,
  isLoading,
  leadContext,
  isMutating,
  onRemove,
  onToggleWinner,
}: {
  packs: LeadPackItem[];
  isLoading: boolean;
  leadContext: AssociatePackLeadContext;
  isMutating: boolean;
  onRemove: (packId: string) => void;
  onToggleWinner: (packId: string, next: "suggested" | "won") => void;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <Stack gap="0.75rem" alignItems="flex-start" className={block()}>
      <strong>
        Packs associados ({packs.length}/{MAX_PACKS})
      </strong>
      <p className={element("hint")}>
        Marque como vencedor o(s) pack(s) que ganharam a lead. Pode marcar mais
        do que um (fornecedores diferentes na mesma lead).
      </p>

      {isLoading && <p>A carregar packs...</p>}

      {!isLoading && packs.length === 0 && (
        <p>Nenhum pack associado a este pedido.</p>
      )}

      {packs.map((pack) => {
        const isWinner = pack.status === "won";
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
            </Stack>

            <Stack row gap="0.5rem" alignItems="center">
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
              <IconButton
                ariaLabel="Remover pack"
                icon={<IconUserInterfaceActionsClose />}
                type="neutral"
                onClick={() => onRemove(pack.packID)}
                disabled={isMutating}
              />
            </Stack>
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
      />
    </Stack>
  );
};

export default LeadPacksManager;
