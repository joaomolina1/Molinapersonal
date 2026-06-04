"use client";

import { useState } from "react";
import Stack from "@/_design_system/Stack";
import InputText from "@/_design_system/InputText";
import Button, { IconButton } from "@/_design_system/Button";
import Tag from "@/_design_system/Tag";
import { Venue } from "@/_models/venue";
import {
  useAddVenueCollaborator,
  useRemoveVenueCollaborator,
  useVenueCollaborators,
} from "@/_models/venueCollaborators";
import { useShowToast } from "@/_design_system/Toast";
import { createBEMClasses } from "@/_utils/classname";
import IconUserInterfaceActionsClose from "@/_design_system/_icons/UserInterface/Actions/Close.svg";
import { useSession } from "@/_services/session";

const { block, element } = createBEMClasses("venue-collaborators");

const isPaidVenue = (venue: Venue) =>
  venue.subscription === "premium" || venue.subscription === "expert";

const VenueCollaboratorsSection = ({ venue }: { venue: Venue }) => {
  const [session] = useSession();
  const showToast = useShowToast();
  const [email, setEmail] = useState("");

  const isOwner = session?.user_id === venue.ownerID;
  const paid = isPaidVenue(venue);

  const { data: collaborators = [], isPending } = useVenueCollaborators(
    isOwner && paid ? venue.id : undefined,
  );
  const { mutateAsync: addCollaborator, isPending: isAdding } =
    useAddVenueCollaborator();
  const { mutateAsync: removeCollaborator, isPending: isRemoving } =
    useRemoveVenueCollaborator();

  if (!isOwner) return null;

  const handleAdd = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    try {
      await addCollaborator({ venueId: venue.id, email: trimmed });
      setEmail("");
      showToast({ text: "Colaborador adicionado" });
    } catch {
      showToast({
        text: "Não foi possível adicionar. Confirme que o email já tem conta na RINU.",
      });
    }
  };

  const handleRemove = async (userId: string) => {
    try {
      await removeCollaborator({ venueId: venue.id, userId });
      showToast({ text: "Acesso removido" });
    } catch {
      showToast({ text: "Não foi possível remover o colaborador" });
    }
  };

  return (
    <div className={block()}>
      <Stack gap="0.75rem" alignItems="flex-start">
        <Stack row gap="0.5rem" alignItems="center" flexWrap="wrap">
          <strong>Equipa do local</strong>
          {!paid && (
            <Tag
              size="small"
              type="neutral"
              text="Disponível em Premium ou Expert"
            />
          )}
        </Stack>
        <p className={element("hint")}>
          Dê acesso a outros utilizadores RINU para gerir espaços e packs deste
          local. O acesso termina se a subscrição deixar de ser Premium ou Expert.
        </p>

        {paid && (
          <>
            <Stack row gap="0.75rem" alignItems="flex-end" className={element("add")}>
              <InputText
                label="Email do utilizador"
                value={email}
                onChange={setEmail}
                placeholder="utilizador@email.com"
                disabled={isAdding}
              />
              <Button
                type="secondary"
                label="Adicionar"
                onClick={handleAdd}
                disabled={!email.trim() || isAdding}
                loading={isAdding}
              />
            </Stack>

            {isPending && <p>A carregar equipa…</p>}

            {!isPending && collaborators.length === 0 && (
              <p>Nenhum colaborador adicionado.</p>
            )}

            <Stack gap="0.5rem" className={element("list")}>
              {collaborators.map((member) => (
                <div key={member.id} className={element("item")}>
                  <Stack gap="0.15rem" alignItems="flex-start">
                    <span className={element("item__email")}>{member.email}</span>
                    {member.name && (
                      <span className={element("item__name")}>{member.name}</span>
                    )}
                  </Stack>
                  <IconButton
                    ariaLabel="Remover colaborador"
                    icon={<IconUserInterfaceActionsClose />}
                    type="neutral"
                    onClick={() => handleRemove(member.userID)}
                    disabled={isRemoving}
                  />
                </div>
              ))}
            </Stack>
          </>
        )}
      </Stack>
    </div>
  );
};

export default VenueCollaboratorsSection;
