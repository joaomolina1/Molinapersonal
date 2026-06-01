"use client";

import { ToastQueue, useToastQueue } from "@react-stately/toast";
import type { ToastState, QueuedToast } from "@react-stately/toast";
import { useToast, useToastRegion } from "@react-aria/toast";
import type { ToastAria } from "@react-aria/toast";
import { ReactNode, useRef } from "react";
import { createPortal } from "react-dom";
import { createBEMClasses } from "@/_utils/classname";
import IconUserInterfaceActionsClose from "../_icons/UserInterface/Actions/Close.svg";
import { Button as AriaButton } from "react-aria-components";
import IconUserInterfaceMiscellaneousSecurity from "../_icons/UserInterface/Miscellaneous/Security.svg";
import Stack from "../Stack";
import CircleProgressBar from "./CircleProgressBar";

interface ToastProps {
  text: ReactNode;
}

const toastQueue = new ToastQueue<ToastProps>({
  maxVisibleToasts: 5,
});

export const GlobalToastRegion = () => {
  const state = useToastQueue<ToastProps>(toastQueue);
  const ref = useRef<HTMLDivElement>(null);
  const { regionProps } = useToastRegion({}, state, ref);

  if (state.visibleToasts.length) {
    return createPortal(
      <div {...regionProps} ref={ref} className="toast-region">
        {state.visibleToasts.map((toast) => (
          <Toast key={toast.key} state={state} toast={toast} />
        ))}
      </div>,
      document.body,
    );
  }
};

const Toast = ({
  state,
  toast,
}: {
  state: ToastState<ToastProps>;
  toast: QueuedToast<ToastProps>;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { toastProps, titleProps, closeButtonProps } = useToast(
    { toast },
    state,
    ref,
  );

  return (
    <div {...toastProps} ref={ref} className="toast-wrapper">
      <ToastElement
        text={toast.content.text}
        titleProps={titleProps}
        closeButtonProps={closeButtonProps}
      />
    </div>
  );
};

const { block, element } = createBEMClasses("toast");

const ToastElement = ({
  text,
  titleProps,
  closeButtonProps,
}: ToastProps & Pick<ToastAria, "titleProps" | "closeButtonProps">) => {
  return (
    <div className={block()}>
      <Stack row gap="1rem" alignItems="center">
        <IconUserInterfaceMiscellaneousSecurity />
        <div {...titleProps} className={element("content")}>
          {text}
        </div>
      </Stack>
      <div className={element("close-wrapper")}>
        <CircleProgressBar size={40} strokeWidth={2} delay={5} />
        <AriaButton {...closeButtonProps} className={element("close")}>
          <IconUserInterfaceActionsClose />
        </AriaButton>
      </div>
    </div>
  );
};

export const useShowToast = () => {
  return (details: ToastProps) => {
    toastQueue.add(details, { timeout: 5000 });
  };
};
