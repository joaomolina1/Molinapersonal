import { createBEMClasses } from "@/_utils/classname";
import { CSSProperties } from "react";
import { ToggleButton as AriaToggleButton } from "react-aria-components";

export type ToggleButtonProps = {
  selected: boolean;
  onChange?: (selected: boolean) => void | Promise<void>;
  ariaLabel?: string;
  disabled?: boolean;
  size?: "large" | "medium";

  className?: string;
  style?: CSSProperties;
};

const { block, element } = createBEMClasses("toggle-button");

const ToggleButton = ({
  selected,
  onChange,
  ariaLabel,
  disabled,
  size = "large",
  className,
  style,
}: ToggleButtonProps) => {
  return (
    <AriaToggleButton
      isSelected={selected}
      onChange={(isSelected) => {
        onChange?.(isSelected);
      }}
      aria-label={ariaLabel}
      isDisabled={disabled}
      className={block({ size }, className)}
      style={style}
    >
      <div className={element("slider")} />
    </AriaToggleButton>
  );
};

export default ToggleButton;
