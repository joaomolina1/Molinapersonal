import React, { ReactElement, JSX, CSSProperties } from "react";
import cn from "classnames";

export type IconWrapperProps = {
  name: string;
  source: ReactElement;
  className?: string;
  style?: CSSProperties;
};

export type IconProps = {
  alt?: string;
  className?: string;
  [x: string]: any;
};

export type FillableIconProps = {
  filled?: boolean;
} & IconProps;

const IconWrapper = ({
  name,
  className: defaultClassName,
  style,
  source,
}: IconWrapperProps) => {
  const Component = ({ alt, className, ...props }: IconProps): JSX.Element => {
    const attributes: Record<string, any> = {
      className: cn("icon-svg", `icon-${name}`, defaultClassName, className),
      style,
      ...props,
    };

    if (alt) {
      attributes.role = "img";
      attributes.alt = alt;
    } else {
      attributes["aria-hidden"] = true;
    }

    return React.cloneElement(source, attributes);
  };

  Component.displayName = `Icon${name.charAt(0).toUpperCase() + name.slice(1)}`;

  return Component;
};

export default IconWrapper;
