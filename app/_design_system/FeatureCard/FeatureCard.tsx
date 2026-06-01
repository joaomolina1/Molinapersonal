import { createBEMClasses } from "@/_utils/classname";
import { ReactNode } from "react";
import { StylelessButton } from "../Button";

const { block, element } = createBEMClasses("feature-card");

type FeatureCardProps = {
  photo?: string;
  icon?: ReactNode;
  label: string;
  description?: string;
  href?: string;
  onClick?: () => void;
};

const FeatureCard = ({ href, onClick, ...props }: FeatureCardProps) => {
  if (href) {
    return (
      <StylelessButton href={href} className={block()} onClick={onClick}>
        <FeatureCardContent {...props} />
      </StylelessButton>
    );
  }

  return (
    <div className={block()}>
      <FeatureCardContent {...props} />
    </div>
  );
};

const FeatureCardContent = ({
  photo,
  icon,
  label,
  description,
}: FeatureCardProps) => (
  <>
    <div
      className={element("image", { "with-description": !!description })}
      style={{ backgroundImage: `url("${photo}")` }}
    >
      <div className={element("content")}>
        <h3>{label}</h3>
        {!!description && <p>{description}</p>}
      </div>
    </div>
    {!!icon && <div className={element("icon")}>{icon}</div>}
  </>
);

export default FeatureCard;
