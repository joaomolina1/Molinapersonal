"use client";

import { useState } from "react";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import Button from "@/_design_system/Button";
import IconUserInterfaceActionsAdd from "@/_design_system/_icons/UserInterface/Actions/Add.svg";
import ExtraModal from "./ExtraModal";
import ExtraCard from "./ExtraCard";
import { ExtraDraft, getExtraDraftError } from "./utils";

const Extras = ({
  extras = [],
  setExtras,
  error,
}: {
  extras?: ExtraDraft[];
  setExtras?: (extras: ExtraDraft[]) => void;
  error?: string;
}) => {
  const title = "Quer associar extras a este pack?";
  const subtitle =
    "Se tiver características extra que podem ser adicionadas ao pack, adicione serviços adicionais com o respetivo tipo de cobrança e valores.";

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [extraToEdit, setExtraToEdit] = useState<ExtraDraft>();

  const openCreateModal = () => {
    setExtraToEdit(undefined);
    setIsOpenModal(true);
  };

  const openEditModal = (extra: ExtraDraft) => {
    setExtraToEdit(extra);
    setIsOpenModal(true);
  };

  const closeModal = () => {
    setIsOpenModal(false);
    setExtraToEdit(undefined);
  };

  const saveExtra = (extra: ExtraDraft) => {
    if (extraToEdit) {
      setExtras?.(
        extras.map((item) => (item.id === extraToEdit.id ? extra : item)),
      );
    } else {
      setExtras?.([...extras, extra]);
    }
    closeModal();
  };

  const deleteExtra = (id: string) => {
    setExtras?.(extras.filter((extra) => extra.id !== id));
  };

  return (
    <Stack gap="1.5rem" alignItems="flex-start">
      <div className="hide-desktop-large">
        <TextBlock label={title} body={subtitle} />
      </div>
      <div className="hide-mobile-large">
        <TextBlock subtitle={title} body={subtitle} />
      </div>
      {error && <InputError error={error} />}
      <Stack gap="1rem" alignItems="stretch" style={{ width: "100%" }}>
        {extras.map((extra) => (
          <ExtraCard
            key={extra.id}
            extra={extra}
            onEdit={() => openEditModal(extra)}
            onDelete={() => deleteExtra(extra.id)}
            showError={!!error && !!getExtraDraftError(extra)}
          />
        ))}
      </Stack>
      <Button
        type="secondary"
        leftIcon={<IconUserInterfaceActionsAdd />}
        label="Adicionar extra"
        onClick={openCreateModal}
      />
      <ExtraModal
        key={extraToEdit?.id ?? "new"}
        isOpen={isOpenModal}
        setIsOpen={setIsOpenModal}
        initialExtra={extraToEdit}
        onSave={saveExtra}
        onCancel={closeModal}
      />
    </Stack>
  );
};

export type { ExtraDraft } from "./utils";

export default Extras;

export const getExtrasError = (extras: ExtraDraft[]): string | undefined => {
  if (!extras.length) {
    return undefined;
  }

  const invalidExtra = extras.find((extra) => getExtraDraftError(extra));
  if (invalidExtra) {
    return "Verifique os detalhes de todos os extras";
  }

  return undefined;
};
