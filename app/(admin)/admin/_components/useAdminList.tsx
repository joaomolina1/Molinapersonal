import { STATUSES, Status } from "@/_constants/status";
import {
  DASHBOARD_ITEM_TYPES,
  DashboardItemTypeId,
  useDashboardList,
} from "@/_models/dashboard";
import {
  useDebouncedSearchParamState,
  useSearchParamsState,
} from "@/_services/searchParams";
import { useState } from "react";

const typeOptions = [
  {
    id: "all",
    text: "Todos",
  },
  ...DASHBOARD_ITEM_TYPES,
] as const;

const statusOptions = [
  { id: "all", text: "Todos os estados" },
  ...STATUSES.map(({ id, label }) => ({ id, text: label })),
] as const;

export const useAdminList = () => {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [query, debouncedQuery, setQuery] =
    useDebouncedSearchParamState("query");
  const [typeString, setType] = useSearchParamsState<
    DashboardItemTypeId | "all"
  >("type");
  const [statusString, setStatus] = useSearchParamsState<Status | "all">(
    "status",
  );

  const typeOption =
    typeOptions.find(({ id }) => id === typeString) ?? undefined;

  const status =
    statusOptions.find(({ id }) => id === statusString)?.id ?? undefined;

  const params = {
    q: debouncedQuery || undefined,
    type: typeOption?.id === "all" ? undefined : typeOption?.type,
    journey: typeOption?.id === "all" ? undefined : typeOption?.journey,
    status: status === "all" ? undefined : status,
    sort_by: "type",
    page_size: perPage,
  } as const;

  const { data: currentPage = [], isFetching } = useDashboardList({
    ...params,
    page,
  });

  const { data: nextPage = [] } = useDashboardList({
    ...params,
    page: page + 1,
  });

  return {
    dashboardItems: currentPage,
    isFetching,
    query,
    setQuery: (newQuery: string) => {
      setQuery(newQuery, () => {
        setPage(1);
      });
    },
    type: typeOption?.id ?? "all",
    setType: (newType: DashboardItemTypeId | "all" | null) => {
      setType(newType);
      setPage(1);
    },
    typeOptions,
    status: status ?? "all",
    setStatus: (newStatus: Status | "all" | null) => {
      setStatus(newStatus);
      setPage(1);
    },
    statusOptions,
    perPage,
    setPerPage: (perPage: number) => {
      setPerPage(perPage);
      setPage(1);
    },
    page,
    setPage,
    isLastPage: nextPage.length === 0,
  };
};

export type AdminList = ReturnType<typeof useAdminList>;
