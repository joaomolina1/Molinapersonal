import { createBEMClasses } from "@/_utils/classname";
import { CSSProperties, ReactNode } from "react";

export type TagProps = {
  size?: "small" | "medium";
  text?: ReactNode;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  border?: boolean;
  type?:
    | "neutral"
    | "info"
    | "success"
    | "warning"
    | "error"
    | "disabled"
    | "neutral-2";

  className?: string;
  style?: CSSProperties;
};

const { block } = createBEMClasses("tag");

const Tag = ({
  size = "medium",
  border = true,
  text,
  iconLeft,
  iconRight,
  type = "neutral",
  className,
  style,
}: TagProps) => {
  return (
    <div className={block({ size, border, type }, className)} style={style}>
      {iconLeft}
      {!!text && <span>{text}</span>}
      {iconRight}
    </div>
  );
};

export default Tag;
