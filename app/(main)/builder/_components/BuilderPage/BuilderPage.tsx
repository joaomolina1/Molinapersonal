"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { useQueries } from "@tanstack/react-query";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";

import Button, { TextButton } from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import Tag from "@/_design_system/Tag";
import Tooltip from "@/_design_system/Tooltip";
import InputDate from "@/_design_system/InputDate";
import InputTimeRange from "@/_design_system/InputTimeRange";
import InputNumber from "@/_design_system/InputNumber";
import CircleLoader from "@/_design_system/CircleLoader";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import IconUserInterfaceMiscellaneousUsers from "@/_design_system/_icons/UserInterface/Miscellaneous/Users.svg";
import IconUserInterfaceMiscellaneousInfo from "@/_design_system/_icons/UserInterface/Miscellaneous/Info.svg";

import EventTypeSelect from "@/(main)/_components/EventTypeSelect";
import { allEventTypeOptions } from "@/(main)/search/_utils/attributes";
import {
  SPACE_EVENT_TYPES_FLAT,
  SpaceEventType,
} from "@/_constants/space/eventTypes";
import { SearchResult, useSearchResults } from "@/_models/search";
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
import { getPackPaymentBreakdown } from "@/_utils/packPayment";

import { createBEMClasses } from "@/_utils/classname";
import { TimeDuration, formatInt, formatMoney } from "@/_utils/number";
import { formatDate } from "@/_utils/date";
import { useFetch } from "@/_services/api";
import { useSession } from "@/_services/session";
import { useSessionSearchParams } from "@/_components/Header";
import { useRouterPush } from "@/_services/navigation";
import { ErrorBoundary } from "@/_services/sentry";

const { block, element } = createBEMClasses("builder-page");

type Step =
  | "event-type"
  | "details"
  | "space"
  | "pack"
  | "services"
  | "review";

type ChatEntry = {
  question: string;
  answer: string;
};

type ExtraSelectionMap = Record<string, { hours: number | null; pax: number | null }>;

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

  // Event basics
  const [eventType, setEventType] = useState<SpaceEventType | null>(null);
  const [date, setDate] = useState<CalendarDate | null>(null);
  const [startEnd, setStartEnd] = useState<{
    start: TimeDuration | null;
    end: TimeDuration | null;
  }>({ start: null, end: null });
  const [numPeople, setNumPeople] = useState<number | undefined>(undefined);

  // Selection
  const [selectedSpace, setSelectedSpace] = useState<SearchResult | null>(null);
  const [selectedPackID, setSelectedPackID] = useState<string | null>(null);
  const [extraSelection, setExtraSelection] = useState<ExtraSelectionMap>({});
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

  const paymentBreakdown =
    selectedPack && date
      ? getPackPaymentBreakdown(selectedPack, new Date(date.toString()))
      : null;

  const total = selectedPack?.price?.value ?? 0;

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
    setDate(null);
    setStartEnd({ start: null, end: null });
    setNumPeople(undefined);
    setSelectedSpace(null);
    setSelectedPackID(null);
    setExtraSelection({});
    setLayout(null);
    trackStep("restart");
  };

  return (
    <ErrorBoundary>
      <div className={block()}>
        <header className={element("header")}>
          <h1>Monte o seu evento</h1>
          <p>
            Responda passo a passo: mostramos apenas espaços com disponibilidade
            real e o preço atualiza-se a cada escolha. No final reserva já, com
            sinal de apenas {selectedPack?.upfrontPercentage ?? 20}%.
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
                onContinue={(label) => {
                  pushHistory("Que tipo de evento quer organizar?", label);
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
                onContinue={(answer) => {
                  pushHistory(
                    "Para quando, a que horas e para quantas pessoas?",
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
                date={date}
                startEnd={startEnd}
                numPeople={numPeople}
                basePacksQuery={basePacksQuery}
                onSelect={(searchResult, availablePacks) => {
                  setSelectedSpace(searchResult);
                  pushHistory(
                    "Estes espaços têm disponibilidade real para o seu evento. Qual prefere?",
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
                        : "review",
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
                  setStep(pack.extras.length > 0 ? "services" : "review");
                  trackStep("pack_selected", pack.name);
                }}
              />
            )}

            {(step === "services" || step === "review") && !selectedPack && (
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
                    "Que serviços quer adicionar?",
                    chosen.length > 0
                      ? chosen.map((extra) => extra.description).join(", ")
                      : "Sem serviços adicionais",
                  );
                  setStep("review");
                  trackStep("services_confirmed", String(chosen.length));
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
            space={selectedSpace}
            pack={selectedPack}
            extraSelection={extraSelection}
            total={total}
            paymentBreakdown={paymentBreakdown}
          />
        </div>
        {total > 0 && (
          <div className={element("total-bar")}>
            <span>
              Total{paymentBreakdown?.isPartial ? ` · hoje ${money(paymentBreakdown.todayAmount)}` : ""}
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
  onContinue,
}: {
  eventType: SpaceEventType | null;
  setEventType: (eventType: SpaceEventType | null) => void;
  onContinue: (label: string) => void;
}) => {
  const mainOptions = MAIN_EVENT_TYPE_IDS.map(
    (id) => SPACE_EVENT_TYPES_FLAT.find((option) => option.id === id)!,
  ).filter(Boolean);

  return (
    <div className={element("exchange")}>
      <AssistantBubble>
        Que tipo de evento quer organizar?
        <div className={element("chips")}>
          {mainOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={element("chip", { selected: eventType === option.id })}
              onClick={() => {
                setEventType(option.id);
                onContinue(option.label);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className={element("inline-input")}>
          <EventTypeSelect
            eventTypeOptions={allEventTypeOptions}
            eventType={eventType}
            setEventType={(value) => {
              setEventType(value);
              if (value) {
                const label =
                  SPACE_EVENT_TYPES_FLAT.find((option) => option.id === value)
                    ?.label ?? value;
                onContinue(label);
              }
            }}
            label="Outro tipo de evento"
          />
        </div>
      </AssistantBubble>
    </div>
  );
};

const DetailsStep = ({
  date,
  setDate,
  startEnd,
  setStartEnd,
  numPeople,
  setNumPeople,
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
  onContinue: (answer: string) => void;
}) => {
  const [showErrors, setShowErrors] = useState(false);

  const submit = () => {
    setShowErrors(true);
    if (!date || !startEnd.start || !startEnd.end || !numPeople) return;

    onContinue(
      `${date.toString()} · ${startEnd.start.timeLabel}–${startEnd.end.timeLabel} · ${formatInt(numPeople)} pessoas`,
    );
  };

  return (
    <div className={element("exchange")}>
      <AssistantBubble>
        Para quando, a que horas e para quantas pessoas?
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
  eventType,
  date,
  startEnd,
  numPeople,
  basePacksQuery,
}: {
  eventType: SpaceEventType | null;
  date: CalendarDate | null;
  startEnd: { start: TimeDuration | null; end: TimeDuration | null };
  numPeople: number | undefined;
  basePacksQuery: BasePacksQuery;
}) => {
  const fetchApi = useFetch();

  const searchResults = useSearchResults({
    query: {
      eventType: eventType ?? undefined,
      journey: "venues",
      date: date?.toString(),
      start: startEnd.start?.string,
      end: startEnd.end?.string,
      numPeople,
      pageSize: 18,
      mode: "search",
    },
  });

  const packQueries = useQueries({
    queries: (searchResults ?? []).map((searchResult) => ({
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
    !searchResults || packQueries.some((query) => query.isLoading);

  const availableSpaces = useMemo(() => {
    if (!searchResults) return [];
    return searchResults
      .map((searchResult, index) => {
        const packs = (packQueries[index]?.data ?? []).filter(isPackBookable);
        return { searchResult, packs };
      })
      .filter(({ packs }) => packs.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchResults, ...packQueries.map((query) => query.data)]);

  return { isLoading, availableSpaces };
};

const SpaceStep = ({
  eventType,
  date,
  startEnd,
  numPeople,
  basePacksQuery,
  onSelect,
}: {
  eventType: SpaceEventType | null;
  date: CalendarDate | null;
  startEnd: { start: TimeDuration | null; end: TimeDuration | null };
  numPeople: number | undefined;
  basePacksQuery: BasePacksQuery;
  onSelect: (searchResult: SearchResult, availablePacks: Pack[]) => void;
}) => {
  const [visibleCount, setVisibleCount] = useState(6);

  const { isLoading, availableSpaces } = useAvailableSpaces({
    eventType,
    date,
    startEnd,
    numPeople,
    basePacksQuery,
  });

  const options = availableSpaces.slice(0, visibleCount);

  return (
    <div className={element("exchange")}>
      <AssistantBubble>
        Estes espaços têm disponibilidade real para o seu evento. Qual prefere?
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
                <SpaceOption
                  key={searchResult.id}
                  searchResult={searchResult}
                  minPrice={Math.min(
                    ...packs.map((pack) => pack.price?.value ?? Infinity),
                  )}
                  numPacks={packs.length}
                  onSelect={() => onSelect(searchResult, packs)}
                />
              ))}
            </div>
            {availableSpaces.length > visibleCount && (
              <TextButton
                text="Mostrar mais espaços"
                onClick={() => setVisibleCount((count) => count + 6)}
              />
            )}
          </>
        )}
      </AssistantBubble>
    </div>
  );
};

const SpaceOption = ({
  searchResult,
  minPrice,
  numPacks,
  onSelect,
}: {
  searchResult: SearchResult;
  minPrice: number;
  numPacks: number;
  onSelect: () => void;
}) => (
  <div className={element("option")}>
    <div className={element("option__photo")}>
      {searchResult.photoURLs?.[0] && (
        <Image alt="" src={searchResult.photoURLs[0]} fill sizes="10rem" />
      )}
    </div>
    <div className={element("option__info")}>
      <p className={element("option__title")}>{searchResult.spaceName}</p>
      <p className={element("option__detail")}>
        {searchResult.address.city}
        {" · "}
        <IconUserInterfaceMiscellaneousUsers />{" "}
        {formatInt(searchResult.capacity)}
        {" · "}
        {numPacks} {numPacks === 1 ? "pack disponível" : "packs disponíveis"}
      </p>
      <Stack row gap="0.5rem" alignItems="center" flexWrap="wrap">
        {Number.isFinite(minPrice) && (
          <p className={element("option__price")}>
            desde <b>{money(minPrice)}</b> para o seu evento
          </p>
        )}
        {searchResult.recommended && (
          <Tag text="Recomendado" type="info" size="small" />
        )}
      </Stack>
    </div>
    <div className={element("option__actions")}>
      <Button type="primary" label="Escolher" onClick={onSelect} />
      <TextButton
        text="Ver espaço"
        href={`/space/${searchResult.id}`}
        target="_blank"
      />
    </div>
  </div>
);

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
                      {pack.description.length > 140
                        ? `${pack.description.slice(0, 140)}…`
                        : pack.description}
                    </p>
                  )}
                  {!!pack.price && (
                    <p className={element("option__price")}>
                      <b>{money(pack.price.value)}</b>
                      {pack.extras.length > 0 && " + serviços opcionais"}
                    </p>
                  )}
                </div>
                <div className={element("option__actions")}>
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
    <div className={element("exchange")}>
      <AssistantBubble>
        Que serviços quer adicionar? O preço atualiza-se a cada escolha.
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
        <Button
          type="primary"
          label={
            pack.price
              ? `Continuar · ${money(pack.price.value)}`
              : "Continuar"
          }
          loading={isFetchingPrice}
          onClick={onContinue}
        />
      </AssistantBubble>
    </div>
  );
};

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

const ReviewStep = ({
  space,
  pack,
  eventTypeLabel,
  date,
  startEnd,
  numPeople,
  layout,
  setLayout,
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
  paymentBreakdown: ReturnType<typeof getPackPaymentBreakdown>;
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

  const {
    mutateAsync: createBooking,
    isPending: isPendingCreateBooking,
  } = useCreateBooking();

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
      });
      onBooked(bookingID);
    } catch (e) {
      if ((e as Error).message.includes("already_booked")) {
        setError(
          "Este espaço acabou de ser reservado para este horário. Escolha outro horário ou espaço.",
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
            {eventTypeLabel} · {date?.toString()} ·{" "}
            {startEnd.start?.timeLabel}–{startEnd.end?.timeLabel} ·{" "}
            {formatInt(numPeople ?? 0)} pessoas
          </p>
          {selectedExtras.length > 0 && (
            <p className={element("review__detail")}>
              Serviços:{" "}
              {selectedExtras.map((extra) => extra.description).join(", ")}
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
        {!!pack.price && (
          <div className={element("review__payment")}>
            <Stack row justifyContent="space-between">
              <span>Total do evento</span>
              <b>{money(pack.price.value)}</b>
            </Stack>
            {paymentBreakdown?.isPartial && (
              <>
                <Stack row justifyContent="space-between">
                  <span>
                    Paga hoje ({paymentBreakdown.upfrontPercentage}%)
                  </span>
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
        )}
        {error && <InputError error={error} />}
        <Button
          type="primary"
          label={
            paymentBreakdown?.isPartial
              ? `Reservar agora · paga ${money(paymentBreakdown.todayAmount)} hoje`
              : pack.price
                ? `Reservar agora · ${money(pack.price.value)}`
                : "Reservar agora"
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
  space,
  pack,
  extraSelection,
  total,
  paymentBreakdown,
}: {
  eventTypeLabel: string;
  date: CalendarDate | null;
  startEnd: { start: TimeDuration | null; end: TimeDuration | null };
  numPeople: number | undefined;
  space: SearchResult | null;
  pack: Pack | null;
  extraSelection: ExtraSelectionMap;
  total: number;
  paymentBreakdown: ReturnType<typeof getPackPaymentBreakdown>;
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
        </div>
      )}
      <div className={element("summary__total")}>
        <span>Total</span>
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
        com pagamento seguro e sinal de {paymentBreakdown?.upfrontPercentage ?? 20}%.
      </p>
    </aside>
  );
};

export default BuilderPage;
