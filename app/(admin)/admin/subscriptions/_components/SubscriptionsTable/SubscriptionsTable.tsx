import { SubscriptionsList } from "../useSubscriptionsList";
import {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
  TableWrapper,
} from "@/_design_system/Table";
import Tag from "@/_design_system/Tag";
import { formatDate } from "@/_utils/date";
import CopyIconButton from "@/_components/CopyIconButton";
import Stack from "@/_design_system/Stack";

const STATUS_TAGS: Record<
  string,
  { text: string; type: "success" | "warning" | "neutral" | "disabled" }
> = {
  active: { text: "Ativo", type: "success" },
  incomplete: { text: "Incompleto", type: "neutral" },
  past_due: { text: "Pagamento em atraso", type: "warning" },
  canceled: { text: "Cancelado", type: "disabled" },
};

const PLAN_TAGS: Record<string, string> = {
  premium: "Premium",
  expert: "Expert",
};

const SubscriptionsTable = ({
  subscriptionsList,
}: {
  subscriptionsList: SubscriptionsList;
}) => {
  const { subscriptions } = subscriptionsList;

  return (
    <TableWrapper>
      <Table ariaLabel="Subscrições">
        <TableHeader>
          <Column isRowHeader>Local</Column>
          <Column>Proprietário</Column>
          <Column>Plano</Column>
          <Column>Intervalo</Column>
          <Column>Estado</Column>
          <Column>Fim do período</Column>
          <Column>Stripe</Column>
        </TableHeader>
        <TableBody>
          {subscriptions.map((subscription, index) => {
            const statusTag =
              STATUS_TAGS[subscription.status] ?? STATUS_TAGS.incomplete;

            return (
              <Row key={subscription.id} odd={index % 2 === 1}>
                <Cell>
                  <div>
                    {subscription.venueName ||
                      subscription.venueReference ||
                      "-"}
                  </div>
                  <Stack row gap="0.25rem">
                    <small>{subscription.venueID}</small>
                    <CopyIconButton text={subscription.venueID} />
                  </Stack>
                </Cell>
                <Cell>
                  <div>{subscription.ownerEmail || "-"}</div>
                </Cell>
                <Cell>
                  <Tag
                    size="small"
                    type="neutral"
                    text={PLAN_TAGS[subscription.plan] ?? subscription.plan}
                  />
                </Cell>
                <Cell>
                  <div>
                    {subscription.interval === "year" ? "Anual" : "Mensal"}
                  </div>
                </Cell>
                <Cell>
                  <Tag
                    size="small"
                    type={statusTag.type}
                    text={statusTag.text}
                  />
                  {subscription.cancelAtPeriodEnd && (
                    <div>
                      <Tag
                        size="small"
                        type="warning"
                        text="Cancela no fim"
                      />
                    </div>
                  )}
                </Cell>
                <Cell>
                  <div>
                    {subscription.currentPeriodEnd
                      ? (() => {
                          const end = new Date(subscription.currentPeriodEnd);
                          return [
                            formatDate(end, { day: "numeric" }),
                            formatDate(end, { month: "short" }).slice(0, -1),
                            formatDate(end, { year: "numeric" }),
                          ].join(" ");
                        })()
                      : "-"}
                  </div>
                </Cell>
                <Cell>
                  <Stack row gap="0.25rem">
                    {subscription.stripeSubscriptionID || "-"}
                    {subscription.stripeSubscriptionID && (
                      <CopyIconButton
                        text={subscription.stripeSubscriptionID}
                      />
                    )}
                  </Stack>
                </Cell>
              </Row>
            );
          })}
        </TableBody>
      </Table>
    </TableWrapper>
  );
};

export default SubscriptionsTable;
