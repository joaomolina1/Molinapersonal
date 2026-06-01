"use client";

import { createBEMClasses } from "@/_utils/classname";
import {
  CSSProperties,
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
} from "react";
import {
  ModalOverlay,
  Modal as AriaModal,
  Dialog,
} from "react-aria-components";
import { IconButton } from "../Button";
import IconUserInterfaceActionsClose from "../_icons/UserInterface/Actions/Close.svg";

export type ModalProps = {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  ariaLabel: string;
  width?: "full-width" | "xx-large" | "x-large" | "large" | "medium" | "small";
  mobileHeight?: "auto" | "fullscreen" | "almost-fullscreen";
  mobileIgnoreKeyboard?: boolean;
  stickToBottom?: boolean;
  isDismissable?: boolean;
  showCloseButton?: boolean;
  label?: ReactNode;
  footer?: ReactNode;
  className?: string;
  contentStyle?: CSSProperties;
};

const { block, element } = createBEMClasses("modal");

const Modal = ({
  isOpen,
  onOpenChange,
  ariaLabel,
  width = "large",
  mobileHeight = "auto",
  mobileIgnoreKeyboard = false,
  stickToBottom,
  isDismissable = true,
  showCloseButton = true,
  label,
  footer,
  className,
  contentStyle,
  children,
}: PropsWithChildren<ModalProps>) => {
  // On IOS Safari, the keyboard hides a portion of the page.
  // Here we pass the visual viewport height to the CSS
  // So that the CSS can display the modal above the keyboard
  const [visualViewportHeight, setVisualViewportHeight] = useState(0);

  useEffect(() => {
    if (window.visualViewport) {
      setVisualViewportHeight(window.visualViewport.height);
    }

    const updateHeight = () => {
      if (window.visualViewport) {
        setVisualViewportHeight(window.visualViewport.height);
      }
    };

    window.visualViewport?.addEventListener("resize", updateHeight);

    return () => {
      window.visualViewport?.removeEventListener("resize", updateHeight);
    };
  }, []);

  return (
    <ModalOverlay
      className={element("overlay", {
        "mobile-height": mobileHeight,
        "stick-to-bottom": stickToBottom,
        "mobile-ignore-keyboard": mobileIgnoreKeyboard,
      })}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable={isDismissable}
      style={
        {
          "--visual-viewport-height": `${visualViewportHeight}px`,
        } as CSSProperties
      }
    >
      <AriaModal className={block({ width }, className)}>
        <Dialog className={element("dialog")} aria-label={ariaLabel}>
          {({ close }) => (
            <>
              {showCloseButton && (
                <div className={element("header")}>
                  {label && <span>{label}</span>}
                  <IconButton
                    ariaLabel="Fechar"
                    onClick={close}
                    icon={<IconUserInterfaceActionsClose />}
                  />
                </div>
              )}
              <div
                className={element("content", {
                  "with-header": showCloseButton,
                })}
                style={contentStyle}
              >
                {children}
              </div>
              {!!footer && <div className={element("footer")}>{footer}</div>}
            </>
          )}
        </Dialog>
      </AriaModal>
    </ModalOverlay>
  );
};

export default Modal;
