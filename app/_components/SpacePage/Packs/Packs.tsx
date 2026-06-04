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
import { useEffect, useMemo, useRef } from "react";
import { useQuoteRequestContext } from "@/(main)/_components/QuoteRequest";
import { usePathname } from "next/navigation";
import { useSession } from "@/_services/session";
import {
  extraParamsFromRecord,
  serializeExtraParamsQuery,
} from "@lib/extras/quantities";
import { Extra } from "@/(onboarding)/onboarding/_components/Step4/Extras/utils";
import { reconcilePackExtraParams } from "./reconcilePackExtraParams";

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

  const {
    date,
    start,
    end,
    numPeopleDebounced,
    extras,
    extraParamsDebounced,
  } = packSearch;

  const packsQuery = useMemo(() => {
    if (!date || !start || !end || !numPeopleDebounced) {
      return undefined;
    }

    const extraSelections = extraParamsFromRecord(extraParamsDebounced);
    const serializedExtraParams = serializeExtraParamsQuery(extraSelections);

    return {
      date: date.toDate("Etc/UTC").toISOString(),
      start: start.string,
      end: end.string,
      num_persons: numPeopleDebounced,
      extras: extras.join(","),
      ...(extraSelections.length > 0
        ? { extra_params: serializedExtraParams }
        : {}),
    };
  }, [date, start, end, numPeopleDebounced, extras, extraParamsDebounced]);

  const hasCompleteSearch = !!packsQuery;

  const {
    data: allPacks = [],
    isLoading: isLoadingPacks,
    isFetching: isFetchingPacks,
    isError: isPacksError,
  } = usePacks(
    {
      spaceID: space.id,
      query: packsQuery,
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
  const allPacksWithFuturePrices = useMemo(
    () =>
      allPacks.filter((pack) =>
        pack.prices.some((price) => new Date(price.to) > new Date()),
      ),
    [allPacks],
  );

  const packs = useMemo(
    () => allPacksWithFuturePrices.filter((pack) => !pack.unavailabilityReason),
    [allPacksWithFuturePrices],
  );

  const otherPacks = useMemo(
    () =>
      allPacksWithFuturePrices.filter((pack) => !!pack.unavailabilityReason),
    [allPacksWithFuturePrices],
  );

  const startKey = start?.id ?? null;
  const endKey = end?.id ?? null;

  const packExtrasFingerprint = useMemo(() => {
    const parts: string[] = [];
    for (const pack of allPacksWithFuturePrices) {
      for (const extra of pack.extras) {
        parts.push(
          [
            extra.id,
            extra.description,
            extra.minHour ?? "",
            extra.maxHour ?? "",
            extra.defaultHour ?? "",
            extra.minPax ?? "",
            extra.maxPax ?? "",
            extra.defaultPax ?? "",
          ].join(":"),
        );
      }
    }
    return parts.sort().join("|");
  }, [allPacksWithFuturePrices]);

  const allExtrasRef = useRef<Extra[]>([]);
  const lastReconcileKeyRef = useRef("");

  useEffect(() => {
    const byId = new Map<string, Extra>();
    for (const pack of allPacksWithFuturePrices) {
      for (const extra of pack.extras) {
        byId.set(extra.id, extra);
      }
    }
    allExtrasRef.current = [...byId.values()];
  }, [packExtrasFingerprint]);

  const reconcileKey = `${extras.join(",")}|${startKey}|${endKey}|${numPeopleDebounced}|${packExtrasFingerprint}`;

  useEffect(() => {
    if (!start || !end || !numPeopleDebounced) {
      return;
    }

    if (lastReconcileKeyRef.current === reconcileKey) {
      return;
    }

    lastReconcileKeyRef.current = reconcileKey;

    reconcilePackExtraParams(
      {
        extras,
        setExtraParams: packSearch.setExtraParams,
        start,
        end,
        numPeopleDebounced,
      },
      allExtrasRef.current,
    );
  }, [
    reconcileKey,
    extras,
    numPeopleDebounced,
    packSearch.setExtraParams,
    start,
    end,
  ]);

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
  }, [space, venue]);

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
      {isPacksError ? (
        <EmptyState
          text={{
            subtitle: "Não foi possível carregar os packs",
            body: "Verifique a ligação e tente alterar novamente a data ou as horas.",
          }}
        />
      ) : isLoadingPacks ? (
        <Stack gap="2.5rem">
          {[...Array(2)].map((_, index) => (
            <PackCardSkeleton key={index} />
          ))}
        </Stack>
      ) : (
        <Stack
          gap="2.5rem"
          style={{
            opacity: isFetchingPacks ? 0.65 : 1,
            transition: "opacity 150ms ease-in-out",
          }}
        >
          {hasCompleteSearch &&
          packs.length === 0 &&
          otherPacks.length === 0 ? (
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
        </Stack>
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
