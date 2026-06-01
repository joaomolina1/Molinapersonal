"use client";

import { createBEMClasses } from "@/_utils/classname";
import { CSSProperties, PropsWithChildren, ReactNode } from "react";
import {
  TooltipTrigger as AriaTooltipTrigger,
  Tooltip as AriaTooltip,
  OverlayArrow as AriaOverlayArrow,
  DialogTrigger,
  Popover,
} from "react-aria-components";
import { useCheckIfTouchDevice } from "@/_utils/mediaQuery";

export interface TooltipProps {
  content: ReactNode;
  visibleOnTouchDevice?: boolean;
  openOnlyOnClick?: boolean;
  visible?: boolean;
  setVisible?: (visible: boolean) => void;
  placement?: "top" | "bottom";

  className?: string;
  style?: CSSProperties;
}

const { block, element } = createBEMClasses("tooltip");

const Tooltip = ({
  content,
  visibleOnTouchDevice = false,
  openOnlyOnClick = false,
  visible,
  setVisible,
  placement = "top",
  children,
  className,
  style,
}: PropsWithChildren<TooltipProps>) => {
  const isTouchDevice = useCheckIfTouchDevice();

  if ((visibleOnTouchDevice && isTouchDevice) || openOnlyOnClick) {
    return (
      <DialogTrigger isOpen={visible} onOpenChange={setVisible}>
        {children}
        <Popover
          className={block(undefined, className)}
          placement={placement}
          style={style}
          offset={2}
          isNonModal
        >
          <OverlayArrow />
          {content}
        </Popover>
      </DialogTrigger>
    );
  }

  return (
    <AriaTooltipTrigger
      delay={0}
      closeDelay={0}
      isOpen={visible}
      onOpenChange={setVisible}
    >
      {children}
      <AriaTooltip
        className={block(undefined, className)}
        placement={placement}
        style={style}
        offset={2}
      >
        <OverlayArrow />
        {content}
      </AriaTooltip>
    </AriaTooltipTrigger>
  );
};

const OverlayArrow = () => (
  <AriaOverlayArrow className={element("arrow")}>
    <svg width={16} height={8}>
      <path d="M0 0 L8 8 L16 0" />
    </svg>
  </AriaOverlayArrow>
);

export default Tooltip;
