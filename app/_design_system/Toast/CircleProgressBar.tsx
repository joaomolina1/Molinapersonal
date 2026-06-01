// Inspired from https://www.30secondsofcode.org/css/s/circular-progress-bar/

import { createBEMClasses } from "@/_utils/classname";
import { CSSProperties } from "react";

const { block } = createBEMClasses("circle-progress-bar");

const CircleProgressBar = ({
  size,
  strokeWidth,
  delay,
}: {
  size: number;
  strokeWidth: number;
  delay: number;
}) => {
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={block()}
      style={
        {
          "--size": size,
          "--stroke-width": strokeWidth,
          "--delay": `${delay - 0.1}s`,
          minWidth: size,
        } as CSSProperties
      }
    >
      <circle cx={center} cy={center} r={radius} />
    </svg>
  );
};

export default CircleProgressBar;
