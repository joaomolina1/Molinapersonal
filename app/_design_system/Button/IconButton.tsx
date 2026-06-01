"use client";

import { CSSProperties, ReactNode } from "react";
import { Button as AriaButton } from "react-aria-components";
import { createBEMClasses } from "@/_utils/classname";
import Tooltip from "../Tooltip";
import { Link, LinkProps } from "@/_services/navigation";

export type IconButtonProps = {
  ariaLabel: string;
  showTooltip?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  onClick?: () => void | Promise<void>;
  href?: string;
  target?: LinkProps["target"];
  prefetch?: boolean;
  slot?: string;
  type?: "neutral" | "primary";
  className?: string;
  style?: CSSProperties;
  onHover?: () => void;
};

const { block } = createBEMClasses("icon-button");

const IconButton = ({ showTooltip = true, ...props }: IconButtonProps) => {
  if (!showTooltip) {
    return <IconButtonContent {...props} />;
  }

  return (
    <Tooltip content={props.ariaLabel}>
      <IconButtonContent {...props} />
    </Tooltip>
  );
};

const IconButtonContent = ({
  ariaLabel,
  icon,
  disabled,
  onClick,
  href,
  target,
  prefetch,
  slot,
  type = "neutral",
  className,
  style,
  onHover,
}: IconButtonProps) => {
  if (href && !disabled) {
    return (
      <Link
        className={block({ type }, className)}
        aria-label={ariaLabel}
        href={href}
        target={target}
        prefetch={prefetch}
        style={style}
        onClick={
          onClick
            ? () => {
                onClick();
              }
            : undefined
        }
      >
        {icon}
      </Link>
    );
  }

  return (
    <AriaButton
      aria-label={ariaLabel}
      className={block({ type }, className)}
      onPress={
        onClick
          ? () => {
              onClick();
            }
          : undefined
      }
      isDisabled={disabled}
      style={style}
      slot={slot}
      onHoverStart={onHover}
    >
      {icon}
    </AriaButton>
  );
};

export default IconButton;
