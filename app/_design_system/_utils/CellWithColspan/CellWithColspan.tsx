import { Cell, CellProps } from "react-aria-components";

// Pass colSpan to react-aria so its collection counts the spanned columns
// correctly. Only setting the DOM attribute made the collection think the
// row had too few cells ("Cell count must match column count").
const CellWithColspan = ({
  colspan,
  ...props
}: CellProps & { colspan: number }) => {
  return <Cell colSpan={colspan} {...props} />;
};

export default CellWithColspan;
