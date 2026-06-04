import {
  Cell,
  Column,
  ExpandableRow,
  ExpandableRowProvider,
  ExpandedRow,
  ExpandedRowMainCell,
  ExpandIconCell,
  Table,
  TableBody,
  TableHeader,
  TableWrapper,
} from "@/_design_system/Table";
import { QuotesList } from "../useQuotesList";
import { Quote } from "@/_models/quote";
import Stack from "@/_design_system/Stack";
import ValueWithLabel from "@/(host)/_components/ValueWithLabel";
import { SPACE_EVENT_TYPES_FLAT } from "@/_constants/space/eventTypes";
import { PACK_FEATURES_FLAT } from "@/_constants/pack/features";
import { formatMoney } from "@/_utils/number";
import { TextButton } from "@/_design_system/Button";
import Pagination from "@/_design_system/Pagination";
import CopyIconButton from "@/_components/CopyIconButton";
import Tag from "@/_design_system/Tag";
import QuotePacksSection from "../QuotePacksSection";

const QuotesTable = ({ quotesList }: { quotesList: QuotesList }) => {
  const { quotes } = quotesList;

  return (
    <Stack gap="2.5rem">
      <TableWrapper>
        <Table ariaLabel="Pedidos de orçamento">
          <TableHeader>
            <Column isRowHeader>ID</Column>
            <Column>Nome</Column>
            <Column>Telefone</Column>
            <Column>Data e Hora</Column>
            <Column>Budget total</Column>
            <Column>Nº de pessoas</Column>
            <Column>Tipo de evento</Column>
            <Column>Estado</Column>
            <Column />
          </TableHeader>
          <TableBody>
            {quotes?.map((quote, index) => (
              <QuoteRow key={quote.id} quote={quote} odd={index % 2 === 0} />
            ))}
          </TableBody>
        </Table>
      </TableWrapper>
      <Pagination
        page={quotesList.page}
        setPage={quotesList.setPage}
        numPages={quotesList.numPages}
      />
    </Stack>
  );
};

const QuoteRow = ({ odd, quote }: { odd: boolean; quote: Quote }) => {
  return (
    <ExpandableRowProvider odd={odd}>
      <ExpandableRow>
        <Cell>
          <Stack row gap="0.25rem">
            <span style={{ textWrap: "nowrap" }}>{quote.id}</span>
            <CopyIconButton text={quote.id} />
          </Stack>
        </Cell>
        <Cell style={{ minWidth: 150 }}>{quote.name || "-"}</Cell>
        <Cell style={{ minWidth: 100 }}>
          {quote.phone_extension && quote.phone_number
            ? `+${quote.phone_extension}${quote.phone_number}`
            : "-"}
        </Cell>
        <Cell style={{ width: 125 }}>
          <Stack alignItems="flex-start">
            <p>{quote.event_date.toString()}</p>
            <p>
              {quote.start_at?.timeLabel} - {quote.end_at?.timeLabel}
            </p>
          </Stack>
        </Cell>
        <Cell>{formatMoney(quote.budget)}</Cell>
        <Cell>{quote.num_people}</Cell>
        <Cell>
          {SPACE_EVENT_TYPES_FLAT.find(({ id }) => id === quote.event_kind)
            ?.label || "-"}
        </Cell>
        <Cell>
          {quote.statusWording ? (
            <Tag
              size="small"
              text={quote.statusWording.label}
              type={quote.statusWording.tagType}
            />
          ) : (
            "-"
          )}
        </Cell>
        <ExpandIconCell />
      </ExpandableRow>
      <ExpandedRow>
        <Cell />
        <ExpandedRowMainCell colspan={8} applyDefaultStyle={false}>
          <div>
            <Stack gap="1.5rem" alignItems="flex-start">
              <QuotePacksSection quote={quote} />
              <Stack gap="0.5rem" alignItems="flex-start">
              <ValueWithLabel label="Email" value={quote.email || "-"} />
              <ValueWithLabel
                label="Evento empresarial"
                value={quote.company_event ? "Sim" : "Não"}
              />
              <ValueWithLabel
                label="Empresa"
                value={quote.company_name || "-"}
              />
              <ValueWithLabel
                label="NIF/NIPC"
                value={quote.vat_number || "-"}
              />
              <ValueWithLabel label="Zona do país" value={quote.area || "-"} />
              <ValueWithLabel
                label="Serviços adicionais"
                value={
                  PACK_FEATURES_FLAT.filter(({ id }) =>
                    quote.attributes.includes(id),
                  )
                    .map(({ label }) => label)
                    .join(", ") || "-"
                }
              />
              <ValueWithLabel
                label="Espaço em contexto"
                value={
                  quote.space_id ? (
                    <Stack>
                      <TextButton
                        text="Abrir espaço"
                        href={`/space/${quote.space_id}`}
                        target="_blank"
                      />
                      <p>ID pack: {quote.pack_id || "-"}</p>
                      <p>ID espaço: {quote.space_id}</p>
                      <p>ID local: {quote.venue_id || "-"}</p>
                    </Stack>
                  ) : (
                    "-"
                  )
                }
              />
              <div style={{ maxWidth: 600 }}>
                <ValueWithLabel label="Notas" value={quote.notes || "-"} />
              </div>
              <ValueWithLabel label="ID" value={quote.id} />
              </Stack>
            </Stack>
          </div>
        </ExpandedRowMainCell>
      </ExpandedRow>
    </ExpandableRowProvider>
  );
};

export default QuotesTable;
