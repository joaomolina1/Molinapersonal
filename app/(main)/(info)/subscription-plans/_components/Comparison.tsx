"use client";

import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  TableWrapper,
} from "@/_design_system/Table";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceActionsCheck from "@/_design_system/_icons/UserInterface/Actions/Check.svg";
import { PLANS, PlanId } from "@/_constants/plans";
import { createBEMClasses } from "@/_utils/classname";
import { COMPARISON_ROWS, ComparisonValue } from "./data";

const { element } = createBEMClasses("subscription-plans-page");

const PLAN_IDS: PlanId[] = ["standard", "premium", "expert"];

const ValueCell = ({ value }: { value: ComparisonValue }) => {
  if (value === true) {
    return (
      <span className={element("compare__check")}>
        <IconUserInterfaceActionsCheck />
      </span>
    );
  }
  if (value === false) {
    return <span className={element("compare__empty")}>—</span>;
  }
  return <span className={element("compare__value")}>{value}</span>;
};

const Comparison = () => (
  <section className={element("compare")}>
    <div className={element("section-content")}>
      <TextBlock
        title="Comparar planos"
        body="Tudo o que está incluído em cada plano, lado a lado."
      />
      <TableWrapper className={element("compare__table")}>
        <Table ariaLabel="Comparação de planos" variant="borders">
          <TableHeader>
            <Column isRowHeader>Característica</Column>
            {PLAN_IDS.map((id) => (
              <Column key={id}>{PLANS.find((p) => p.id === id)?.name}</Column>
            ))}
          </TableHeader>
          <TableBody>
            {COMPARISON_ROWS.map((row, index) => (
              <Row key={row.label} odd={index % 2 === 1}>
                <Cell>
                  <span className={element("compare__label")}>{row.label}</span>
                </Cell>
                {PLAN_IDS.map((id) => (
                  <Cell key={id}>
                    <ValueCell value={row.values[id]} />
                  </Cell>
                ))}
              </Row>
            ))}
          </TableBody>
        </Table>
      </TableWrapper>
    </div>
  </section>
);

export default Comparison;
