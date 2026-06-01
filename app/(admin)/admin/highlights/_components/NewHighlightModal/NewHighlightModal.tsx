import Modal from "@/_design_system/Modal";
import { useCreateHighlight, useUpdateHighlight } from "@/_models/highlight";
import { createBEMClasses } from "@/_utils/classname";
import { HighlightsList, HighlightWithRelations } from "../useHighlightsList";
import Stack from "@/_design_system/Stack";
import InputSelect from "@/_design_system/InputSelect";
import { useState } from "react";
import { HIGHLIGHT_MODES, HighlightMode } from "@/_constants/highlights";
import { CalendarDate } from "@internationalized/date";
import StackHalfHalf from "@/_design_system/StackHalfHalf";
import InputNumber from "@/_design_system/InputNumber";
import InputDate from "@/_design_system/InputDate";
import InputCheckbox from "@/_design_system/InputCheckbox";
import Button from "@/_design_system/Button";
import { useShowToast } from "@/_design_system/Toast";
import { InputError } from "@/_design_system/_utils/InputWrapper";

const { block } = createBEMClasses("new-highlight-modal");

type NewHighlightModalProps = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialHighlight?: HighlightWithRelations;
  modalSpaceOptions: HighlightsList["modalSpaceOptions"];
};

const NewHighlightModal = (props: NewHighlightModalProps) => {
  return (
    <Modal
      isOpen={props.isOpen}
      onOpenChange={props.setIsOpen}
      width="x-large"
      ariaLabel={props.initialHighlight ? "Editar destaque" : "Criar destaque"}
      className={block()}
    >
      <NewHighlightModalContent {...props} />
    </Modal>
  );
};

const NewHighlightModalContent = ({
  setIsOpen,
  initialHighlight,
  modalSpaceOptions,
}: NewHighlightModalProps) => {
  const [spaceID, setSpaceID] = useState<string | undefined>(
    initialHighlight?.spaceID ?? undefined,
  );
  const [mode, setMode] = useState<HighlightMode | undefined>(
    initialHighlight?.mode ?? undefined,
  );
  const [priority, setPriority] = useState<number | undefined>(
    initialHighlight?.priority ?? undefined,
  );
  const [from, setFrom] = useState<CalendarDate | null>(
    initialHighlight?.from ?? null,
  );
  const [to, setTo] = useState<CalendarDate | null>(
    initialHighlight?.to ?? null,
  );
  const [recommended, setRecommended] = useState<boolean>(
    initialHighlight?.recommended ?? false,
  );

  const [showErrors, setShowErrors] = useState(false);

  const {
    mutateAsync: createHighlight,
    isPending: isPendingCreateHighlight,
    isError: isErrorCreateHighlight,
  } = useCreateHighlight();

  const {
    mutateAsync: updateHighlight,
    isPending: isPendingUpdateHighlight,
    isError: isErrorUpdateHighlight,
  } = useUpdateHighlight();

  const showToast = useShowToast();

  const save = async () => {
    setShowErrors(true);

    if (!spaceID || !mode || !priority || !from || !to) {
      return;
    }

    const body = {
      spaceID,
      mode,
      priority,
      from: from.toString(),
      to: to.toString(),
      recommended,
    };

    if (initialHighlight) {
      await updateHighlight({
        id: initialHighlight.id,
        body,
      });
    } else {
      await createHighlight(body);
    }

    setIsOpen(false);
    showToast({
      text: initialHighlight
        ? "Destaque editado com sucesso"
        : "Destaque criado com sucesso",
    });
  };

  return (
    <Stack gap="2.5rem">
      <Stack gap="1rem">
        <InputSelect
          value={spaceID}
          onChange={setSpaceID}
          label="ID do espaço"
          options={modalSpaceOptions}
          invalid={showErrors && !spaceID}
          disabled={!!initialHighlight}
        />
        <StackHalfHalf gap="1rem">
          <InputSelect
            value={mode}
            onChange={setMode}
            label="Zona"
            options={HIGHLIGHT_MODES.map(({ id, label }) => ({
              id,
              text: label,
            }))}
            invalid={showErrors && !mode}
          />
          <InputNumber
            value={priority}
            onChange={setPriority}
            label="Prioridade"
            allowNegative={false}
            decimalScale={0}
            invalid={showErrors && !priority}
          />
        </StackHalfHalf>
        <StackHalfHalf gap="1rem">
          <InputDate
            value={from}
            onChange={setFrom}
            label="Data de início"
            invalid={showErrors && !from}
          />
          <InputDate
            value={to}
            onChange={setTo}
            label="Data de fim"
            invalid={showErrors && !to}
          />
        </StackHalfHalf>
        <StackHalfHalf gap="1rem" rightEmpty>
          <InputCheckbox
            checked={recommended}
            onChange={setRecommended}
            label="Recomendado"
            position="right"
          />
        </StackHalfHalf>
        {showErrors && isErrorCreateHighlight && (
          <InputError error="Ocorreu um erro ao criar o destaque" />
        )}
        {showErrors && isErrorUpdateHighlight && (
          <InputError error="Ocorreu um erro ao editar o destaque" />
        )}
      </Stack>
      <Stack gap="1rem">
        <Button
          type="primary"
          label="Guardar"
          loading={isPendingCreateHighlight || isPendingUpdateHighlight}
          onClick={save}
        />
        <Button
          type="secondary"
          label="Cancelar"
          onClick={() => setIsOpen(false)}
        />
      </Stack>
    </Stack>
  );
};

export default NewHighlightModal;
