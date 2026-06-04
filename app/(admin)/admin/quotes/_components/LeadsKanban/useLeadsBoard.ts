import { useContacts } from "@/_models/contact";
import { useQuotes } from "@/_models/quote";
import { useMemo } from "react";
import { BoardLead } from "./types";

export const useLeadsBoard = () => {
  const { data: quotes, isFetching: quotesLoading } = useQuotes();
  const { data: contacts, isFetching: contactsLoading } = useContacts();

  const leads = useMemo((): BoardLead[] => {
    const quoteLeads: BoardLead[] = (quotes ?? []).map((q) => ({
      kind: "quote",
      data: q,
    }));
    const contactLeads: BoardLead[] = (contacts ?? []).map((c) => ({
      kind: "contact",
      data: c,
    }));
    return [...quoteLeads, ...contactLeads].sort(
      (a, b) =>
        new Date(b.data.created_at).getTime() -
        new Date(a.data.created_at).getTime(),
    );
  }, [quotes, contacts]);

  return {
    leads,
    isLoading: quotesLoading || contactsLoading,
  };
};
