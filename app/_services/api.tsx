"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ReactNode, useMemo } from "react";
import { useSession } from "./session";
import { getFetchApiForSession } from "./apiServer";

export const useFetch = () => {
  const [session] = useSession();

  const fetchApi = useMemo(() => getFetchApiForSession(session), [session]);

  return fetchApi;
};

const makeQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      },
    },
  });

let browserQueryClient: QueryClient | undefined = undefined;

const getQueryClient = () => {
  if (typeof window === "undefined") {
    return makeQueryClient();
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
};

const ApiProvider = ({ children }: { children: ReactNode }) => {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  );
};

export default ApiProvider;
