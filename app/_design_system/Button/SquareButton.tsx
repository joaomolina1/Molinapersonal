import { createBEMClasses } from "@/_utils/classname";
import { CSSProperties, ReactNode } from "react";
import { Button as AriaButton } from "react-aria-components";

export type SquareButtonProps = {
  icon: ReactNode;
  ariaLabel: string;
  counter?: ReactNode;
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
  className?: string;
  style?: CSSProperties;
};

const { block, element } = createBEMClasses("square-button");

const SquareButton = ({
  icon,
  ariaLabel,
  counter,
  disabled,
  onClick,
  className,
  style,
}: SquareButtonProps) => {
  return (
    <AriaButton
      className={block({ disabled }, className)}
      isDisabled={disabled}
      onPress={
        onClick
          ? () => {
              onClick();
            }
          : undefined
      }
      style={style}
      aria-label={ariaLabel}
    >
      {icon}
      {!!counter && <div className={element("counter")}>{counter}</div>}
    </AriaButton>
  );
};

export default SquareButton;
