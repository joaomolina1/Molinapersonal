import { LeadsListParams } from "@/_models/leadsList";
import {
  useDebouncedSearchParamState,
  useSearchParamsState,
} from "@/_services/searchParams";

export const useLeadsBoardFilters = () => {
  const [query, debouncedQuery, setQuery] =
    useDebouncedSearchParamState<string>("q");
  const [assignedRaw, setAssignedRaw] = useSearchParamsState<"all" | "me">(
    "assigned",
  );
  const assigned: LeadsListParams["assigned"] =
    assignedRaw === "me" ? "me" : "all";

  const listParams: LeadsListParams = {
    q: debouncedQuery || undefined,
    assigned,
  };

  return {
    query: query ?? "",
    setQuery,
    assigned,
    setAssigned: (value: LeadsListParams["assigned"]) =>
      setAssignedRaw(value === "me" ? "me" : null),
    listParams,
  };
};
