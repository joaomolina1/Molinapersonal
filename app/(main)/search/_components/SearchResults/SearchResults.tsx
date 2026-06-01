import SpaceCard, { SpaceCardSkeleton } from "./_components/SpaceCard";
import { createBEMClasses } from "@/_utils/classname";
import TextBlock from "@/_design_system/TextBlock";
import SkeletonLoader from "@/_design_system/SkeletonLoader";
import { getGASearchEventData, useSearchContext } from "../../useSearchState";
import EmptyState from "@/_components/EmptyState";
import { usePathname, useSearchParams } from "next/navigation";
import { TextButton } from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { sendGAEvent } from "@next/third-parties/google";
import { SearchResult } from "@/_models/search";
import QuoteRequestBannerCarousel from "@/_components/QuoteRequestBanner";
import Pagination from "@/_design_system/Pagination";
import { useQuoteRequestContext } from "@/(main)/_components/QuoteRequest";

const { block, element } = createBEMClasses("search-results");

const SearchResults = () => {
  const search = useSearchContext();
  const searchParams = useSearchParams();

  const {
    totalFilteredResults,
    searchResults,
    isFetchingSearchResults,
    setHoveredSearchResultId,
    page,
    setPage,
    numPages,
  } = search;

  const showSkeleton = !searchResults || isFetchingSearchResults;
  const skeletonList = [...Array(searchResults?.length ?? 1)];

  const pathname = usePathname();
  const handleSearchResultClick = (searchResult: SearchResult) => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "Spaces",
      Rinu_ItemType: "Space_Click",
      Rinu_eLabel1: searchResult.spaceName,
      Rinu_eLabel2: searchResult.venueName,
      ...getGASearchEventData(search),
      Rinu_eLabel9:
        (searchResults?.findIndex((item) => item.id === searchResult.id) ?? 0) +
        1,
      Rinu_eLabel10: `${searchResult.formattedPrice?.amount}€/${searchResult.formattedPrice?.type}`,
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resultsToDisplay = searchResults
    ? [
        ...searchResults.slice(0, 2),
        "quote-request-banner" as const,
        ...searchResults.slice(2),
      ]
    : [];

  return (
    <div className={block()}>
      <Stack row justifyContent="space-between" alignItems="center" gap="1rem">
        {showSkeleton ? (
          <SkeletonLoader type="text" />
        ) : (
          <TextBlock
            body={
              totalFilteredResults === 1
                ? "1 resultado encontrado"
                : `${totalFilteredResults} resultados encontrados`
            }
          />
        )}
      </Stack>

      {!showSkeleton && totalFilteredResults === 0 && (
        <div className={element("empty-message")}>
          <EmptyStateWithForm />
          <h3>Outros espaços</h3>
        </div>
      )}

      <div className={element("grid")}>
        {showSkeleton ? (
          skeletonList.map((_, index) => <SpaceCardSkeleton key={index} />)
        ) : (
          <>
            {resultsToDisplay.map((searchResult) =>
              searchResult === "quote-request-banner" ? (
                <div
                  className={element("grid__quote-request-banner")}
                  key="quote-request-banner"
                >
                  <QuoteRequestBannerCarousel mode="search" />
                  <p>
                    Partilhe connosco a sua ideia. Nós tratamos de encontrar o
                    espaço e a solução certa para a tornar realidade.
                  </p>
                </div>
              ) : (
                <SpaceCard
                  key={searchResult.id}
                  searchResult={searchResult}
                  searchParams={{
                    date: searchParams.get("date"),
                    start: searchParams.get("start"),
                    end: searchParams.get("end"),
                    numPeople: searchParams.get("numPeople"),
                  }}
                  onHoverChange={(isHovering) =>
                    setHoveredSearchResultId(
                      isHovering ? searchResult.id : null,
                    )
                  }
                  onClick={() => handleSearchResultClick(searchResult)}
                />
              ),
            )}
          </>
        )}
      </div>

      <Pagination
        page={page}
        setPage={(newPage) => {
          setPage(newPage);
          scrollToTop();
        }}
        numPages={numPages}
        style={{ paddingBottom: "3px" }}
      />
    </div>
  );
};

const EmptyStateWithForm = () => {
  const search = useSearchContext();
  const isMobile = useMediaQuery("large");
  const { setQuoteRequestModalData } = useQuoteRequestContext();

  const pathname = usePathname();
  const handleNoOfferClick = () => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "no_offer",
      Rinu_ItemType: "contact_rinu",
      ...getGASearchEventData(search),
    });
  };

  return (
    <EmptyState
      text={{
        label: "Ainda não temos espaços com essas características",
        body: (
          <>
            Experimente remover alguns filtros, veja abaixo outras sugestões ou{" "}
            <TextButton
              text="diga-nos o que procura"
              onClick={() => {
                handleNoOfferClick();

                if (!isMobile) {
                  setQuoteRequestModalData({
                    isOpen: true,
                    context: { type: "quote-request" },
                  });
                }
              }}
              href={isMobile ? "/quote-request" : undefined}
            />
            . Respondemos em 12h úteis.
          </>
        ),
      }}
    />
  );
};

export default SearchResults;
