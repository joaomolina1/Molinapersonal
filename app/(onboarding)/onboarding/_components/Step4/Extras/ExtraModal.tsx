"use client";

import { useEffect, useState } from "react";
import Button from "@/_design_system/Button";
import InputCheckbox from "@/_design_system/InputCheckbox";
import InputNumber from "@/_design_system/InputNumber";
import InputSelect from "@/_design_system/InputSelect";
import InputText from "@/_design_system/InputText";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import StackHalfHalf from "@/_design_system/StackHalfHalf";
import TextBlock from "@/_design_system/TextBlock";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import ExtraFieldTooltip, {
  EXTRA_DEFAULT_HOUR_TOOLTIP,
  EXTRA_DEFAULT_PAX_TOOLTIP,
} from "@/_components/ExtraFieldTooltip/ExtraFieldTooltip";
import {
  EXTRA_PRICE_TYPES,
  ExtraDraft,
  ExtraPriceType,
  getExtraDraftError,
} from "./utils";
import { createBEMClasses } from "@/_utils/classname";
import { v4 as uuidv4 } from "uuid";

const { element } = createBEMClasses("pack-extras");

const LabelWithTooltip = ({
  label,
  tooltip,
}: {
  label: string;
  tooltip: string;
}) => (
  <Stack row alignItems="center" gap="0.25rem">
    <span className={element("field-label")}>{label}</span>
    <ExtraFieldTooltip content={tooltip} />
  </Stack>
);

export const createEmptyExtra = (): ExtraDraft => ({
  id: uuidv4(),
  type: "fixed",
  mandatory: false,
});

const ExtraModal = ({
  isOpen,
  setIsOpen,
  initialExtra,
  onSave,
  onCancel,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  initialExtra?: ExtraDraft;
  onSave: (extra: ExtraDraft) => void;
  onCancel: () => void;
}) => {
  const [draft, setDraft] = useState<ExtraDraft>(createEmptyExtra());
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!isOpen) return;
    setDraft(initialExtra ? { ...initialExtra } : createEmptyExtra());
    setError(undefined);
  }, [isOpen, initialExtra]);

  const onChangePriceType = (newPriceType: ExtraPriceType) => {
    if (newPriceType === "per-hour") {
      setDraft({
        ...draft,
        type: newPriceType,
        fixedPrice: undefined,
        pricePax: undefined,
      });
    } else if (newPriceType === "per-person") {
      setDraft({
        ...draft,
        type: newPriceType,
        fixedPrice: undefined,
        priceHour: undefined,
      });
    } else if (newPriceType === "per-hour-and-person") {
      setDraft({
        ...draft,
        type: newPriceType,
        fixedPrice: undefined,
      });
    } else {
      setDraft({
        ...draft,
        type: newPriceType,
        priceHour: undefined,
        pricePax: undefined,
      });
    }
  };

  const showHours =
    draft.type === "per-hour" || draft.type === "per-hour-and-person";
  const showPax =
    draft.type === "per-person" || draft.type === "per-hour-and-person";

  const handleSave = () => {
    const validationError = getExtraDraftError(draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    onSave({
      ...draft,
      description: draft.description?.trim(),
      tooltip: draft.tooltip?.trim() || null,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      ariaLabel={initialExtra ? "Editar extra" : "Adicionar extra"}
      width="large"
      mobileHeight="almost-fullscreen"
    >
      <Stack gap="2rem">
        <Stack gap="1.5rem">
          <TextBlock
            subtitle={initialExtra ? "Editar extra" : "Adicionar extra"}
            body="Indique o serviço adicional, o tipo de cobrança e os respetivos valores."
          />
          {error && <InputError error={error} />}
          <InputText
            label="Descrição"
            placeholder="Ex: Wi-Fi dedicado para o evento"
            value={draft.description ?? ""}
            onChange={(value) => setDraft({ ...draft, description: value })}
          />
          <InputText
            label="Tooltip"
            placeholder="Texto de ajuda para o cliente (opcional)"
            value={draft.tooltip ?? ""}
            onChange={(value) => setDraft({ ...draft, tooltip: value || null })}
          />
          <InputSelect
            label="Tipo de cobrança"
            value={draft.type}
            onChange={onChangePriceType}
            options={EXTRA_PRICE_TYPES}
          />

          {draft.type === "fixed" && (
            <InputNumber
              label="Valor fixo"
              measure="€"
              value={draft.fixedPrice}
              onChange={(value) => setDraft({ ...draft, fixedPrice: value })}
              allowNegative={false}
              decimalScale={2}
              placeholder="0"
            />
          )}

          {(draft.type === "per-hour" ||
            draft.type === "per-hour-and-person") && (
            <InputNumber
              label="Valor por hora"
              measure="€/h"
              value={draft.priceHour}
              onChange={(value) => setDraft({ ...draft, priceHour: value })}
              allowNegative={false}
              decimalScale={2}
              placeholder="0"
            />
          )}

          {(draft.type === "per-person" ||
            draft.type === "per-hour-and-person") && (
            <InputNumber
              label="Valor por pessoa"
              measure="€/p"
              value={draft.pricePax}
              onChange={(value) => setDraft({ ...draft, pricePax: value })}
              allowNegative={false}
              decimalScale={2}
              placeholder="0"
            />
          )}

          {(showHours || showPax) && (
            <Stack gap="1rem" className={element("modal-quantity")}>
              {showHours && (
                <Stack gap="0.75rem">
                  <Stack gap="0.25rem">
                    <LabelWithTooltip
                      label="Hora default"
                      tooltip={EXTRA_DEFAULT_HOUR_TOOLTIP}
                    />
                    <InputNumber
                      label="Hora default"
                      showLabel={false}
                      value={draft.defaultHour ?? undefined}
                      onChange={(value) =>
                        setDraft({ ...draft, defaultHour: value ?? null })
                      }
                      measure="h"
                      allowNegative={false}
                      decimalScale={1}
                    />
                  </Stack>
                  <StackHalfHalf>
                    <InputNumber
                      label="Hora min"
                      value={draft.minHour ?? undefined}
                      onChange={(value) =>
                        setDraft({ ...draft, minHour: value ?? null })
                      }
                      measure="h"
                      allowNegative={false}
                      decimalScale={1}
                    />
                    <InputNumber
                      label="Hora max"
                      value={draft.maxHour ?? undefined}
                      onChange={(value) =>
                        setDraft({ ...draft, maxHour: value ?? null })
                      }
                      measure="h"
                      allowNegative={false}
                      decimalScale={1}
                    />
                  </StackHalfHalf>
                </Stack>
              )}

              {showPax && (
                <Stack gap="0.75rem">
                  <Stack gap="0.25rem">
                    <LabelWithTooltip
                      label="Pax default"
                      tooltip={EXTRA_DEFAULT_PAX_TOOLTIP}
                    />
                    <InputNumber
                      label="Pax default"
                      showLabel={false}
                      value={draft.defaultPax ?? undefined}
                      onChange={(value) =>
                        setDraft({ ...draft, defaultPax: value ?? null })
                      }
                      measure="p"
                      allowNegative={false}
                      decimalScale={0}
                    />
                  </Stack>
                  <StackHalfHalf>
                    <InputNumber
                      label="Pax min"
                      value={draft.minPax ?? undefined}
                      onChange={(value) =>
                        setDraft({ ...draft, minPax: value ?? null })
                      }
                      measure="p"
                      allowNegative={false}
                      decimalScale={0}
                    />
                    <InputNumber
                      label="Pax max"
                      value={draft.maxPax ?? undefined}
                      onChange={(value) =>
                        setDraft({ ...draft, maxPax: value ?? null })
                      }
                      measure="p"
                      allowNegative={false}
                      decimalScale={0}
                    />
                  </StackHalfHalf>
                </Stack>
              )}
            </Stack>
          )}

          <InputCheckbox
            checked={draft.mandatory}
            onChange={(value) => setDraft({ ...draft, mandatory: value })}
            label="Extra obrigatório"
          />
        </Stack>

        <Stack row justifyContent="flex-end" gap="1rem">
          <Button label="Cancelar" type="link" onClick={onCancel} />
          <Button
            label={initialExtra ? "Guardar" : "Adicionar"}
            type="primary"
            onClick={handleSave}
          />
        </Stack>
      </Stack>
    </Modal>
  );
};

export default ExtraModal;
