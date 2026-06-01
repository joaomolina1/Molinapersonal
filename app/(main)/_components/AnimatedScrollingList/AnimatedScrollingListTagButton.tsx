import { StylelessButton } from "@/_design_system/Button";
import Tag from "@/_design_system/Tag";

const AnimatedScrollingListTagButton = ({
  id,
  href,
  text,
  onClick,
}: {
  id: string;
  href: string;
  text: string;
  onClick?: () => void;
}) => {
  return (
    <StylelessButton
      key={id}
      href={href}
      tabIndex={-1}
      className="animated-scrolling-list-tag-button"
      onClick={onClick}
    >
      <Tag text={text} />
    </StylelessButton>
  );
};

export default AnimatedScrollingListTagButton;
