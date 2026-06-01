import { createBEMClasses } from "@/_utils/classname";
import { CSSProperties, ReactNode } from "react";

interface StackHalfHalfProps {
  gap?: CSSProperties["gap"];
  reverse?: boolean;
  rightEmpty?: boolean;
  className?: string;
  children?: ReactNode;
  applyOnMobile?: boolean;
}

const { block, element } = createBEMClasses("stack-half-half");

const StackHalfHalf = ({
  gap,
  reverse = false,
  rightEmpty,
  className,
  children,
  applyOnMobile,
}: StackHalfHalfProps) => (
  <div
    className={block({ reverse, applyOnMobile }, className)}
    style={{ width: "100%", gap }}
  >
    {children}
    {rightEmpty && <div className={element("right-empty")} />}
  </div>
);

export default StackHalfHalf;
