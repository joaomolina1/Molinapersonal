import { createBEMClasses } from "@/_utils/classname";
import {
  CSSProperties,
  Fragment,
  ReactNode,
  useCallback,
  useState,
} from "react";

const { block, element } = createBEMClasses("animated-scrolling-list");

const AnimatedScrollingList = ({
  items,
  nbRows,
  gap,
}: {
  items: ReactNode[];
  nbRows: number;
  gap: number;
}) => {
  const rows = getRows({ items, nbRows });

  const [width, setWidth] = useState(0);

  const listRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) {
      setWidth(node.getBoundingClientRect().width);
    }
  }, []);

  const animationDuration = Math.max(width / 10, 100);

  return (
    <div
      className={block()}
      style={
        { "--animation-duration": `${animationDuration}s` } as CSSProperties
      }
    >
      {rows.map((row, index) => (
        <div key={index} className={element("row", { index })}>
          {[0, 1].map((index) => (
            <div
              key={index}
              className={element("row__repeat", { index })}
              ref={index === 0 ? listRef : undefined}
              style={{ gap, padding: `0 ${gap / 2}px` }}
            >
              {row.map((item, index) => (
                <Fragment key={index}>{item}</Fragment>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const getRows = ({ items, nbRows }: { items: ReactNode[]; nbRows: number }) => {
  const itemsPerRow = Math.floor(items.length / nbRows);
  const rows = [];

  for (let i = 0; i < items.length; i += itemsPerRow) {
    rows.push(items.slice(i, i + itemsPerRow));
  }

  return rows;
};

export default AnimatedScrollingList;
