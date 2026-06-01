import { useUsers } from "@/_models/user";
import { useVenues } from "@/_models/venue";
import { useDebouncedSearchParamState } from "@/_services/searchParams";
import { useState } from "react";

export const useUsersList = () => {
  const [page, setPage] = useState(1);
  const { data: venues } = useVenues();

  const [query, debouncedQuery, setQuery] =
    useDebouncedSearchParamState<string>("query");

  const params = {
    q: debouncedQuery || undefined,
    page_size: 20,
  } as const;

  const { data: currentUsers = [] } = useUsers({
    ...params,
    page,
  });

  const { data: nextUsers = [] } = useUsers({
    ...params,
    page: page + 1,
  });

  const usersToDisplay = currentUsers.map((user) =>
    Object.assign(user, {
      totalVenues: venues?.filter((venue) => venue.ownerID === user.id).length,
    }),
  );

  return {
    users: usersToDisplay,
    query,
    setQuery: (value: string) => {
      setQuery(value, () => setPage(1));
    },
    page,
    setPage,
    isLastPage: nextUsers?.length === 0,
  };
};

export type UsersList = ReturnType<typeof useUsersList>;
