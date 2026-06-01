import Button from "@/_design_system/Button";
import Chip from "@/_design_system/Chip";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceNavigationArrowDown from "@/_design_system/_icons/UserInterface/Navigation/ArrowDown.svg";
import IconUserInterfaceNavigationArrowUp from "@/_design_system/_icons/UserInterface/Navigation/ArrowUp.svg";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { ReactNode, useMemo, useState } from "react";

export type ChipListProps<T extends string> = {
  label?: string;
  subtitle?: string;
  body?: string;
  selected?: T[];
  onChange?: (selected: T[]) => void;
  limit?: number;
  chipLists: readonly {
    label?: string;
    chips: readonly {
      id: T;
      icon?: ReactNode;
      label: string;
    }[];
    toggleButton?: {
      closedLabel: string;
      openedLabel?: string;
    };
  }[];
  error?: string;
  disabled?: boolean;
};

function ChipList<T extends string>({
  label,
  subtitle,
  body,
  selected = [],
  onChange,
  limit,
  chipLists,
  error,
  disabled,
}: ChipListProps<T>) {
  const handleCategoryClick = (id: T) => {
    if (selected.includes(id)) {
      onChange?.(selected?.filter((item) => item !== id));
    } else if (!limit || selected.length < limit) {
      onChange?.([...selected, id]);
    }
  };

  return (
    <Stack gap="16px" alignItems="flex-start" ariaLabel={label ?? subtitle}>
      <TextBlock label={label} subtitle={subtitle} body={body} />
      {error && <InputError error={error} />}
      {chipLists.map((chipList, index) => (
        <ChipListSection
          key={index}
          chipList={chipList}
          selected={selected}
          onClickChip={handleCategoryClick}
          limit={limit}
          disabled={disabled}
        />
      ))}
    </Stack>
  );
}

function ChipListSection<T extends string>({
  chipList,
  selected,
  onClickChip,
  limit,
  disabled,
}: {
  chipList: ChipListProps<T>["chipLists"][number];
  selected: ChipListProps<T>["selected"];
  onClickChip: (id: T) => void;
  limit: ChipListProps<T>["limit"];
  disabled: ChipListProps<T>["disabled"];
}) {
  const [toggleButtonOpen, setToggleButtonOpen] = useState(false);

  return chipList.toggleButton ? (
    <>
      <div className="hide-mobile-large">
        <TextBlock body={chipList.label} />
      </div>
      <div className="hide-desktop-large">
        <Button
          type="link"
          label={
            toggleButtonOpen
              ? chipList.toggleButton.openedLabel
              : chipList.toggleButton.closedLabel
          }
          rightIcon={
            toggleButtonOpen ? (
              <IconUserInterfaceNavigationArrowUp />
            ) : (
              <IconUserInterfaceNavigationArrowDown />
            )
          }
          onClick={() => setToggleButtonOpen((open) => !open)}
        />
      </div>
      <div className={toggleButtonOpen ? undefined : "hide-mobile-large"}>
        <Chips
          chips={chipList.chips}
          selected={selected}
          onClickChip={onClickChip}
          limit={limit}
          disabled={disabled}
        />
      </div>
    </>
  ) : (
    <>
      {chipList.label && <TextBlock body={chipList.label} />}
      <Chips
        chips={chipList.chips}
        selected={selected}
        onClickChip={onClickChip}
        limit={limit}
        disabled={disabled}
      />
    </>
  );
}

function Chips<T extends string>({
  chips,
  selected = [],
  onClickChip,
  limit,
  disabled,
}: {
  chips: ChipListProps<T>["chipLists"][number]["chips"];
  selected: ChipListProps<T>["selected"];
  onClickChip: (id: T) => void;
  limit: ChipListProps<T>["limit"];
  disabled: ChipListProps<T>["disabled"];
}) {
  const sortedChips = useMemo(
    () => [...chips].sort((a, b) => a.label.localeCompare(b.label)),
    [chips],
  );

  return (
    <Stack row gap="1rem" flexWrap="wrap">
      {sortedChips.map((chip) => (
        <Chip
          key={chip.id}
          leftIcon={chip.icon}
          label={chip.label}
          checked={selected.includes(chip.id)}
          onChange={() => onClickChip(chip.id)}
          disabled={
            disabled ||
            (selected.length === limit && !selected.includes(chip.id))
          }
        />
      ))}
    </Stack>
  );
}

export default ChipList;
