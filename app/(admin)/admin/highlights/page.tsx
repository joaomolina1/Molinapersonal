"use client";

import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import EmptyState from "@/_components/EmptyState";
import HighlightsHeader from "./_components/HighlightsHeader";
import { useHighlightsList } from "./_components/useHighlightsList";
import HighlightsTable from "./_components/HighlightsTable";
import Button from "@/_design_system/Button";
import IconUserInterfaceActionsAdd from "@/_design_system/_icons/UserInterface/Actions/Add.svg";
import NewHighlightModal from "./_components/NewHighlightModal";
import { useState } from "react";

export default function AdminHighlights() {
  const highlightsList = useHighlightsList();

  const [isOpenNewHighlightModal, setIsOpenNewHighlightModal] = useState(false);

  return (
    <Stack gap="2.5rem">
      <Stack gap="1rem">
        <Stack
          row
          justifyContent="space-between"
          alignItems="center"
          gap="1rem"
        >
          <TextBlock title="Destaques" />
          <Button
            label="Criar"
            leftIcon={<IconUserInterfaceActionsAdd />}
            type="secondary"
            onClick={() => setIsOpenNewHighlightModal(true)}
          />
          <NewHighlightModal
            isOpen={isOpenNewHighlightModal}
            setIsOpen={setIsOpenNewHighlightModal}
            modalSpaceOptions={highlightsList.modalSpaceOptions.filter(
              (space) => space.status === "active",
            )}
          />
        </Stack>
        <Stack gap="2.5rem">
          <HighlightsHeader highlightsList={highlightsList} />
          {highlightsList.highlights.length ? (
            <HighlightsTable highlightsList={highlightsList} />
          ) : (
            <EmptyState
              text={{
                body: "Nenhum destaque encontrado para os filtros escolhidos",
              }}
            />
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
