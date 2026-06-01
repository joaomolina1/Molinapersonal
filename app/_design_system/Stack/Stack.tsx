import { CSSProperties, ReactNode, Ref, forwardRef } from "react";

interface StackProps {
  row?: boolean;
  gap?: CSSProperties["gap"];
  alignItems?: CSSProperties["alignItems"];
  justifyContent?: CSSProperties["justifyContent"];
  flexWrap?: CSSProperties["flexWrap"];

  ariaLabel?: string;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}

const Stack = forwardRef(function Stack(
  {
    row,
    gap,
    alignItems,
    justifyContent,
    flexWrap,
    ariaLabel,
    className,
    style,
    children,
  }: StackProps,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: row ? "row" : "column",
        alignItems,
        justifyContent,
        gap,
        flexWrap,
        ...style,
      }}
      ref={ref}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
});

export const StackSeparator = () => <div className="stack-separator" />;

export default Stack;
