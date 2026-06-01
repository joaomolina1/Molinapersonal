import { createBEMClasses } from "@/_utils/classname";
import { CSSProperties } from "react";

const { block, element } = createBEMClasses("circle-loader");

const CircleLoader = ({ size }: { size: number }) => {
  const strokeWidth = 12;

  const center = size / 2;

  const fullCircleRadius = (size - strokeWidth) / 2;
  const partCircleRadius = (size - strokeWidth) / 2;

  const partCircleCircumference = 2 * Math.PI * partCircleRadius;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={block()}
      style={
        {
          "--offset-base": partCircleCircumference * 0.7,
          "--offset-max": partCircleCircumference * 0.5,
          minWidth: size,
        } as CSSProperties
      }
    >
      <circle
        className={element("full")}
        cx={center}
        cy={center}
        r={fullCircleRadius}
        strokeWidth={1.25}
        fill="none"
      />
      <circle
        className={element("part")}
        cx={center}
        cy={center}
        r={partCircleRadius}
        strokeWidth={strokeWidth}
        strokeDasharray={partCircleCircumference}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};

export default CircleLoader;
