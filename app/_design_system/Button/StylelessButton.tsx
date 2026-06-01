import { Link } from "@/_services/navigation";
import { createBEMClasses } from "@/_utils/classname";
import { PropsWithChildren, Ref } from "react";
import { Button as AriaButton } from "react-aria-components";

type StylelessButtonProps = {
  href?: string;
  onClick?: () => void;
  onHoverChange?: (isHovering: boolean) => void;
  disabled?: boolean;
  className?: string;
  tabIndex?: number;
  ref?: Ref<HTMLButtonElement>;
};

const { block } = createBEMClasses("styleless-button");

const StylelessButton = ({
  href,
  onClick,
  onHoverChange,
  disabled,
  className,
  tabIndex,
  children,
  ref,
}: PropsWithChildren<StylelessButtonProps>) => {
  if (href && !disabled) {
    return (
      <Link
        href={href}
        className={block({}, className)}
        onMouseEnter={() => onHoverChange?.(true)}
        onMouseLeave={() => onHoverChange?.(false)}
        tabIndex={tabIndex}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <AriaButton
      className={block({}, className)}
      onPress={onClick}
      isDisabled={disabled}
      onHoverChange={onHoverChange}
      ref={ref}
    >
      {children}
    </AriaButton>
  );
};

export default StylelessButton;
