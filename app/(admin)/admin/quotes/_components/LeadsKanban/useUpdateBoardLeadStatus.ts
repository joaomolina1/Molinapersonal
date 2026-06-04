import { QuoteStatus } from "@/_constants/quote/statuses";
import { useUpdateContactLead } from "@/_models/contact";
import { useUpdateQuoteLead } from "@/_models/quote";
import type { BoardLeadDrag } from "./types";

export const useUpdateBoardLeadStatus = () => {
  const { mutateAsync: updateQuote } = useUpdateQuoteLead();
  const { mutateAsync: updateContact } = useUpdateContactLead();

  return async (drag: BoardLeadDrag, status: QuoteStatus) => {
    if (drag.kind === "quote") {
      await updateQuote({ quoteId: drag.id, status });
    } else {
      await updateContact({ contactId: drag.id, status });
    }
  };
};
