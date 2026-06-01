import { createBEMClasses } from "@/_utils/classname";
import {
  Menu as AriaMenu,
  MenuItem as AriaMenuItem,
} from "react-aria-components";

export type DropdownOption<T> = {
  id: T;
  text?: string;
  disabled?: boolean;
};

type DropdownProps<T> = {
  ariaLabel: string;
  options: readonly DropdownOption<T>[];
  onClickOption?: (id: T) => void;
  value?: T;
};

const { block, element } = createBEMClasses("dropdown");

const Dropdown = <T extends string>({
  ariaLabel,
  options,
  onClickOption,
  value,
}: DropdownProps<T>) => {
  const disabledKeys = options
    .filter((option) => option.disabled)
    .map((option) => option.id);

  return (
    <AriaMenu
      className={block()}
      onAction={(key) => onClickOption?.(key as T)}
      aria-label={ariaLabel}
      selectedKeys={value ? new Set([value]) : undefined}
      selectionMode="single"
      disabledKeys={disabledKeys}
    >
      {options.map((option) => (
        <AriaMenuItem
          key={option.id}
          id={option.id}
          aria-label={option.text}
          className={element("option")}
        >
          {option.text}
        </AriaMenuItem>
      ))}
    </AriaMenu>
  );
};

export default Dropdown;
