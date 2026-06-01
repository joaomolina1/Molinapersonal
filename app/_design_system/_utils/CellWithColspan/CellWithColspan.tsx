import { useCallback } from "react";
import { Cell, CellProps } from "react-aria-components";

const CellWithColspan = ({
  colspan,
  ...props
}: CellProps & { colspan: number }) => {
  const ref = useCallback(
    (node: HTMLTableCellElement) => {
      if (node !== null) {
        node.setAttribute("colspan", `${colspan}`);
      }
    },
    [colspan],
  );

  return <Cell ref={ref} {...props} />;
};

export default CellWithColspan;
