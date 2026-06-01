import { createBEMClasses } from "@/_utils/classname";
import {
  createContext,
  CSSProperties,
  PropsWithChildren,
  Ref,
  useCallback,
  useContext,
  useState,
} from "react";
import {
  Table as AriaTable,
  TableHeader as AriaTableHeader,
  TableBody as AriaTableBody,
  Column as AriaColumn,
  Row as AriaRow,
  Cell as AriaCell,
} from "react-aria-components";
import IconUserInterfaceNavigationArrowUp from "../_icons/UserInterface/Navigation/ArrowUp.svg";
import IconUserInterfaceNavigationArrowDown from "../_icons/UserInterface/Navigation/ArrowDown.svg";

const { block, element } = createBEMClasses("table");

export const TableWrapper = ({
  className,
  style,
  children,
  showTableBorder = true,
}: PropsWithChildren<{
  className?: string;
  style?: CSSProperties;
  showTableBorder?: boolean;
}>) => {
  return (
    <div
      className={element("wrapper", { showTableBorder }, className)}
      style={style}
    >
      {children}
    </div>
  );
};

type TableProps = PropsWithChildren<{
  ariaLabel: string;
  variant?: "even-odd" | "borders";
  className?: string;
  style?: CSSProperties;
}>;

export const Table = ({
  ariaLabel,
  variant = "even-odd",
  className,
  style,
  children,
}: TableProps) => {
  return (
    <AriaTable
      aria-label={ariaLabel}
      className={block({ variant }, className)}
      style={style}
    >
      {children}
    </AriaTable>
  );
};

export const TableHeader = ({ children }: PropsWithChildren) => (
  <AriaTableHeader>{children}</AriaTableHeader>
);
export const TableBody = ({ children }: PropsWithChildren) => (
  <AriaTableBody>{children}</AriaTableBody>
);

export const Column = ({
  isRowHeader,
  className,
  style,
  children,
}: PropsWithChildren<{
  isRowHeader?: boolean;
  className?: string;
  style?: CSSProperties;
}>) => {
  return (
    <AriaColumn
      isRowHeader={isRowHeader}
      className={element("column", undefined, className)}
      style={style}
    >
      {children}
    </AriaColumn>
  );
};

type RowProps = PropsWithChildren<{
  id?: string;
  odd?: boolean;
  className?: string;
  style?: CSSProperties;
  onAction?: () => void;
  ref?: Ref<HTMLTableRowElement>;
}>;

export const Row = ({
  id,
  odd,
  className,
  style,
  onAction,
  ref,
  children,
}: RowProps) => {
  return (
    <AriaRow
      id={id}
      className={element("row", { odd, clickable: !!onAction }, className)}
      style={style}
      onAction={onAction}
      ref={ref}
    >
      {children}
    </AriaRow>
  );
};

type CellProps = PropsWithChildren<{
  className?: string;
  style?: CSSProperties;
  applyDefaultStyle?: boolean;
}>;

export const Cell = ({
  className,
  style,
  children,
  applyDefaultStyle = true,
  ref,
}: CellProps & { ref?: Ref<HTMLTableCellElement> }) => {
  return (
    <AriaCell
      className={element("cell", { applyDefaultStyle }, className)}
      style={style}
      ref={ref}
    >
      {children}
    </AriaCell>
  );
};

export const CellWithColspan = ({
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

const ExpandableRowContext = createContext<{
  expanded: boolean;
  setExpanded: (expanded: boolean) => void;
  odd?: boolean;
}>({
  expanded: false,
  setExpanded: () => {},
  odd: false,
});

export const ExpandableRowProvider = ({
  odd,
  defaultExpanded,
  children,
}: PropsWithChildren<{
  odd?: boolean;
  defaultExpanded?: boolean;
}>) => {
  const [expanded, setExpanded] = useState(defaultExpanded ?? false);

  return (
    <ExpandableRowContext value={{ expanded, setExpanded, odd }}>
      {children}
    </ExpandableRowContext>
  );
};

export const ExpandableRow = (props: Omit<RowProps, "odd" | "expandable">) => {
  const { expanded, setExpanded, odd } = useContext(ExpandableRowContext);

  return <Row onAction={() => setExpanded(!expanded)} odd={odd} {...props} />;
};

export const ExpandIconCell = () => {
  const { expanded } = useContext(ExpandableRowContext);

  return (
    <Cell>
      {expanded ? (
        <IconUserInterfaceNavigationArrowUp />
      ) : (
        <IconUserInterfaceNavigationArrowDown />
      )}
    </Cell>
  );
};

export const ExpandedRow = ({
  className,
  ...props
}: Omit<RowProps, "odd" | "expandable">) => {
  const { expanded, odd } = useContext(ExpandableRowContext);

  if (!expanded) {
    return null;
  }

  return (
    <Row
      className={element("expanded-row", undefined, className)}
      odd={odd}
      {...props}
    />
  );
};

export const ExpandedRowMainCell = ({
  className,
  ...props
}: CellProps & { colspan: number }) => {
  return (
    <CellWithColspan
      className={element("expanded-row__main-cell", undefined, className)}
      {...props}
    />
  );
};
