import { useQuotes } from "@/_models/quote";
import { useState } from "react";

const QUOTES_PER_PAGE = 20;

export const useQuotesList = () => {
  const { data: quotes, isFetching } = useQuotes();

  const [page, setPage] = useState(1);

  const numPages = Math.ceil((quotes ?? [])?.length / QUOTES_PER_PAGE);
  const fromIndex = (page - 1) * QUOTES_PER_PAGE;
  const toIndex = page * QUOTES_PER_PAGE;

  return {
    quotes: quotes?.slice(fromIndex, toIndex),
    isFetching,
    page,
    setPage,
    numPages,
  };
};

export type QuotesList = ReturnType<typeof useQuotesList>;
