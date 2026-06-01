import { createBEMClasses } from "@/_utils/classname";
import Stack from "../Stack/Stack";
import { CSSProperties, ReactNode } from "react";

export interface TextBlockProps {
  microtitle?: string;
  title?: ReactNode;
  subtitle?: ReactNode;
  label?: ReactNode;
  body?: ReactNode;

  className?: string;
  style?: CSSProperties;
}

const { block, element } = createBEMClasses("text-block");

const TextBlock = ({
  microtitle,
  title,
  subtitle,
  label,
  body,
  className,
  style,
}: TextBlockProps) => {
  if (!microtitle && !title && !subtitle && !label && !body) {
    return null;
  }

  return (
    <Stack gap="1rem" className={block({}, className)} style={style}>
      {!!microtitle && <h6 className={element("microtitle")}>{microtitle}</h6>}
      {!!title && <h1 className={element("title")}>{title}</h1>}
      {!!subtitle && <h2 className={element("subtitle")}>{subtitle}</h2>}
      {!!label && <h4 className={element("label")}>{label}</h4>}
      {!!body && <div className={element("body")}>{body}</div>}
    </Stack>
  );
};

export default TextBlock;
