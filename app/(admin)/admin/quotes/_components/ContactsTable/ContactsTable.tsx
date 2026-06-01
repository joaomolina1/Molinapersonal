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
import Stack from "@/_design_system/Stack";
import ValueWithLabel from "@/(host)/_components/ValueWithLabel";
import { TextButton } from "@/_design_system/Button";
import Pagination from "@/_design_system/Pagination";
import { ContactsList } from "../useContactsList";
import { Contact } from "@/_models/contact";
import { CONTACT_METHODS } from "@/(main)/_components/QuoteRequest/QuoteRequestForm/QuoteRequestForm";
import CopyIconButton from "@/_components/CopyIconButton";

const ContactsTable = ({ contactsList }: { contactsList: ContactsList }) => {
  const { contacts } = contactsList;

  return (
    <Stack gap="2.5rem">
      <TableWrapper>
        <Table ariaLabel="Pedidos de contacto">
          <TableHeader>
            <Column isRowHeader>ID</Column>
            <Column>Nome</Column>
            <Column>Telefone</Column>
            <Column />
          </TableHeader>
          <TableBody>
            {contacts?.map((contact, index) => (
              <ContactRow
                key={contact.id}
                contact={contact}
                odd={index % 2 === 0}
              />
            ))}
          </TableBody>
        </Table>
      </TableWrapper>
      <Pagination
        page={contactsList.page}
        setPage={contactsList.setPage}
        numPages={contactsList.numPages}
      />
    </Stack>
  );
};

const ContactRow = ({ odd, contact }: { odd: boolean; contact: Contact }) => {
  return (
    <ExpandableRowProvider odd={odd}>
      <ExpandableRow>
        <Cell>
          <Stack row gap="0.25rem">
            <span style={{ textWrap: "nowrap" }}>{contact.id}</span>
            <CopyIconButton text={contact.id} />
          </Stack>
        </Cell>
        <Cell style={{ minWidth: 150 }}>{contact.name || "-"}</Cell>
        <Cell style={{ minWidth: 100 }}>
          {contact.phone_extension && contact.phone_number
            ? `+${contact.phone_extension}${contact.phone_number}`
            : "-"}
        </Cell>
        <ExpandIconCell />
      </ExpandableRow>
      <ExpandedRow>
        <Cell />
        <ExpandedRowMainCell colspan={3} applyDefaultStyle={false}>
          <div>
            <Stack gap="0.5rem" alignItems="flex-start">
              <ValueWithLabel label="Email" value={contact.email || "-"} />
              <ValueWithLabel
                label="Método"
                value={
                  CONTACT_METHODS.find(
                    (contactMethod) => contactMethod.id === contact.kind,
                  )?.label ?? "-"
                }
              />
              <div style={{ maxWidth: 600 }}>
                <ValueWithLabel
                  label="Mensagem"
                  value={contact.message || "-"}
                />
              </div>
              <ValueWithLabel
                label="Espaço em contexto"
                value={
                  contact.space_id ? (
                    <Stack>
                      <TextButton
                        text="Abrir espaço"
                        href={`/space/${contact.space_id}`}
                        target="_blank"
                      />
                      <p>ID pack: {contact.pack_id || "-"}</p>
                      <p>ID espaço: {contact.space_id}</p>
                      <p>ID local: {contact.venue_id || "-"}</p>
                    </Stack>
                  ) : (
                    "-"
                  )
                }
              />
            </Stack>
          </div>
        </ExpandedRowMainCell>
      </ExpandedRow>
    </ExpandableRowProvider>
  );
};

export default ContactsTable;
