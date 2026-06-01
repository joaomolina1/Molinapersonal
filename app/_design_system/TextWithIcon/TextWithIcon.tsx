import { createBEMClasses } from "@/_utils/classname";
import { CSSProperties, ReactNode } from "react";

export type TextWithIconProps = {
  icon: ReactNode;
  text: ReactNode;
  size?: "small" | "large";

  className?: string;
  style?: CSSProperties;
};

const { block, element } = createBEMClasses("text-with-icon");

const TextWithIcon = ({
  icon,
  text,
  size = "small",
  className,
  style,
}: TextWithIconProps) => {
  return (
    <div className={block({ size }, className)} style={style}>
      {icon}
      <div className={element("text")}>{text}</div>
    </div>
  );
};

export default TextWithIcon;
