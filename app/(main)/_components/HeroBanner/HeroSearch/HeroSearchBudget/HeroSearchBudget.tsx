import IconUserInterfaceMiscellaneousEarnings from "@/_design_system/_icons/UserInterface/Miscellaneous/Earnings.svg";
import Button from "@/_design_system/Button";
import Chip from "@/_design_system/Chip";
import InputNumber from "@/_design_system/InputNumber";
import { InputSelectButton } from "@/_design_system/InputSelect";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { formatMoney } from "@/_utils/number";
import { useState } from "react";
import {
  DialogTrigger as AriaDialogTrigger,
  Dialog as AriaDialog,
  Popover as AriaPopover,
} from "react-aria-components";

const { block, element } = createBEMClasses("hero-search-budget");

const HeroSearchBudget = ({
  min,
  max,
  setBudget,
  onClick,
  mode,
}: {
  min: number | null;
  max: number | null;
  setBudget: (min: number | null, max: number | null) => void;
  onClick?: () => void;
  mode: "header" | "modal" | "mobile";
}) => {
  const isMobile = useMediaQuery("large");
  const [isOpen, setIsOpen] = useState(false);

  const [innerMin, setInnerMin] = useState(min);
  const [innerMax, setInnerMax] = useState(max);

  // Actions

  const open = () => {
    setIsOpen(true);
    setInnerMin(min);
    setInnerMax(max);
  };

  const disableApply =
    (!innerMin && !innerMax) ||
    (innerMin !== null && innerMax !== null && innerMax < innerMin);

  const closeAndApplyOrCancel = () => {
    if (!disableApply) {
      setBudget(innerMin, innerMax);
    } else {
      setInnerMin(min);
      setInnerMax(max);
    }

    setIsOpen(false);
  };

  const disableClear = innerMin === null && innerMax === null;

  const clear = () => {
    setInnerMin(null);
    setInnerMax(null);
    setBudget(null, null);
    setIsOpen(false);
  };

  const formattedMin = min
    ? formatMoney(min, { maximumFractionDigits: 0 })
    : undefined;

  const formattedMax = max
    ? formatMoney(max, { maximumFractionDigits: 0 })
    : undefined;

  const valueText =
    !!formattedMin && !!formattedMax
      ? `${formattedMin} - ${formattedMax}`
      : min !== null
        ? `Min. ${formattedMin}`
        : max !== null
          ? `Max. ${formattedMax}`
          : undefined;

  const label = "Qual o budget?";

  return (
    <AriaDialogTrigger
      isOpen={isOpen}
      onOpenChange={(isOpen) => {
        if (isOpen) {
          (onClick ?? open)();
        } else {
          closeAndApplyOrCancel();
        }
      }}
    >
      {mode === "mobile" ? (
        <Chip
          type="button"
          size="small"
          label={valueText || label}
          leftIcon={
            valueText ? undefined : <IconUserInterfaceMiscellaneousEarnings />
          }
          onClick={() => onClick ?? open}
        />
      ) : (
        <InputSelectButton
          label={label}
          value={valueText}
          showLabel={mode !== "header"}
          placeholder={mode === "header" ? label : undefined}
          className={block()}
        />
      )}
      {isMobile ? (
        <Modal ariaLabel={label} showCloseButton={false}>
          <Stack gap="1.5rem">
            <TextBlock subtitle={label} />
            <BudgetInputs
              min={innerMin}
              setMin={setInnerMin}
              max={innerMax}
              setMax={setInnerMax}
            />
            <Stack gap="0.5rem">
              <BudgetButtons
                onApply={closeAndApplyOrCancel}
                onClear={clear}
                disableApply={disableApply}
                disableClear={disableClear}
              />
            </Stack>
          </Stack>
        </Modal>
      ) : (
        <AriaPopover placement="bottom" offset={8}>
          <AriaDialog className={element("dialog")}>
            <main>
              <BudgetInputs
                min={innerMin}
                setMin={setInnerMin}
                max={innerMax}
                setMax={setInnerMax}
              />
            </main>
            <footer>
              <BudgetButtons
                onApply={closeAndApplyOrCancel}
                onClear={clear}
                disableApply={disableApply}
                disableClear={disableClear}
              />
            </footer>
          </AriaDialog>
        </AriaPopover>
      )}
    </AriaDialogTrigger>
  );
};

const BudgetInputs = ({
  min,
  setMin,
  max,
  setMax,
}: {
  min: number | null;
  setMin: (min: number | null) => void;
  max: number | null;
  setMax: (max: number | null) => void;
}) => {
  return (
    <div className={element("inputs")}>
      <InputNumber
        value={min ?? undefined}
        onChange={(value) => setMin(value ?? null)}
        allowNegative={false}
        decimalScale={0}
        label="Mínimo"
        measure="€"
      />
      <span>-</span>
      <InputNumber
        value={max ?? undefined}
        onChange={(value) => setMax(value ?? null)}
        allowNegative={false}
        decimalScale={0}
        label="Máximo"
        measure="€"
      />
    </div>
  );
};

const BudgetButtons = ({
  onApply,
  disableApply,
  onClear,
  disableClear,
}: {
  onApply: () => void;
  disableApply: boolean;
  onClear: () => void;
  disableClear: boolean;
}) => {
  return (
    <>
      <Button
        label="Limpar"
        type="link"
        onClick={onClear}
        disabled={disableClear}
      />
      <Button
        label="Aplicar"
        type="primary"
        onClick={onApply}
        disabled={disableApply}
      />
    </>
  );
};

export default HeroSearchBudget;
