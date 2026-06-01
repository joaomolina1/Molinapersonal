"use client";
import { CSSProperties, ReactNode } from "react";
import { Button as AriaButton } from "react-aria-components";
import { createBEMClasses } from "@/_utils/classname";
import { Link } from "@/_services/navigation";

export type TextButtonProps = {
  text: ReactNode;
  onClick?: () => void;
  href?: string;
  target?: string;
  prefetch?: boolean;
  size?: "medium" | "small" | "x-small";
  className?: string;
  style?: CSSProperties;
};

const { block } = createBEMClasses("text-button");

const TextButton = ({
  text,
  onClick,
  href,
  target,
  prefetch,
  size = "medium",
  className,
  style,
}: TextButtonProps) => {
  if (href) {
    return (
      <Link
        className={block({ size }, className)}
        href={href}
        target={target}
        style={style}
        onClick={onClick}
        prefetch={prefetch}
      >
        {text}
      </Link>
    );
  }

  return (
    <AriaButton
      className={block({ size }, className)}
      onPress={() => onClick?.()}
      style={style}
    >
      {text}
    </AriaButton>
  );
};

export default TextButton;
