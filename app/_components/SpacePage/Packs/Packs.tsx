import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { Pack, usePacks } from "@/_models/pack";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { Space } from "@/_models/space";
import PackSearch, { PackSearchHook, usePackSearch } from "./PackSearch";
import PackCard, { PackCardSkeleton } from "./PackCard";
import EmptyState from "@/_components/EmptyState";
import Button, { TextButton } from "@/_design_system/Button";
import { Venue } from "@/_models/venue";
import { getGaPackSearchData } from "./PackSearch/PackSearch";
import { sendGAEvent } from "@next/third-parties/google";
import { useEffect } from "react";
import { useQuoteRequestContext } from "@/(main)/_components/QuoteRequest";
import { usePathname } from "next/navigation";
import { useSession } from "@/_services/session";
import {
  extraParamsFromRecord,
  serializeExtraParamsQuery,
} from "@lib/extras/quantities";

const Packs = ({
  space,
  mode,
  venue,
}: {
  space: Space;
  mode: "public" | "auth";
  venue: Venue;
}) => {
  const isMobile = useMediaQuery("large");
  const [session] = useSession();

  const isAdmin = session?.roles.includes("admin");

  const packSearch = usePackSearch();

  const { date, start, end, numPeopleDebounced, extras, extraParams } = packSearch;

  const {
    data: allPacks = [],
    isLoading: isLoadingPacks,
    isRefetching: isRefetchingPacks,
  } = usePacks(
    {
      spaceID: space.id,
      query:
        date && start && end && numPeopleDebounced
          ? {
              date: date.toDate("Etc/UTC").toISOString(),
              start: start.string,
              end: end.string,
              num_persons: numPeopleDebounced,
              extras: extras.join(","),
              extra_params: serializeExtraParamsQuery(
                extraParamsFromRecord(extraParams),
              ),
            }
          : undefined,
      // Admins need to make an authenticated request in order to fetch packs which are not in "active" status
      mode: isAdmin ? "auth" : mode,
      onFetchDone: (packs) =>
        sendGAEvent("event", "Rinu_ScreenView", {
          Rinu_ScreenName: "/space",
          Rinu_ItemCategory: "Parametros_resultados",
          ...getGaPackSearchData(space, venue, packSearch),
          Rinu_eLabel8: packs.map((pack) => pack.name).join("; ") || null,
          Rinu_eLabel9:
            packs.map((pack) => pack.price?.value).join(", ") || null,
          Rinu_eLabel10:
            allPacks
              .filter(
                (allPack) => !packs.find((pack) => pack.id === allPack.id),
              )
              .map((pack) => pack.name)
              .join("; ") || null,
        }),
    },
    {
      keepPreviousData: true,
    },
  );

  // Some packs only have outdated prices that finished before today.
  // Those should be excluded.
  const allPacksWithFuturePrices = allPacks.filter((pack) =>
    pack.prices.some((price) => new Date(price.to) > new Date()),
  );

  const packs = allPacksWithFuturePrices.filter(
    (pack) => !pack.unavailabilityReason,
  );
  const otherPacks = allPacksWithFuturePrices.filter(
    (pack) => !!pack.unavailabilityReason,
  );

  useEffect(() => {
    if (!!space?.name && !!venue?.name) {
      document.title = `${space?.name} · ${venue?.name} | Disponibilidade e preços`;
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute(
          "content",
          `${space.name} · ${venue.name} | Espaços para alugar em ${venue.billingCity} | ${venue.description.slice(0, 60)}...`,
        );
    }
  }, [space, venue, packSearch]);

  // Quote request

  const pathname = usePathname();
  const { setQuoteRequestModalData } = useQuoteRequestContext();

  const handleNoPacksAvailableButton = () => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "enquire_request",
      Rinu_ItemType: "no_packs_available",
      ...getGaPackSearchData(space, venue, packSearch),
    });
  };

  const handleNoPackIsGoodButton = () => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "enquire_request",
      Rinu_ItemType: "no_pack_is_good",
      ...getGaPackSearchData(space, venue, packSearch),
    });
  };

  return (
    <Stack gap="2.5rem">
      <Stack gap="1.5rem">
        <TextBlock
          label={isMobile ? "Packs disponíveis" : undefined}
          subtitle={isMobile ? undefined : "Packs disponíveis"}
        />
        <PackSearch
          space={space}
          packSearch={packSearch}
          allPacks={allPacksWithFuturePrices}
          venue={venue}
        />
      </Stack>
      {isLoadingPacks || isRefetchingPacks ? (
        <Stack gap="2.5rem">
          {[...Array(packs.length || 2)].map((_, index) => (
            <PackCardSkeleton key={index} />
          ))}
        </Stack>
      ) : (
        <>
          {packs.length === 0 ? (
            <EmptyState
              text={{
                subtitle: "Sem ofertas disponíveis",
                body: (
                  <div>
                    <p>
                      {space.isServicesJourney
                        ? "Este serviço não consegue atender às suas necessidades"
                        : "Este espaço não consegue atender às suas necessidades"}
                    </p>
                    <p>
                      Peça{" "}
                      <TextButton
                        text="aqui"
                        href={
                          isMobile
                            ? `/quote-request?spaceID=${space.id}&venueID=${venue.id}`
                            : undefined
                        }
                        onClick={() => {
                          handleNoPacksAvailableButton();

                          if (!isMobile) {
                            setQuoteRequestModalData({
                              isOpen: true,
                              context: {
                                type: "quote-request",
                                spaceID: space.id,
                                venueID: venue.id,
                              },
                            });
                          }
                        }}
                      />{" "}
                      um orçamento personalizado
                    </p>
                  </div>
                ),
              }}
            />
          ) : (
            <Stack gap="2.5rem">
              {packs.map((pack) => (
                <PackCard
                  key={pack.id}
                  pack={pack}
                  packSearch={packSearch}
                  mode={mode}
                  variant="default"
                  space={space}
                  venue={venue}
                />
              ))}
            </Stack>
          )}
          <OtherPacks
            packs={otherPacks}
            packSearch={packSearch}
            mode={mode}
            space={space}
            venue={venue}
          />
          <div>
            <Button
              type="secondary"
              label="Nenhum destes packs serve o meu propósito"
              href={
                isMobile
                  ? `/quote-request?spaceID=${space.id}&venueID=${venue.id}`
                  : undefined
              }
              onClick={() => {
                handleNoPackIsGoodButton();

                if (!isMobile) {
                  setQuoteRequestModalData({
                    isOpen: true,
                    context: {
                      type: "quote-request",
                      spaceID: space.id,
                      venueID: venue.id,
                    },
                  });
                }
              }}
              style={{ whiteSpace: "initial" }}
            />
          </div>
        </>
      )}
    </Stack>
  );
};

const OtherPacks = ({
  packs,
  packSearch,
  mode,
  space,
  venue,
}: {
  packs: Pack[];
  packSearch: PackSearchHook;
  mode: "public" | "auth";
  space: Space;
  venue: Venue;
}) => {
  if (!packs.length) {
    return;
  }

  return (
    <Stack gap="2.5rem">
      <h5>Packs não disponíveis</h5>
      {packs.map((pack) => (
        <PackCard
          key={pack.id}
          pack={pack}
          packSearch={packSearch}
          mode={mode}
          variant="other"
          space={space}
          venue={venue}
        />
      ))}
    </Stack>
  );
};

export default Packs;
