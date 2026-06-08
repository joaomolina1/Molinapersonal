export type LeadsListParams = {
  q?: string;
  assigned?: "all" | "me";
};

/** Quotes and contacts must use separate keys — sharing caused duplicate cards on the kanban. */
export const quotesListQueryKey = (params?: LeadsListParams) =>
  ["quotes-list", params?.q ?? "", params?.assigned ?? "all"] as const;

export const contactsListQueryKey = (params?: LeadsListParams) =>
  ["contacts-list", params?.q ?? "", params?.assigned ?? "all"] as const;
