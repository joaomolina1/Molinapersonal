"use client";

import { CSSProperties, ReactNode } from "react";
import { Button as AriaButton } from "react-aria-components";
import { createBEMClasses } from "@/_utils/classname";
import IconUserInterfaceMiscellaneousLoading from "../_icons/UserInterface/Miscellaneous/Loading.svg";
import { Link, LinkProps } from "@/_services/navigation";

export type ButtonProps = {
  type?:
    | "primary"
    | "secondary"
    | "link"
    | "red"
    | "primary-inverted"
    | "secondary-inverted"
    | "link-inverted"
    | "red-inverted"
    | "dark";
  label?: ReactNode;
  ariaLabel?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void | Promise<void>;
  href?: string;
  target?: LinkProps["target"];
  prefetch?: boolean;
  htmlType?: "submit" | "button" | "reset";

  className?: string;
  style?: CSSProperties;
};

const { block } = createBEMClasses("button");

const Button = ({
  type = "primary",
  label,
  ariaLabel,
  leftIcon,
  rightIcon,
  disabled,
  loading,
  onClick,
  href,
  target,
  prefetch,
  htmlType,
  className,
  style,
}: ButtonProps) => {
  if (href && !disabled) {
    return (
      <Link
        className={block({ type }, className)}
        href={href}
        target={target}
        prefetch={prefetch}
        style={style}
        aria-label={ariaLabel}
        onClick={
          onClick
            ? () => {
                onClick();
              }
            : undefined
        }
      >
        {leftIcon}
        {label}
        {rightIcon}
        <IconUserInterfaceMiscellaneousLoading />
      </Link>
    );
  }

  return (
    <AriaButton
      className={block({ type, loading, disabled }, className)}
      isDisabled={disabled || loading}
      aria-label={ariaLabel}
      onPress={
        onClick
          ? () => {
              onClick();
            }
          : undefined
      }
      type={htmlType}
      style={style}
    >
      {leftIcon}
      {label}
      {rightIcon}
      <IconUserInterfaceMiscellaneousLoading />
    </AriaButton>
  );
};

export default Button;
