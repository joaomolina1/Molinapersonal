import { useContacts } from "@/_models/contact";
import { useQuotes } from "@/_models/quote";
import { LeadsListParams } from "@/_models/leadsList";
import { useMemo } from "react";
import { BoardLead } from "./types";

export const useLeadsBoard = (listParams?: LeadsListParams) => {
  const { data: quotes, isFetching: quotesLoading } = useQuotes(listParams);
  const { data: contacts, isFetching: contactsLoading } = useContacts(listParams);

  const leads = useMemo((): BoardLead[] => {
    const quoteLeads: BoardLead[] = (quotes ?? []).map((q) => ({
      kind: "quote",
      data: q,
    }));
    const contactLeads: BoardLead[] = (contacts ?? []).map((c) => ({
      kind: "contact",
      data: c,
    }));
    const seen = new Set<string>();
    const merged = [...quoteLeads, ...contactLeads].filter((lead) => {
      const key = `${lead.kind}:${lead.data.id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return merged.sort(
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
