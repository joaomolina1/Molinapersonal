"use client";

import Stack from "@/_design_system/Stack";
import { useQuotesList } from "./_components/useQuotesList";
import EmptyState from "@/_components/EmptyState";
import QuotesTable from "./_components/QuotesTable";
import Tabs, { TabPanel } from "@/_design_system/Tabs";
import IconUserInterfaceMiscellaneousPhone from "@/_design_system/_icons/UserInterface/Miscellaneous/Phone.svg";
import IconUserInterfacePaymentCard from "@/_design_system/_icons/UserInterface/Payment/Card.svg";
import { useState } from "react";
import { useContactsList } from "./_components/useContactsList";
import ContactsTable from "./_components/ContactsTable";

const adminRequestsTabs = [
  {
    id: "quotes",
    label: "Pedidos de Orçamento",
    icon: <IconUserInterfacePaymentCard />,
  },
  {
    id: "contacts",
    label: "Pedidos de Contacto",
    icon: <IconUserInterfaceMiscellaneousPhone />,
  },
] as const;

type AdminRequestsTab = (typeof adminRequestsTabs)[number]["id"];

export default function AdminQuotes() {
  const [tab, setTab] = useState<AdminRequestsTab>("quotes");

  return (
    <Stack gap="2.5rem">
      <Stack gap="1rem">
        <Tabs
          tabs={adminRequestsTabs}
          value={tab}
          onChange={setTab}
          style={{ marginBottom: "2rem" }}
        >
          <TabPanel id="quotes">
            <QuotesList />
          </TabPanel>
          <TabPanel id="contacts">
            <ContactsList />
          </TabPanel>
        </Tabs>
      </Stack>
    </Stack>
  );
}

const QuotesList = () => {
  const quotesList = useQuotesList();

  if (!quotesList.quotes) {
    return;
  }

  if (!quotesList.quotes.length) {
    return (
      <EmptyState
        text={{
          body: "Nenhum pedido de orçamento",
        }}
      />
    );
  }

  return <QuotesTable quotesList={quotesList} />;
};

const ContactsList = () => {
  const contactsList = useContactsList();

  if (!contactsList.contacts) {
    return;
  }

  if (!contactsList.contacts.length) {
    return (
      <EmptyState
        text={{
          body: "Nenhum pedido de contacto",
        }}
      />
    );
  }

  return <ContactsTable contactsList={contactsList} />;
};
