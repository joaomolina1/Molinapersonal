import { createBEMClasses } from "@/_utils/classname";
import Stack from "../Stack/Stack";
import { CSSProperties, ReactNode } from "react";

interface AlertProps {
  icon?: ReactNode;
  title?: string;
  text?: ReactNode;
  content?: ReactNode;
  label?: string;
  variant?: "neutral" | "error" | "neutral-2";

  className?: string;
  style?: CSSProperties;
}

const { block, element } = createBEMClasses("alert-box");

const Alert = ({
  icon,
  title,
  text,
  content,
  label,
  variant = "neutral",
  className,
  style,
}: AlertProps) => (
  <Stack
    row
    gap="0.375rem"
    className={block({ variant }, className)}
    style={style}
  >
    {icon}
    <Stack gap="0.5rem">
      <Stack gap="0.25rem">
        {!!title && <p className={element("title")}>{title}</p>}
        {!!text && <p className={element("text")}>{text}</p>}
        {!!content && <div className={element("content")}>{content}</div>}
      </Stack>
      {!!label && <p className={element("label")}>{label}</p>}
    </Stack>
  </Stack>
);

export default Alert;
