import { ReactNode } from "react";
import { Menu, MenuItem } from "react-aria-components";
import Stack from "@/_design_system/Stack";
import { createBEMClasses } from "@/_utils/classname";

export type CalloutOption<T> = {
  id: T;
  text?: string;
  subText?: string;
  actionText?: string;
  icon?: ReactNode;
};

type CalloutProps<T> = {
  ariaLabel: string;
  options: readonly CalloutOption<T>[];
  onClickOption?: (id: T) => void | Promise<void>;
  value?: T;
  selectMode?: boolean;
  elevation?: "small" | "large";
};

const { block, element } = createBEMClasses("callout");

function Callout<T extends string>({
  ariaLabel,
  options,
  onClickOption,
  value,
  selectMode = false,
  elevation = "small",
}: CalloutProps<T>) {
  return (
    <Menu
      className={block({ elevation })}
      onAction={(key) => {
        onClickOption?.(key as T);
      }}
      aria-label={ariaLabel}
      selectedKeys={value ? new Set([value]) : undefined}
      selectionMode={selectMode ? "single" : "none"}
    >
      {options.map((option) => (
        <MenuItem
          key={option.id}
          id={option.id}
          aria-label={option.text}
          className={element("option")}
        >
          <div className={element("option__wrapper")}>
            <Stack
              row
              alignItems="center"
              gap="1rem"
              className={element("option__content")}
            >
              {option.icon}
              <Stack alignItems="flex-start">
                {!!option.text && (
                  <span className={element("option__text")}>{option.text}</span>
                )}
                {!!option.subText && (
                  <span className={element("option__sub-text")}>
                    {option.subText}
                  </span>
                )}
                {!!option.actionText && (
                  <span className={element("option__action-text")}>
                    {option.actionText}
                  </span>
                )}
              </Stack>
            </Stack>
          </div>
        </MenuItem>
      ))}
    </Menu>
  );
}

export default Callout;
