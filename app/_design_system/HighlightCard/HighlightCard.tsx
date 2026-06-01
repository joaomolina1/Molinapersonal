import { createBEMClasses } from "@/_utils/classname";
import { StylelessButton } from "../Button";
import { ReactNode } from "react";

const { block, element } = createBEMClasses("highlight-card");

type HighlightCardProps = {
  photo?: string;
  label: string;
  description?: ReactNode;
  href?: string;
  size?: "small" | "large";
  onClick?: () => void;
};

const HighlightCard = ({
  href,
  size = "small",
  onClick,
  ...props
}: HighlightCardProps) => {
  if (href) {
    return (
      <StylelessButton
        href={href}
        className={block({ size })}
        onClick={onClick}
      >
        <HighlightCardContent {...props} />
      </StylelessButton>
    );
  }

  return (
    <div className={block({ size })}>
      <HighlightCardContent {...props} />
    </div>
  );
};

const HighlightCardContent = ({
  photo,
  label,
  description,
}: HighlightCardProps) => (
  <div
    className={element("image")}
    style={{ backgroundImage: `url("${photo}")` }}
  >
    <div className={element("content")}>
      <p className={element("label")}>{label}</p>
      {!!description && <p className={element("description")}>{description}</p>}
    </div>
  </div>
);

export default HighlightCard;
