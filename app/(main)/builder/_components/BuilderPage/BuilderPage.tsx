"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { useQueries } from "@tanstack/react-query";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";

import Button, { IconButton, TextButton } from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import Tag from "@/_design_system/Tag";
import Tooltip from "@/_design_system/Tooltip";
import InputDate from "@/_design_system/InputDate";
import InputTimeRange from "@/_design_system/InputTimeRange";
import InputNumber from "@/_design_system/InputNumber";
import InputSelect from "@/_design_system/InputSelect";
import CircleLoader from "@/_design_system/CircleLoader";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import IconUserInterfaceMiscellaneousUsers from "@/_design_system/_icons/UserInterface/Miscellaneous/Users.svg";
import IconUserInterfaceMiscellaneousInfo from "@/_design_system/_icons/UserInterface/Miscellaneous/Info.svg";
import IconUserInterfaceActionsDelete from "@/_design_system/_icons/UserInterface/Actions/Delete.svg";
import PhotoCarousel from "@/_components/SpacePage/PhotoCarousel";

import EventTypeSelect from "@/(main)/_components/EventTypeSelect";
import {
  allEventTypeOptions,
  getServiceTabFilters,
} from "@/(main)/search/_utils/attributes";
import {
  SPACE_EVENT_TYPES_FLAT,
  SpaceEventType,
} from "@/_constants/space/eventTypes";
import {
  City,
  SearchResult,
  useAttributes,
  useCities,
  useSearchResults,
} from "@/_models/search";
import { Pack, usePacks } from "@/_models/pack";
import { useCreateBooking } from "@/_models/booking";
import { Extra } from "@/(onboarding)/onboarding/_components/Step4/Extras/utils";
import {
  computeExtraPrice,
  extraParamsFromRecord,
  resolveExtraHours,
  resolveExtraPax,
  serializeExtraParamsQuery,
  usesExtraHours,
  usesExtraPax,
} from "@lib/extras/quantities";
import { computePackPaymentBreakdown } from "@lib/payment/upfront";

import { createBEMClasses } from "@/_utils/classname";
import { TimeDuration, formatInt, formatMoney } from "@/_utils/number";
import { formatDate } from "@/_utils/date";
import { useFetch } from "@/_services/api";
import { useSession } from "@/_services/session";
import { useSessionSearchParams } from "@/_components/Header";
import { useRouterPush } from "@/_services/navigation";
import { ErrorBoundary } from "@/_services/sentry";

const { block, element } = createBEMClasses("builder-page");

const MAX_SERVICE_PACKS = 5;

type Step =
  | "event-type"
  | "details"
  | "space"
  | "pack"
  | "services"
  | "external-services"
  | "review";

type ChatEntry = {
  question: string;
  answer: string;
};

type ExtraSelectionMap = Record<
  string,
  { hours: number | null; pax: number | null }
>;

type ServicePackSelection = {
  pack: Pack;
  space: SearchResult;
  extraSelection: ExtraSelectionMap;
};

const money = (value: number) =>
  formatMoney(value, { maximumFractionDigits: 0 });

const isPackBookable = (pack: Pack) =>
  pack.prices.some((price) => new Date(price.to) > new Date()) &&
  !pack.unavailabilityReason &&
  !!pack.price?.value;

const BuilderPage = () => {
  const pathname = usePathname();
  const [session] = useSession();
  const [, setSessionSearchParams] = useSessionSearchParams();
  const routerPush = useRouterPush();

  const [step, setStep] = useState<Step>("event-type");
  const [history, setHistory] = useState<ChatEntry[]>([]);

  const { data: cities = [] } = useCities({ enabled: true });

  // Event basics
  const [eventType, setEventType] = useState<SpaceEventType | null>(null);
  const [city, setCity] = useState<City | null>(null);
  const [date, setDate] = useState<CalendarDate | null>(null);
  const [startEnd, setStartEnd] = useState<{
    start: TimeDuration | null;
    end: TimeDuration | null;
  }>({ start: null, end: null });
  const [numPeople, setNumPeople] = useState<number | undefined>(undefined);
  const [budget, setBudget] = useState<number | undefined>(undefined);

  // Selection
  const [selectedSpace, setSelectedSpace] = useState<SearchResult | null>(null);
  const [selectedPackID, setSelectedPackID] = useState<string | null>(null);
  const [extraSelection, setExtraSelection] = useState<ExtraSelectionMap>({});
  const [servicePacks, setServicePacks] = useState<ServicePackSelection[]>([]);
  const [layout, setLayout] = useState<string | null>(null);

  const eventTypeLabel = useMemo(
    () =>
      SPACE_EVENT_TYPES_FLAT.find((option) => option.id === eventType)?.label ??
      "",
    [eventType],
  );

  const basePacksQuery = useMemo(() => {
    if (!date || !startEnd.start || !startEnd.end || !numPeople) {
      return undefined;
    }
    return {
      date: date.toDate("Etc/UTC").toISOString(),
      start: startEnd.start.string,
      end: startEnd.end.string,
      num_persons: numPeople,
      extras: "",
    };
  }, [date, startEnd, numPeople]);

  const selectedExtraIDs = Object.keys(extraSelection);

  // The selected pack re-priced with the chosen services, so totals always
  // come from the same pricing engine used at checkout.
  const pricedPacksQuery = useMemo(() => {
    if (!basePacksQuery) return undefined;
    const selections = extraParamsFromRecord(
      Object.fromEntries(
        Object.entries(extraSelection).map(([id, quantities]) => [
          id,
          {
            ...(quantities.hours != null ? { hours: quantities.hours } : {}),
            ...(quantities.pax != null ? { pax: quantities.pax } : {}),
          },
        ]),
      ),
    );
    return {
      ...basePacksQuery,
      extras: selectedExtraIDs.join(","),
      ...(selections.length > 0
        ? { extra_params: serializeExtraParamsQuery(selections) }
        : {}),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [basePacksQuery, extraSelection]);

  const { data: pricedPacks, isFetching: isFetchingPricedPacks } = usePacks(
    {
      spaceID: selectedSpace?.id,
      query: pricedPacksQuery,
      mode: "public",
    },
    { enabled: !!selectedSpace && !!selectedPackID, keepPreviousData: true },
  );

  const selectedPack =
    pricedPacks?.find((pack) => pack.id === selectedPackID) ?? null;

  const servicePacksTotal = servicePacks.reduce(
    (sum, { pack }) => sum + (pack.price?.value ?? 0),
    0,
  );

  const total = (selectedPack?.price?.value ?? 0) + servicePacksTotal;

  // The upfront percentage of the main pack applies to the whole booking,
  // mirroring the server-side computation.
  const paymentBreakdown =
    selectedPack?.price && selectedPack.cancellationPeriod && date
      ? computePackPaymentBreakdown({
          totalAmount: total,
          cancellationPeriod: selectedPack.cancellationPeriod,
          upfrontPercentage: selectedPack.upfrontPercentage,
          eventDate: new Date(date.toString()),
        })
      : null;

  const trackStep = (stepName: string, label?: string) => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "EventBuilder",
      Rinu_ItemType: stepName,
      Rinu_eLabel1: label,
    });
  };

  const pushHistory = (question: string, answer: string) => {
    setHistory((entries) => [...entries, { question, answer }]);
  };

  const restart = () => {
    setStep("event-type");
    setHistory([]);
    setEventType(null);
    setCity(null);
    setDate(null);
    setStartEnd({ start: null, end: null });
    setNumPeople(undefined);
    setBudget(undefined);
    setSelectedSpace(null);
    setSelectedPackID(null);
    setExtraSelection({});
    setServicePacks([]);
    setLayout(null);
    trackStep("restart");
  };

  return (
    <ErrorBoundary>
      <div className={block()}>
        <header className={element("header")}>
          <h1>Monte o seu evento</h1>
          <p>
            Responda passo a passo: mostramos apenas espaços e serviços com
            disponibilidade real e o preço atualiza-se a cada escolha. No final
            reserva já, com sinal de apenas{" "}
            {selectedPack?.upfrontPercentage ?? 20}%.
          </p>
        </header>
        <div className={element("content")}>
          <div className={element("chat")}>
            <AssistantBubble>
              Olá! 👋 Sou o assistente de eventos da RINU. Vou ajudá-lo a
              montar e reservar o seu evento em poucos passos.
            </AssistantBubble>

            {history.map((entry, index) => (
              <div key={index} className={element("exchange")}>
                <AssistantBubble>{entry.question}</AssistantBubble>
                <UserBubble>{entry.answer}</UserBubble>
              </div>
            ))}

            {step === "event-type" && (
              <EventTypeStep
                eventType={eventType}
                setEventType={setEventType}
                cities={cities}
                city={city}
                setCity={setCity}
                onContinue={(label) => {
                  pushHistory(
                    "Que tipo de evento quer organizar e em que zona?",
                    label,
                  );
                  setStep("details");
                  trackStep("event_type", label);
                }}
              />
            )}

            {step === "details" && (
              <DetailsStep
                date={date}
                setDate={setDate}
                startEnd={startEnd}
                setStartEnd={setStartEnd}
                numPeople={numPeople}
                setNumPeople={setNumPeople}
                budget={budget}
                setBudget={setBudget}
                onContinue={(answer) => {
                  pushHistory(
                    "Para quando, a que horas, para quantas pessoas e com que budget?",
                    answer,
                  );
                  setStep("space");
                  trackStep("details", answer);
                }}
              />
            )}

            {step === "space" && basePacksQuery && (
              <SpaceStep
                eventType={eventType}
                city={city}
                date={date}
                startEnd={startEnd}
                numPeople={numPeople}
                budget={budget}
                basePacksQuery={basePacksQuery}
                onSelect={(searchResult, availablePacks) => {
                  setSelectedSpace(searchResult);
                  pushHistory(
                    "Estes são os 3 melhores espaços com disponibilidade real para o seu evento:",
                    `${searchResult.spaceName} · ${searchResult.address.city}`,
                  );
                  if (availablePacks.length === 1) {
                    setSelectedPackID(availablePacks[0].id);
                    setExtraSelection(
                      mandatorySelection(availablePacks[0], startEnd, numPeople),
                    );
                    setStep(
                      availablePacks[0].extras.length > 0
                        ? "services"
                        : "external-services",
                    );
                  } else {
                    setStep("pack");
                  }
                  trackStep("space_selected", searchResult.spaceName);
                }}
              />
            )}

            {step === "pack" && selectedSpace && basePacksQuery && (
              <PackStep
                space={selectedSpace}
                basePacksQuery={basePacksQuery}
                onBack={() => {
                  setSelectedSpace(null);
                  setStep("space");
                }}
                onSelect={(pack) => {
                  setSelectedPackID(pack.id);
                  setExtraSelection(
                    mandatorySelection(pack, startEnd, numPeople),
                  );
                  pushHistory(
                    `Packs disponíveis em ${selectedSpace.spaceName}:`,
                    `${pack.name}${pack.price ? ` · ${money(pack.price.value)}` : ""}`,
                  );
                  setStep(
                    pack.extras.length > 0 ? "services" : "external-services",
                  );
                  trackStep("pack_selected", pack.name);
                }}
              />
            )}

            {(step === "services" ||
              step === "review" ||
              step === "external-services") &&
              !selectedPack && (
                <div className={element("exchange")}>
                  <AssistantBubble>
                    <div className={element("loading")}>
                      <CircleLoader size={48} />
                      <p>A calcular o preço…</p>
                    </div>
                  </AssistantBubble>
                </div>
              )}

            {step === "services" && selectedPack && (
              <ServicesStep
                pack={selectedPack}
                startEnd={startEnd}
                numPeople={numPeople}
                extraSelection={extraSelection}
                setExtraSelection={setExtraSelection}
                isFetchingPrice={isFetchingPricedPacks}
                onContinue={() => {
                  const chosen = selectedPack.extras.filter(
                    (extra) => !!extraSelection[extra.id],
                  );
                  pushHistory(
                    `Que serviços do pack quer incluir?`,
                    chosen.length > 0
                      ? chosen.map((extra) => extra.description).join(", ")
                      : "Sem serviços do pack",
                  );
                  setStep("external-services");
                  trackStep("services_confirmed", String(chosen.length));
                }}
              />
            )}

            {step === "external-services" && selectedPack && basePacksQuery && (
              <ExternalServicesStep
                basePacksQuery={basePacksQuery}
                eventType={eventType}
                city={city}
                date={date}
                startEnd={startEnd}
                numPeople={numPeople}
                servicePacks={servicePacks}
                excludedSpaceIDs={[selectedSpace?.id ?? ""]}
                onAdd={(selection) => {
                  setServicePacks((current) => [...current, selection]);
                  trackStep("external_service_added", selection.pack.name);
                }}
                onRemove={(packID) => {
                  setServicePacks((current) =>
                    current.filter(({ pack }) => pack.id !== packID),
                  );
                }}
                onContinue={() => {
                  pushHistory(
                    "Quer adicionar serviços externos (catering, DJ, fotografia…)?",
                    servicePacks.length > 0
                      ? servicePacks
                          .map(
                            ({ pack, space }) =>
                              `${space.spaceName} (${money(pack.price?.value ?? 0)})`,
                          )
                          .join(", ")
                      : "Sem serviços externos",
                  );
                  setStep("review");
                  trackStep(
                    "external_services_confirmed",
                    String(servicePacks.length),
                  );
                }}
              />
            )}

            {step === "review" && selectedSpace && selectedPack && (
              <ReviewStep
                space={selectedSpace}
                pack={selectedPack}
                eventTypeLabel={eventTypeLabel}
                date={date}
                startEnd={startEnd}
                numPeople={numPeople}
                layout={layout}
                setLayout={setLayout}
                total={total}
                servicePacks={servicePacks}
                paymentBreakdown={paymentBreakdown}
                isFetchingPrice={isFetchingPricedPacks}
                isLoggedIn={!!session}
                extraSelection={extraSelection}
                onLoginNeeded={() => {
                  trackStep("booking_forceLogIn");
                  setSessionSearchParams({
                    action: "login",
                    source: "builder",
                    otp: null,
                    username: null,
                  });
                }}
                onBooked={(bookingID) => {
                  trackStep("booking_created", bookingID);
                  routerPush(`/book?bookingID=${bookingID}`);
                }}
              />
            )}

            {step !== "event-type" && (
              <div className={element("restart")}>
                <TextButton text="Recomeçar do início" onClick={restart} />
              </div>
            )}
          </div>

          <BuilderSummary
            eventTypeLabel={eventTypeLabel}
            date={date}
            startEnd={startEnd}
            numPeople={numPeople}
            budget={budget}
            space={selectedSpace}
            pack={selectedPack}
            extraSelection={extraSelection}
            servicePacks={servicePacks}
            total={total}
            paymentBreakdown={paymentBreakdown}
          />
        </div>
        {total > 0 && (
          <div className={element("total-bar")}>
            <span>
              Total
              {paymentBreakdown?.isPartial
                ? ` · hoje ${money(paymentBreakdown.todayAmount)}`
                : ""}
            </span>
            <strong>{money(total)}</strong>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

function mandatorySelection(
  pack: Pack,
  startEnd: { start: TimeDuration | null; end: TimeDuration | null },
  numPeople: number | undefined,
): ExtraSelectionMap {
  const eventHours =
    startEnd.start && startEnd.end
      ? Math.max(startEnd.end.number - startEnd.start.number, 0)
      : 0;
  return Object.fromEntries(
    pack.extras
      .filter((extra) => extra.mandatory)
      .map((extra) => [
        extra.id,
        {
          hours: resolveExtraHours(extra, eventHours, null),
          pax: resolveExtraPax(extra, numPeople ?? 0, null),
        },
      ]),
  );
}

const AssistantBubble = ({ children }: { children: React.ReactNode }) => (
  <div className={element("bubble", { assistant: true })}>
    <span className={element("bubble__avatar")} aria-hidden>
      R
    </span>
    <div className={element("bubble__content")}>{children}</div>
  </div>
);

const UserBubble = ({ children }: { children: React.ReactNode }) => (
  <div className={element("bubble", { user: true })}>
    <div className={element("bubble__content")}>{children}</div>
  </div>
);

// --- Steps -----------------------------------------------------------------

const MAIN_EVENT_TYPE_IDS = [
  "corporate-event",
  "birthday",
  "conference",
  "team-building",
  "wedding",
  "christmas-party",
] satisfies SpaceEventType[];

const EventTypeStep = ({
  eventType,
  setEventType,
  cities,
  city,
  setCity,
  onContinue,
}: {
  eventType: SpaceEventType | null;
  setEventType: (eventType: SpaceEventType | null) => void;
  cities: City[];
  city: City | null;
  setCity: (city: City | null) => void;
  onContinue: (label: string) => void;
}) => {
  const [showErrors, setShowErrors] = useState(false);

  const mainOptions = MAIN_EVENT_TYPE_IDS.map(
    (id) => SPACE_EVENT_TYPES_FLAT.find((option) => option.id === id)!,
  ).filter(Boolean);

  const submit = () => {
    setShowErrors(true);
    if (!eventType || !city) return;
    const label =
      SPACE_EVENT_TYPES_FLAT.find((option) => option.id === eventType)?.label ??
      eventType;
    onContinue(`${label} · ${city.Name}`);
  };

  return (
    <div className={element("exchange")}>
      <AssistantBubble>
        Que tipo de evento quer organizar e em que zona?
        <div className={element("chips")}>
          {mainOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={element("chip", { selected: eventType === option.id })}
              onClick={() => setEventType(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className={element("form-grid")}>
          <EventTypeSelect
            eventTypeOptions={allEventTypeOptions}
            eventType={eventType}
            setEventType={setEventType}
            label="Tipo de evento"
            invalid={showErrors && !eventType}
          />
          <InputSelect
            label="Zona do país"
            value={city?.Name}
            onChange={(name) =>
              setCity(cities.find(({ Name }) => Name === name) ?? null)
            }
            options={cities.map(({ Name }) => ({ id: Name, text: Name }))}
            invalid={showErrors && !city}
          />
        </div>
        <Button type="primary" label="Continuar" onClick={submit} />
      </AssistantBubble>
    </div>
  );
};

const MIN_TOTAL_BUDGET = 200;

const DetailsStep = ({
  date,
  setDate,
  startEnd,
  setStartEnd,
  numPeople,
  setNumPeople,
  budget,
  setBudget,
  onContinue,
}: {
  date: CalendarDate | null;
  setDate: (date: CalendarDate | null) => void;
  startEnd: { start: TimeDuration | null; end: TimeDuration | null };
  setStartEnd: (startEnd: {
    start: TimeDuration | null;
    end: TimeDuration | null;
  }) => void;
  numPeople: number | undefined;
  setNumPeople: (numPeople: number | undefined) => void;
  budget: number | undefined;
  setBudget: (budget: number | undefined) => void;
  onContinue: (answer: string) => void;
}) => {
  const [showErrors, setShowErrors] = useState(false);

  const hasInvalidBudget = !!budget && budget < MIN_TOTAL_BUDGET;

  const submit = () => {
    setShowErrors(true);
    if (
      !date ||
      !startEnd.start ||
      !startEnd.end ||
      !numPeople ||
      !budget ||
      hasInvalidBudget
    ) {
      return;
    }

    onContinue(
      `${date.toString()} · ${startEnd.start.timeLabel}–${startEnd.end.timeLabel} · ${formatInt(numPeople)} pessoas · até ${money(budget)}`,
    );
  };

  return (
    <div className={element("exchange")}>
      <AssistantBubble>
        Para quando, a que horas, para quantas pessoas e com que budget?
        <div className={element("form-grid")}>
          <InputDate
            label="Data do evento"
            value={date}
            onChange={setDate}
            min={today(getLocalTimeZone()).add({ days: 1 })}
            invalid={showErrors && !date}
          />
          <InputTimeRange
            label="Horário"
            start={startEnd.start}
            end={startEnd.end}
            onChange={(start, end) => setStartEnd({ start, end })}
            invalid={showErrors && (!startEnd.start || !startEnd.end)}
          />
          <InputNumber
            label="Nº de pessoas"
            value={numPeople}
            onChange={setNumPeople}
            allowNegative={false}
            decimalScale={0}
            suffix={numPeople === 1 ? " pessoa" : " pessoas"}
            invalid={showErrors && !numPeople}
          />
          <InputNumber
            label="Budget total"
            value={budget}
            onChange={setBudget}
            allowNegative={false}
            decimalScale={0}
            suffix=" €"
            invalid={showErrors && (!budget || hasInvalidBudget)}
            error={
              hasInvalidBudget
                ? "O budget deve ser o valor total do evento e não o valor por pessoa"
                : undefined
            }
          />
        </div>
        <Button
          type="primary"
          label="Ver espaços disponíveis"
          onClick={submit}
        />
      </AssistantBubble>
    </div>
  );
};

type BasePacksQuery = {
  date: string;
  start: string;
  end: string;
  num_persons: number;
  extras: string;
};

const useAvailableSpaces = ({
  journey,
  eventType,
  city,
  attributes,
  date,
  startEnd,
  numPeople,
  basePacksQuery,
  enabled = true,
}: {
  journey: "venues" | "services";
  eventType: SpaceEventType | null;
  city?: City | null;
  attributes?: string[];
  date: CalendarDate | null;
  startEnd: { start: TimeDuration | null; end: TimeDuration | null };
  numPeople: number | undefined;
  basePacksQuery: BasePacksQuery;
  enabled?: boolean;
}) => {
  const fetchApi = useFetch();

  const searchResults = useSearchResults({
    query: {
      eventType: eventType ?? undefined,
      journey,
      attributes: attributes as never,
      date: date?.toString(),
      start: startEnd.start?.string,
      end: startEnd.end?.string,
      numPeople,
      top: city?.Top,
      bottom: city?.Bottom,
      left: city?.Left,
      right: city?.Right,
      pageSize: 18,
      mode: "search",
    },
    options: { enabled },
  });

  const packQueries = useQueries({
    queries: (enabled ? (searchResults ?? []) : []).map((searchResult) => ({
      queryKey: ["builder-space-packs", searchResult.id, basePacksQuery],
      queryFn: () =>
        fetchApi(
          "public/packs",
          `space/${searchResult.id}`,
          undefined,
          undefined,
          basePacksQuery,
        ).then((packs: any[]) => packs.map((pack) => new Pack(pack))),
      staleTime: 5 * 60_000,
      retry: 1,
    })),
  });

  const isLoading =
    enabled && (!searchResults || packQueries.some((query) => query.isLoading));

  const availableSpaces = useMemo(() => {
    if (!enabled || !searchResults) return [];
    return searchResults
      .map((searchResult, index) => {
        const packs = (packQueries[index]?.data ?? []).filter(isPackBookable);
        return { searchResult, packs };
      })
      .filter(({ packs }) => packs.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, searchResults, ...packQueries.map((query) => query.data)]);

  return { isLoading, availableSpaces };
};

const SpaceStep = ({
  eventType,
  city,
  date,
  startEnd,
  numPeople,
  budget,
  basePacksQuery,
  onSelect,
}: {
  eventType: SpaceEventType | null;
  city: City | null;
  date: CalendarDate | null;
  startEnd: { start: TimeDuration | null; end: TimeDuration | null };
  numPeople: number | undefined;
  budget: number | undefined;
  basePacksQuery: BasePacksQuery;
  onSelect: (searchResult: SearchResult, availablePacks: Pack[]) => void;
}) => {
  const [visibleCount, setVisibleCount] = useState(3);

  const { isLoading, availableSpaces } = useAvailableSpaces({
    journey: "venues",
    eventType,
    city,
    date,
    startEnd,
    numPeople,
    basePacksQuery,
  });

  // Spaces within the budget come first, but the rest stay reachable.
  const sortedSpaces = useMemo(() => {
    if (!budget) return availableSpaces;
    const minPriceOf = (packs: Pack[]) =>
      Math.min(...packs.map((pack) => pack.price?.value ?? Infinity));
    return [...availableSpaces].sort((a, b) => {
      const aOver = minPriceOf(a.packs) > budget ? 1 : 0;
      const bOver = minPriceOf(b.packs) > budget ? 1 : 0;
      return aOver - bOver;
    });
  }, [availableSpaces, budget]);

  const options = sortedSpaces.slice(0, visibleCount);

  return (
    <div className={element("exchange")}>
      <AssistantBubble>
        Estes são os {Math.min(availableSpaces.length || 3, 3)} melhores
        espaços com disponibilidade real para o seu evento:
        {isLoading ? (
          <div className={element("loading")}>
            <CircleLoader size={48} />
            <p>A confirmar disponibilidade e preços…</p>
          </div>
        ) : options.length === 0 ? (
          <p className={element("empty")}>
            Não encontrámos espaços com packs disponíveis para estes critérios.
            Experimente alterar a data, o horário ou o número de pessoas, ou{" "}
            <TextButton text="peça um orçamento" href="/quote-request" />.
          </p>
        ) : (
          <>
            <div className={element("options")}>
              {options.map(({ searchResult, packs }) => (
                <OfferCard
                  key={searchResult.id}
                  searchResult={searchResult}
                  packs={packs}
                  budget={budget}
                  onChoose={() => onSelect(searchResult, packs)}
                />
              ))}
            </div>
            {sortedSpaces.length > visibleCount && (
              <TextButton
                text="Mostrar mais espaços"
                onClick={() => setVisibleCount((count) => count + 3)}
              />
            )}
          </>
        )}
      </AssistantBubble>
    </div>
  );
};

// Shared rich card for both spaces and services: photo swipe, description
// (capped at 600 chars), available-packs count and a price-from column.
const OfferCard = ({
  searchResult,
  packs,
  budget,
  ctaLabel = "Escolher",
  onChoose,
}: {
  searchResult: SearchResult;
  packs: Pack[];
  budget?: number | undefined;
  ctaLabel?: string;
  onChoose: () => void;
}) => {
  const minPrice = Math.min(
    ...packs.map((pack) => pack.price?.value ?? Infinity),
  );
  const numPacks = packs.length;
  const description =
    searchResult.description.length > 600
      ? `${searchResult.description.slice(0, 600)}…`
      : searchResult.description;

  return (
    <div className={element("space-card")}>
      <div className={element("space-card__media")}>
        <div className={element("space-card__media__photo")}>
          {searchResult.photoURLs.length > 0 && (
            <PhotoCarousel
              photoURLs={searchResult.photoURLs}
              showPrevNextButtons
              lazyLoading
            />
          )}
        </div>
        <TextButton
          text="Mais detalhes"
          href={`/space/${searchResult.id}`}
          target="_blank"
          size="small"
        />
      </div>
      <div className={element("space-card__info")}>
        <p className={element("space-card__title")}>
          {searchResult.spaceName}
          {searchResult.recommended && (
            <Tag text="Recomendado" type="info" size="small" />
          )}
          {!!budget && Number.isFinite(minPrice) && minPrice > budget && (
            <Tag text="Acima do budget" type="warning" size="small" />
          )}
        </p>
        <p className={element("space-card__detail")}>
          {searchResult.address.city}
          {searchResult.capacity > 0 && (
            <>
              {" · "}
              <IconUserInterfaceMiscellaneousUsers />{" "}
              {formatInt(searchResult.capacity)}
            </>
          )}
          {" · "}
          {numPacks} {numPacks === 1 ? "pack disponível" : "packs disponíveis"}
        </p>
        {!!description && (
          <p className={element("space-card__description")}>{description}</p>
        )}
      </div>
      <div className={element("space-card__side")}>
        {Number.isFinite(minPrice) && (
          <div className={element("space-card__price")}>
            <span>desde</span>
            <strong>{money(minPrice)}</strong>
            <span>para o seu evento</span>
          </div>
        )}
        <Button type="primary" label={ctaLabel} onClick={onChoose} />
      </div>
    </div>
  );
};

const PackStep = ({
  space,
  basePacksQuery,
  onBack,
  onSelect,
}: {
  space: SearchResult;
  basePacksQuery: BasePacksQuery;
  onBack: () => void;
  onSelect: (pack: Pack) => void;
}) => {
  const { data: allPacks, isLoading } = usePacks({
    spaceID: space.id,
    query: basePacksQuery,
    mode: "public",
  });

  const packs = useMemo(
    () => (allPacks ?? []).filter(isPackBookable),
    [allPacks],
  );

  return (
    <div className={element("exchange")}>
      <AssistantBubble>
        Packs disponíveis em {space.spaceName}:
        {isLoading ? (
          <div className={element("loading")}>
            <CircleLoader size={48} />
          </div>
        ) : packs.length === 0 ? (
          <p className={element("empty")}>
            Este espaço deixou de ter packs disponíveis.{" "}
            <TextButton text="Escolher outro espaço" onClick={onBack} />
          </p>
        ) : (
          <div className={element("options")}>
            {packs.map((pack) => (
              <div key={pack.id} className={element("option")}>
                <div className={element("option__info")}>
                  <p className={element("option__title")}>{pack.name}</p>
                  {!!pack.description && (
                    <p className={element("option__detail")}>
                      {pack.description}
                    </p>
                  )}
                </div>
                <div className={element("option__actions")}>
                  {!!pack.price && (
                    <p className={element("option__price")}>
                      <b>{money(pack.price.value)}</b>
                    </p>
                  )}
                  <Button
                    type="primary"
                    label="Escolher"
                    onClick={() => onSelect(pack)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {packs.length > 0 && (
          <TextButton text="Escolher outro espaço" onClick={onBack} />
        )}
      </AssistantBubble>
    </div>
  );
};

// Shared chips + per-extra quantity/price UI for a pack's optional services.
const ExtrasSelector = ({
  pack,
  startEnd,
  numPeople,
  extraSelection,
  setExtraSelection,
}: {
  pack: Pack;
  startEnd: { start: TimeDuration | null; end: TimeDuration | null };
  numPeople: number | undefined;
  extraSelection: ExtraSelectionMap;
  setExtraSelection: (
    update: (current: ExtraSelectionMap) => ExtraSelectionMap,
  ) => void;
}) => {
  const eventHours =
    startEnd.start && startEnd.end
      ? Math.max(startEnd.end.number - startEnd.start.number, 0)
      : 0;
  const eventPax = numPeople ?? 0;

  const toggleExtra = (extra: Extra) => {
    if (extra.mandatory) return;
    setExtraSelection((current) => {
      const next = { ...current };
      if (next[extra.id]) {
        delete next[extra.id];
      } else {
        next[extra.id] = {
          hours: resolveExtraHours(extra, eventHours, null),
          pax: resolveExtraPax(extra, eventPax, null),
        };
      }
      return next;
    });
  };

  const updateQuantity = (
    extra: Extra,
    field: "hours" | "pax",
    value: number | undefined,
  ) => {
    setExtraSelection((current) => {
      const existing = current[extra.id];
      if (!existing) return current;
      const hours =
        field === "hours"
          ? resolveExtraHours(extra, eventHours, value ?? null)
          : existing.hours;
      const pax =
        field === "pax"
          ? resolveExtraPax(extra, eventPax, value ?? null)
          : existing.pax;
      return { ...current, [extra.id]: { hours, pax } };
    });
  };

  const serverExtraValues = new Map(
    (pack.price?.extras ?? []).map((extra) => [extra.id, extra.value]),
  );

  return (
    <>
      <div className={element("chips")}>
        {pack.extras.map((extra) => {
          const selected = !!extraSelection[extra.id];
          return (
            <button
              key={extra.id}
              type="button"
              className={element("chip", {
                selected,
                locked: extra.mandatory,
              })}
              onClick={() => toggleExtra(extra)}
              aria-pressed={selected}
            >
              {extra.description}
              {extra.mandatory && " · incluído"}
            </button>
          );
        })}
      </div>
      <div className={element("extras")}>
        {pack.extras
          .filter((extra) => !!extraSelection[extra.id])
          .map((extra) => {
            const quantities = extraSelection[extra.id];
            const value =
              serverExtraValues.get(extra.id) ??
              computeExtraPrice(extra, quantities.hours, quantities.pax);
            return (
              <div key={extra.id} className={element("extras__item")}>
                <Stack
                  row
                  gap="0.75rem"
                  alignItems="center"
                  flexWrap="wrap"
                  justifyContent="space-between"
                >
                  <Stack row gap="0.375rem" alignItems="center">
                    <span className={element("extras__item__name")}>
                      {extra.description}
                    </span>
                    <Tooltip
                      content={extraPriceExplanation(extra, quantities)}
                      visibleOnTouchDevice
                    >
                      <span
                        className={element("extras__item__info")}
                        tabIndex={0}
                        role="button"
                        aria-label={`Como é calculado o preço de ${extra.description}`}
                      >
                        <IconUserInterfaceMiscellaneousInfo />
                      </span>
                    </Tooltip>
                  </Stack>
                  <span className={element("extras__item__price")}>
                    {money(value)}
                  </span>
                </Stack>
                {(usesExtraHours(extra) || usesExtraPax(extra)) && (
                  <Stack
                    row
                    gap="0.75rem"
                    alignItems="center"
                    flexWrap="wrap"
                    className={element("extras__item__details")}
                  >
                    {usesExtraHours(extra) && (
                      <InputNumber
                        label="Horas"
                        value={quantities.hours ?? undefined}
                        onChange={(value) =>
                          updateQuantity(extra, "hours", value)
                        }
                        allowNegative={false}
                        suffix=" h"
                      />
                    )}
                    {usesExtraPax(extra) && (
                      <InputNumber
                        label="Pessoas"
                        value={quantities.pax ?? undefined}
                        onChange={(value) =>
                          updateQuantity(extra, "pax", value)
                        }
                        allowNegative={false}
                        decimalScale={0}
                        suffix=" pax"
                      />
                    )}
                  </Stack>
                )}
              </div>
            );
          })}
      </div>
    </>
  );
};

const ServicesStep = ({
  pack,
  startEnd,
  numPeople,
  extraSelection,
  setExtraSelection,
  isFetchingPrice,
  onContinue,
}: {
  pack: Pack;
  startEnd: { start: TimeDuration | null; end: TimeDuration | null };
  numPeople: number | undefined;
  extraSelection: ExtraSelectionMap;
  setExtraSelection: (
    update: (current: ExtraSelectionMap) => ExtraSelectionMap,
  ) => void;
  isFetchingPrice: boolean;
  onContinue: () => void;
}) => (
  <div className={element("exchange")}>
    <AssistantBubble>
      Este pack inclui serviços opcionais. Quais quer adicionar?
      <ExtrasSelector
        pack={pack}
        startEnd={startEnd}
        numPeople={numPeople}
        extraSelection={extraSelection}
        setExtraSelection={setExtraSelection}
      />
      <Button
        type="primary"
        label={
          pack.price ? `Continuar · ${money(pack.price.value)}` : "Continuar"
        }
        loading={isFetchingPrice}
        onClick={onContinue}
      />
    </AssistantBubble>
  </div>
);

// Inline extras picker for an external service pack (no chat bubble of its
// own — it renders inside the external-services step).
const ServiceExtrasPicker = ({
  pack,
  spaceName,
  startEnd,
  numPeople,
  extraSelection,
  setExtraSelection,
  isPricing,
  onConfirm,
  onBack,
}: {
  pack: Pack;
  spaceName: string;
  startEnd: { start: TimeDuration | null; end: TimeDuration | null };
  numPeople: number | undefined;
  extraSelection: ExtraSelectionMap;
  setExtraSelection: (
    update: (current: ExtraSelectionMap) => ExtraSelectionMap,
  ) => void;
  isPricing: boolean;
  onConfirm: () => void;
  onBack: () => void;
}) => (
  <>
    <p>
      Serviços opcionais de {spaceName} ({pack.name}):
    </p>
    <ExtrasSelector
      pack={pack}
      startEnd={startEnd}
      numPeople={numPeople}
      extraSelection={extraSelection}
      setExtraSelection={setExtraSelection}
    />
    <Button
      type="primary"
      label="Adicionar ao evento"
      loading={isPricing}
      onClick={onConfirm}
    />
    <TextButton text="Escolher outro serviço" onClick={onBack} />
  </>
);

function extraPriceExplanation(
  extra: Extra,
  quantities: { hours: number | null; pax: number | null },
) {
  const parts: string[] = [];
  if (extra.fixedPrice > 0) parts.push(`${money(extra.fixedPrice)} fixo`);
  if (extra.priceHour > 0) {
    parts.push(
      `${money(extra.priceHour)}/hora${quantities.hours != null ? ` × ${quantities.hours}h` : ""}`,
    );
  }
  if (extra.pricePax > 0) {
    parts.push(
      `${money(extra.pricePax)}/pessoa${quantities.pax != null ? ` × ${quantities.pax}` : ""}`,
    );
  }
  const formula = parts.length > 0 ? parts.join(" + ") : "Incluído no pack";
  return extra.tooltip ? `${extra.tooltip} — ${formula}` : formula;
}

const ExternalServicesStep = ({
  basePacksQuery,
  eventType,
  city,
  date,
  startEnd,
  numPeople,
  servicePacks,
  excludedSpaceIDs,
  onAdd,
  onRemove,
  onContinue,
}: {
  basePacksQuery: BasePacksQuery;
  eventType: SpaceEventType | null;
  city: City | null;
  date: CalendarDate | null;
  startEnd: { start: TimeDuration | null; end: TimeDuration | null };
  numPeople: number | undefined;
  servicePacks: ServicePackSelection[];
  excludedSpaceIDs: string[];
  onAdd: (selection: ServicePackSelection) => void;
  onRemove: (packID: string) => void;
  onContinue: () => void;
}) => {
  const fetchApi = useFetch();
  const { data: availableAttributes = [] } = useAttributes();
  const categories = getServiceTabFilters(availableAttributes).filter(
    ({ id }) => id !== "all",
  );

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<string | null>(null);
  // When a chosen service has multiple packs, let the client pick which one.
  const [pendingService, setPendingService] = useState<{
    space: SearchResult;
    packs: Pack[];
  } | null>(null);
  // A chosen service pack whose optional extras the client is configuring.
  const [extrasService, setExtrasService] = useState<{
    space: SearchResult;
    pack: Pack;
  } | null>(null);
  const [serviceExtraSelection, setServiceExtraSelection] =
    useState<ExtraSelectionMap>({});
  const [isPricingService, setIsPricingService] = useState(false);

  const handleAdd = (selection: ServicePackSelection) => {
    onAdd(selection);
    // Reset the picker and ask whether to add another service.
    setActiveCategory(null);
    setPendingService(null);
    setExtrasService(null);
    setServiceExtraSelection({});
    setJustAdded(selection.space.spaceName);
  };

  const choosePack = (space: SearchResult, pack: Pack) => {
    if (pack.extras.length > 0) {
      setExtrasService({ space, pack });
      setServiceExtraSelection(mandatorySelection(pack, startEnd, numPeople));
      setPendingService(null);
    } else {
      handleAdd({ pack, space, extraSelection: {} });
    }
  };

  const handleChoose = (space: SearchResult, packs: Pack[]) => {
    if (packs.length === 1) {
      choosePack(space, packs[0]);
    } else {
      setPendingService({ space, packs });
    }
  };

  // Re-price the chosen service pack with the selected extras (same engine
  // the server uses at booking time) before adding it to the plan.
  const confirmServiceExtras = async () => {
    if (!extrasService) return;
    setIsPricingService(true);
    try {
      const selections = extraParamsFromRecord(
        Object.fromEntries(
          Object.entries(serviceExtraSelection).map(([id, quantities]) => [
            id,
            {
              ...(quantities.hours != null ? { hours: quantities.hours } : {}),
              ...(quantities.pax != null ? { pax: quantities.pax } : {}),
            },
          ]),
        ),
      );
      const query = {
        ...basePacksQuery,
        extras: Object.keys(serviceExtraSelection).join(","),
        ...(selections.length > 0
          ? { extra_params: serializeExtraParamsQuery(selections) }
          : {}),
      };
      const pricedPacks: Pack[] = await fetchApi(
        "public/packs",
        `space/${extrasService.space.id}`,
        undefined,
        undefined,
        query,
      ).then((packs: any[]) => packs.map((pack) => new Pack(pack)));
      const pricedPack =
        pricedPacks.find((pack) => pack.id === extrasService.pack.id) ??
        extrasService.pack;
      handleAdd({
        pack: pricedPack,
        space: extrasService.space,
        extraSelection: serviceExtraSelection,
      });
    } finally {
      setIsPricingService(false);
    }
  };

  const { isLoading, availableSpaces } = useAvailableSpaces({
    journey: "services",
    eventType,
    city,
    attributes: activeCategory ? [activeCategory] : undefined,
    date,
    startEnd,
    numPeople,
    basePacksQuery,
    enabled: !!activeCategory && !pendingService && !extrasService,
  });

  const addedPackIDs = new Set(servicePacks.map(({ pack }) => pack.id));
  const addedSpaceIDs = new Set(servicePacks.map(({ space }) => space.id));

  const offers = availableSpaces.filter(
    ({ searchResult }) =>
      !excludedSpaceIDs.includes(searchResult.id) &&
      !addedSpaceIDs.has(searchResult.id),
  );

  const canAddMore = servicePacks.length < MAX_SERVICE_PACKS;

  return (
    <div className={element("exchange")}>
      <AssistantBubble>
        {justAdded ? (
          <>
            ✅ <b>{justAdded}</b> adicionado ao seu evento! Quer adicionar mais
            algum serviço externo? Escolha outra categoria ou continue.
          </>
        ) : (
          <>
            Quer adicionar serviços externos (catering, DJ, fotografia…)? Pode
            juntar vários ao mesmo booking.
          </>
        )}
        {!pendingService && !extrasService && (
          <div className={element("chips")}>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={element("chip", {
                  selected: activeCategory === category.id,
                })}
                onClick={() => {
                  setJustAdded(null);
                  setActiveCategory(
                    activeCategory === category.id ? null : category.id,
                  );
                }}
              >
                {category.label}
              </button>
            ))}
          </div>
        )}
        {extrasService ? (
          <ServiceExtrasPicker
            pack={extrasService.pack}
            spaceName={extrasService.space.spaceName}
            startEnd={startEnd}
            numPeople={numPeople}
            extraSelection={serviceExtraSelection}
            setExtraSelection={setServiceExtraSelection}
            isPricing={isPricingService}
            onConfirm={() => void confirmServiceExtras()}
            onBack={() => {
              setExtrasService(null);
              setServiceExtraSelection({});
            }}
          />
        ) : pendingService ? (
          <>
            <p>Escolha o pack de {pendingService.space.spaceName}:</p>
            <div className={element("options")}>
              {pendingService.packs.map((pack) => (
                <div key={pack.id} className={element("option")}>
                  <div className={element("option__info")}>
                    <p className={element("option__title")}>{pack.name}</p>
                    {!!pack.description && (
                      <p className={element("option__detail")}>
                        {pack.description}
                      </p>
                    )}
                  </div>
                  <div className={element("option__actions")}>
                    {!!pack.price && (
                      <p className={element("option__price")}>
                        <b>{money(pack.price.value)}</b>
                      </p>
                    )}
                    <Button
                      type="primary"
                      label="Escolher"
                      disabled={!canAddMore || addedPackIDs.has(pack.id)}
                      onClick={() => choosePack(pendingService.space, pack)}
                    />
                  </div>
                </div>
              ))}
            </div>
            <TextButton
              text="Escolher outro serviço"
              onClick={() => setPendingService(null)}
            />
          </>
        ) : (
          !!activeCategory &&
          (isLoading ? (
            <div className={element("loading")}>
              <CircleLoader size={48} />
              <p>A confirmar disponibilidade…</p>
            </div>
          ) : offers.length === 0 ? (
            <p className={element("empty")}>
              Sem serviços disponíveis nesta categoria para a data e horário do
              evento.
            </p>
          ) : (
            <div className={element("options")}>
              {offers.slice(0, 4).map(({ searchResult, packs }) => (
                <OfferCard
                  key={searchResult.id}
                  searchResult={searchResult}
                  packs={packs}
                  ctaLabel="Escolher"
                  onChoose={() => handleChoose(searchResult, packs)}
                />
              ))}
            </div>
          ))
        )}
        {!extrasService && servicePacks.length > 0 && (
          <div className={element("added-services")}>
            <p>Serviços adicionados:</p>
            {servicePacks.map(({ pack, space }) => (
              <div key={pack.id} className={element("added-services__item")}>
                <span>
                  {space.spaceName} · {money(pack.price?.value ?? 0)}
                </span>
                <IconButton
                  ariaLabel="Remover serviço"
                  icon={<IconUserInterfaceActionsDelete />}
                  onClick={() => onRemove(pack.id)}
                  showTooltip={false}
                />
              </div>
            ))}
          </div>
        )}
        {!extrasService && (
          <Button
            type="primary"
            label={
              servicePacks.length > 0
                ? "Continuar com estes serviços"
                : "Continuar sem serviços externos"
            }
            onClick={onContinue}
          />
        )}
      </AssistantBubble>
    </div>
  );
};

const ReviewStep = ({
  space,
  pack,
  eventTypeLabel,
  date,
  startEnd,
  numPeople,
  layout,
  setLayout,
  total,
  servicePacks,
  paymentBreakdown,
  isFetchingPrice,
  isLoggedIn,
  extraSelection,
  onLoginNeeded,
  onBooked,
}: {
  space: SearchResult;
  pack: Pack;
  eventTypeLabel: string;
  date: CalendarDate | null;
  startEnd: { start: TimeDuration | null; end: TimeDuration | null };
  numPeople: number | undefined;
  layout: string | null;
  setLayout: (layout: string | null) => void;
  total: number;
  servicePacks: ServicePackSelection[];
  paymentBreakdown: ReturnType<typeof computePackPaymentBreakdown> | null;
  isFetchingPrice: boolean;
  isLoggedIn: boolean;
  extraSelection: ExtraSelectionMap;
  onLoginNeeded: () => void;
  onBooked: (bookingID: string) => void;
}) => {
  const [error, setError] = useState<string | null>(null);

  const availableCapacities = pack.formattedCapacities.filter(
    (capacity) => capacity.people >= (numPeople ?? 0),
  );
  const chosenLayout =
    availableCapacities.find((capacity) => capacity.id === layout)?.id ??
    (availableCapacities.length === 1 ? availableCapacities[0].id : null);

  const { mutateAsync: createBooking, isPending: isPendingCreateBooking } =
    useCreateBooking();

  const book = async () => {
    setError(null);

    if (!isLoggedIn) {
      onLoginNeeded();
      return;
    }

    if (!chosenLayout) {
      setError("Escolha a disposição do espaço");
      return;
    }

    if (!date || !startEnd.start || !startEnd.end || !numPeople) return;

    try {
      const bookingID = await createBooking({
        spaceID: pack.spaceIDs?.[0] ?? space.id,
        packID: pack.id,
        layout: chosenLayout,
        numPeople,
        date: date.toString(),
        start: startEnd.start.string,
        end: startEnd.end.string,
        kind: "internal",
        extras: Object.keys(extraSelection),
        extraParams: Object.entries(extraSelection).map(([id, quantities]) => ({
          id,
          ...(quantities.hours != null ? { hours: quantities.hours } : {}),
          ...(quantities.pax != null ? { pax: quantities.pax } : {}),
        })),
        servicePacks: servicePacks.map(
          ({ pack: servicePack, extraSelection: serviceExtras }) => ({
            packID: servicePack.id,
            extras: Object.keys(serviceExtras),
            extraParams: Object.entries(serviceExtras).map(
              ([id, quantities]) => ({
                id,
                ...(quantities.hours != null ? { hours: quantities.hours } : {}),
                ...(quantities.pax != null ? { pax: quantities.pax } : {}),
              }),
            ),
          }),
        ),
      });
      onBooked(bookingID);
    } catch (e) {
      if ((e as Error).message.includes("already_booked")) {
        setError(
          "Este espaço acabou de ser reservado para este horário. Escolha outro horário ou espaço.",
        );
      } else if ((e as Error).message.includes("service_pack_unavailable")) {
        setError(
          "Um dos serviços externos deixou de estar disponível. Remova-o e tente novamente.",
        );
      } else {
        setError("Ocorreu um erro ao criar a reserva. Tente novamente.");
      }
    }
  };

  const selectedExtras = pack.extras.filter(
    (extra) => !!extraSelection[extra.id],
  );

  return (
    <div className={element("exchange")}>
      <AssistantBubble>
        Está quase! Confirme os detalhes da reserva:
        <div className={element("review")}>
          <p>
            <b>{pack.name}</b> — {space.spaceName} · {space.address.city}
          </p>
          <p className={element("review__detail")}>
            {eventTypeLabel} · {date?.toString()} · {startEnd.start?.timeLabel}
            –{startEnd.end?.timeLabel} · {formatInt(numPeople ?? 0)} pessoas
          </p>
          {selectedExtras.length > 0 && (
            <p className={element("review__detail")}>
              Serviços do pack:{" "}
              {selectedExtras.map((extra) => extra.description).join(", ")}
            </p>
          )}
          {servicePacks.length > 0 && (
            <p className={element("review__detail")}>
              Serviços externos:{" "}
              {servicePacks
                .map(
                  ({ pack: servicePack, space: serviceSpace }) =>
                    `${serviceSpace.spaceName} (${money(servicePack.price?.value ?? 0)})`,
                )
                .join(", ")}
            </p>
          )}
        </div>
        {availableCapacities.length > 1 && (
          <>
            <p>Como prefere a disposição do espaço?</p>
            <div className={element("chips")}>
              {availableCapacities.map((capacity) => (
                <button
                  key={capacity.id}
                  type="button"
                  className={element("chip", {
                    selected: chosenLayout === capacity.id,
                  })}
                  onClick={() => setLayout(capacity.id)}
                >
                  {capacity.text} · até {formatInt(capacity.people)}
                </button>
              ))}
            </div>
          </>
        )}
        <div className={element("review__payment")}>
          <Stack row justifyContent="space-between">
            <span>Total do evento</span>
            <b>{money(total)}</b>
          </Stack>
          {paymentBreakdown?.isPartial && (
            <>
              <Stack row justifyContent="space-between">
                <span>Paga hoje ({paymentBreakdown.upfrontPercentage}%)</span>
                <b>{money(paymentBreakdown.todayAmount)}</b>
              </Stack>
              <Stack row justifyContent="space-between">
                <span>
                  Restante até{" "}
                  {formatDate(paymentBreakdown.freeCancellationUntil)}
                </span>
                <span>{money(paymentBreakdown.laterAmount)}</span>
              </Stack>
            </>
          )}
        </div>
        {error && <InputError error={error} />}
        <Button
          type="primary"
          label={
            paymentBreakdown?.isPartial
              ? `Reservar agora · paga ${money(paymentBreakdown.todayAmount)} hoje`
              : `Reservar agora · ${money(total)}`
          }
          loading={isPendingCreateBooking || isFetchingPrice}
          onClick={() => void book()}
        />
        {!isLoggedIn && (
          <p className={element("review__detail")}>
            Vai precisar de iniciar sessão para concluir a reserva.
          </p>
        )}
      </AssistantBubble>
    </div>
  );
};

const BuilderSummary = ({
  eventTypeLabel,
  date,
  startEnd,
  numPeople,
  budget,
  space,
  pack,
  extraSelection,
  servicePacks,
  total,
  paymentBreakdown,
}: {
  eventTypeLabel: string;
  date: CalendarDate | null;
  startEnd: { start: TimeDuration | null; end: TimeDuration | null };
  numPeople: number | undefined;
  budget: number | undefined;
  space: SearchResult | null;
  pack: Pack | null;
  extraSelection: ExtraSelectionMap;
  servicePacks: ServicePackSelection[];
  total: number;
  paymentBreakdown: ReturnType<typeof computePackPaymentBreakdown> | null;
}) => {
  const baseValue =
    pack?.price != null
      ? pack.price.value -
        pack.price.extras.reduce((sum, extra) => sum + extra.value, 0)
      : null;

  return (
    <aside className={element("summary")}>
      <h2>O seu evento</h2>
      <div className={element("summary__meta")}>
        {!!eventTypeLabel && <Tag text={eventTypeLabel} size="small" />}
        {!!date && <Tag text={date.toString()} size="small" />}
        {!!startEnd.start && !!startEnd.end && (
          <Tag
            text={`${startEnd.start.timeLabel}–${startEnd.end.timeLabel}`}
            size="small"
          />
        )}
        {!!numPeople && (
          <Tag text={`${formatInt(numPeople)} pessoas`} size="small" />
        )}
        {!!budget && <Tag text={`Budget ${money(budget)}`} size="small" />}
      </div>
      {!space || !pack ? (
        <p className={element("summary__empty")}>
          À medida que escolher o espaço e os serviços, o resumo e o preço
          aparecem aqui.
        </p>
      ) : (
        <div className={element("summary__items")}>
          <div className={element("summary__item")}>
            <div className={element("summary__item__photo")}>
              {space.photoURLs?.[0] && (
                <Image alt="" src={space.photoURLs[0]} fill sizes="6rem" />
              )}
            </div>
            <div className={element("summary__item__info")}>
              <p className={element("summary__item__title")}>{pack.name}</p>
              <p className={element("summary__item__detail")}>
                {space.spaceName} · {space.address.city}
              </p>
            </div>
            {baseValue != null && (
              <span className={element("summary__item__value")}>
                {money(baseValue)}
              </span>
            )}
          </div>
          {pack.extras
            .filter((extra) => !!extraSelection[extra.id])
            .map((extra) => {
              const value = pack.price?.extras.find(
                ({ id }) => id === extra.id,
              )?.value;
              return (
                <div key={extra.id} className={element("summary__line")}>
                  <span>{extra.description}</span>
                  <span>{value != null ? money(value) : "—"}</span>
                </div>
              );
            })}
          {servicePacks.map(({ pack: servicePack, space: serviceSpace }) => (
            <div key={servicePack.id} className={element("summary__item")}>
              <div className={element("summary__item__photo")}>
                {serviceSpace.photoURLs?.[0] && (
                  <Image
                    alt=""
                    src={serviceSpace.photoURLs[0]}
                    fill
                    sizes="6rem"
                  />
                )}
              </div>
              <div className={element("summary__item__info")}>
                <p className={element("summary__item__title")}>
                  {serviceSpace.spaceName}
                </p>
                <p className={element("summary__item__detail")}>
                  {servicePack.name}
                </p>
              </div>
              <span className={element("summary__item__value")}>
                {money(servicePack.price?.value ?? 0)}
              </span>
            </div>
          ))}
        </div>
      )}
      <div className={element("summary__total")}>
        <span>
          Total
          {!!budget && total > budget && (
            <>
              {" "}
              <Tag text="Acima do budget" type="warning" size="small" />
            </>
          )}
        </span>
        <strong>{money(total)}</strong>
      </div>
      {paymentBreakdown?.isPartial && (
        <div className={element("summary__breakdown")}>
          <div>
            <span>Paga hoje ({paymentBreakdown.upfrontPercentage}%)</span>
            <b>{money(paymentBreakdown.todayAmount)}</b>
          </div>
          <div>
            <span>
              Restante até{" "}
              {formatDate(paymentBreakdown.freeCancellationUntil)}
            </span>
            <span>{money(paymentBreakdown.laterAmount)}</span>
          </div>
        </div>
      )}
      <p className={element("summary__disclaimer")}>
        Preços calculados em tempo real com base na oferta publicada. Reserva
        com pagamento seguro e sinal de{" "}
        {paymentBreakdown?.upfrontPercentage ?? 20}%.
      </p>
    </aside>
  );
};

export default BuilderPage;
