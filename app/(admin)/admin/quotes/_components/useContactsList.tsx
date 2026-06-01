import { useContacts } from "@/_models/contact";
import { useState } from "react";

const CONTACTS_PER_PAGE = 20;

export const useContactsList = () => {
  const { data: contacts, isFetching } = useContacts();

  const [page, setPage] = useState(1);

  const numPages = Math.ceil((contacts ?? [])?.length / CONTACTS_PER_PAGE);
  const fromIndex = (page - 1) * CONTACTS_PER_PAGE;
  const toIndex = page * CONTACTS_PER_PAGE;

  return {
    contacts: contacts?.slice(fromIndex, toIndex),
    isFetching,
    page,
    setPage,
    numPages,
  };
};

export type ContactsList = ReturnType<typeof useContactsList>;
