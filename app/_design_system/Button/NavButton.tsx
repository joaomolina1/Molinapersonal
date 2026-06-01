"use client";

import { createBEMClasses } from "@/_utils/classname";
import { CSSProperties, ReactNode } from "react";
import { Button as AriaButton } from "react-aria-components";
import Tooltip from "../Tooltip";
import { Link } from "@/_services/navigation";

export type NavButtonProps = {
  ariaLabel?: string;
  showTooltip?: boolean;
  icon?: ReactNode;
  onClick?: () => void | Promise<void>;
  href?: string;
  disabled?: boolean;
  type?: "primary" | "neutral";
  shape?: "round" | "square";
  className?: string;
  style?: CSSProperties;
};

const { block } = createBEMClasses("nav-button");

const NavButton = ({ showTooltip = false, ...props }: NavButtonProps) => {
  if (!showTooltip) {
    return <NavButtonContent {...props} />;
  }

  return (
    <Tooltip content={props.ariaLabel}>
      <NavButtonContent {...props} />
    </Tooltip>
  );
};

const NavButtonContent = ({
  ariaLabel,
  icon,
  onClick,
  href,
  disabled,
  type = "neutral",
  shape = "round",
  className,
  style,
}: NavButtonProps) => {
  if (href) {
    return (
      <Link
        aria-label={ariaLabel}
        className={block({ shape, type }, className)}
        href={href}
        onClick={() => {
          onClick?.();
        }}
        style={style}
      >
        {icon}
      </Link>
    );
  }

  return (
    <AriaButton
      aria-label={ariaLabel}
      className={block({ shape, type }, className)}
      onPress={() => {
        onClick?.();
      }}
      isDisabled={disabled}
      style={style}
    >
      {icon}
    </AriaButton>
  );
};

export default NavButton;
