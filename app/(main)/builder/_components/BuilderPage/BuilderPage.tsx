"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";

import Button, { TextButton } from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import Tag from "@/_design_system/Tag";
import InputDate from "@/_design_system/InputDate";
import InputTimeRange from "@/_design_system/InputTimeRange";
import InputNumber from "@/_design_system/InputNumber";
import InputText from "@/_design_system/InputText";
import InputTextArea from "@/_design_system/InputTextArea";
import InputPhone, { isValidPhone } from "@/_design_system/InputPhone";
import InputCheckbox from "@/_design_system/InputCheckbox";
import CircleLoader from "@/_design_system/CircleLoader";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import IconUserInterfaceMiscellaneousUsers from "@/_design_system/_icons/UserInterface/Miscellaneous/Users.svg";
import IconUserInterfaceActionsDelete from "@/_design_system/_icons/UserInterface/Actions/Delete.svg";
import { IconButton } from "@/_design_system/Button";

import EventTypeSelect from "@/(main)/_components/EventTypeSelect";
import { allEventTypeOptions } from "@/(main)/search/_utils/attributes";
import {
  SPACE_EVENT_TYPES_FLAT,
  SpaceEventType,
} from "@/_constants/space/eventTypes";
import { SearchResult, useSearchResults } from "@/_models/search";
import { Pack, usePacks } from "@/_models/pack";
import { useCreateQuote } from "@/_models/quote";
import { Extra } from "@/(onboarding)/onboarding/_components/Step4/Extras/utils";
import {
  computeExtraPrice,
  resolveExtraHours,
  resolveExtraPax,
  usesExtraHours,
  usesExtraPax,
} from "@lib/extras/quantities";

import { createBEMClasses } from "@/_utils/classname";
import { TimeDuration, formatInt, formatMoney } from "@/_utils/number";
import { useSession } from "@/_services/session";
import { ErrorBoundary } from "@/_services/sentry";

const { block, element } = createBEMClasses("builder-page");

const MAX_PLAN_ITEMS = 5;

type Step =
  | "event-type"
  | "details"
  | "space"
  | "pack"
  | "extras"
  | "more"
  | "contact"
  | "success";

type ChatEntry = {
  question: string;
  answer: string;
};

type PlanExtra = {
  id: string;
  description: string;
  value: number;
  hours: number | null;
  pax: number | null;
};

type PlanItem = {
  key: string;
  packID: string;
  packName: string;
  spaceID: string;
  spaceName: string;
  venueID: string;
  venueName: string;
  city: string;
  photoURL: string | null;
  baseValue: number;
  extras: PlanExtra[];
};

const planItemTotal = (item: PlanItem) =>
  item.baseValue + item.extras.reduce((sum, extra) => sum + extra.value, 0);

const money = (value: number) =>
  formatMoney(value, { maximumFractionDigits: 0 });

const BuilderPage = () => {
  const pathname = usePathname();

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
  const [budget, setBudget] = useState<number | undefined>(undefined);

  // Current selection
  const [selectedSpace, setSelectedSpace] = useState<SearchResult | null>(null);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);

  // The plan being built
  const [plan, setPlan] = useState<PlanItem[]>([]);

  const eventTypeLabel = useMemo(
    () =>
      SPACE_EVENT_TYPES_FLAT.find((option) => option.id === eventType)?.label ??
      "",
    [eventType],
  );

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
    setBudget(undefined);
    setSelectedSpace(null);
    setSelectedPack(null);
    setPlan([]);
    trackStep("restart");
  };

  const total = plan.reduce((sum, item) => sum + planItemTotal(item), 0);

  return (
    <ErrorBoundary>
      <div className={block()}>
        <header className={element("header")}>
          <h1>Monte o seu evento</h1>
          <p>
            Responda passo a passo e vamos sugerindo os melhores espaços e
            serviços — com o preço sempre à vista.
          </p>
        </header>
        <div className={element("content")}>
          <div className={element("chat")}>
            <AssistantBubble>
              Olá! 👋 Sou o assistente de eventos da RINU. Vou ajudá-lo a
              montar o seu evento em poucos passos.
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
                budget={budget}
                setBudget={setBudget}
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

            {step === "space" && (
              <SpaceStep
                eventType={eventType}
                date={date}
                startEnd={startEnd}
                numPeople={numPeople}
                budget={budget}
                excludedSpaceIDs={plan.map((item) => item.spaceID)}
                onSelect={(searchResult) => {
                  setSelectedSpace(searchResult);
                  pushHistory(
                    "Estes são os espaços mais adequados ao seu evento. Qual prefere?",
                    `${searchResult.spaceName} · ${searchResult.address.city}`,
                  );
                  setStep("pack");
                  trackStep("space_selected", searchResult.spaceName);
                }}
              />
            )}

            {step === "pack" && selectedSpace && date && (
              <PackStep
                space={selectedSpace}
                date={date}
                startEnd={startEnd}
                numPeople={numPeople}
                onBack={() => {
                  setSelectedSpace(null);
                  setStep("space");
                }}
                onSelect={(pack) => {
                  setSelectedPack(pack);
                  pushHistory(
                    `Packs disponíveis em ${selectedSpace.spaceName}:`,
                    `${pack.name}${pack.price ? ` · ${money(pack.price.value)}` : ""}`,
                  );
                  setStep(pack.extras.length > 0 ? "extras" : "more");
                  if (pack.extras.length === 0) {
                    addToPlan(pack, []);
                  }
                  trackStep("pack_selected", pack.name);
                }}
              />
            )}

            {step === "extras" && selectedPack && (
              <ExtrasStep
                pack={selectedPack}
                startEnd={startEnd}
                numPeople={numPeople}
                onConfirm={(extras) => {
                  addToPlan(selectedPack, extras);
                  pushHistory(
                    "Quer adicionar serviços a este pack?",
                    extras.length > 0
                      ? extras
                          .map(
                            (extra) =>
                              `${extra.description} (${money(extra.value)})`,
                          )
                          .join(", ")
                      : "Sem serviços adicionais",
                  );
                  trackStep("extras_confirmed", String(extras.length));
                }}
              />
            )}

            {step === "more" && (
              <MoreStep
                canAddMore={plan.length < MAX_PLAN_ITEMS}
                onAddMore={() => {
                  pushHistory(
                    "Quer adicionar mais alguma coisa ao plano?",
                    "Sim, adicionar outro espaço ou serviço",
                  );
                  setSelectedSpace(null);
                  setSelectedPack(null);
                  setStep("space");
                  trackStep("add_more");
                }}
                onFinish={() => {
                  pushHistory(
                    "Quer adicionar mais alguma coisa ao plano?",
                    "Não, concluir o pedido",
                  );
                  setStep("contact");
                  trackStep("finish_plan", String(plan.length));
                }}
              />
            )}

            {step === "contact" && (
              <ContactStep
                plan={plan}
                total={total}
                eventType={eventType}
                eventTypeLabel={eventTypeLabel}
                date={date}
                startEnd={startEnd}
                numPeople={numPeople}
                budget={budget}
                onSuccess={() => {
                  setStep("success");
                  trackStep("quote_sent", String(plan.length));
                }}
              />
            )}

            {step === "success" && (
              <div className={element("exchange")}>
                <AssistantBubble>
                  Pedido enviado com sucesso! 🎉 A nossa equipa vai analisar o
                  seu plano e entra em contacto em 12h úteis com a proposta
                  final.
                </AssistantBubble>
                <Stack row gap="0.75rem" flexWrap="wrap">
                  <Button type="primary" label="Voltar à página inicial" href="/" />
                  <Button
                    type="secondary"
                    label="Montar outro evento"
                    onClick={restart}
                  />
                </Stack>
              </div>
            )}

            {step !== "event-type" && step !== "success" && (
              <div className={element("restart")}>
                <TextButton text="Recomeçar do início" onClick={restart} />
              </div>
            )}
          </div>

          <PlanSummary
            plan={plan}
            total={total}
            eventTypeLabel={eventTypeLabel}
            date={date}
            startEnd={startEnd}
            numPeople={numPeople}
            onRemove={(key) => {
              setPlan((items) => items.filter((item) => item.key !== key));
              trackStep("plan_item_removed");
            }}
            showCTA={step === "more" && plan.length > 0}
            onFinish={() => {
              pushHistory(
                "Quer adicionar mais alguma coisa ao plano?",
                "Não, concluir o pedido",
              );
              setStep("contact");
            }}
          />
        </div>
        {plan.length > 0 && step !== "success" && (
          <div className={element("total-bar")}>
            <span>Total estimado</span>
            <strong>{money(total)}</strong>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );

  function addToPlan(pack: Pack, extras: PlanExtra[]) {
    if (!selectedSpace) return;
    setPlan((items) => [
      ...items,
      {
        key: `${pack.id}-${Date.now()}`,
        packID: pack.id,
        packName: pack.name,
        spaceID: selectedSpace.id,
        spaceName: selectedSpace.spaceName,
        venueID: selectedSpace.venueID,
        venueName: selectedSpace.venueName,
        city: selectedSpace.address.city,
        photoURL: selectedSpace.photoURLs?.[0] ?? null,
        baseValue: pack.price?.value ?? 0,
        extras,
      },
    ]);
    setStep("more");
  }
};

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

  const submit = () => {
    setShowErrors(true);
    if (!date || !startEnd.start || !startEnd.end || !numPeople) return;

    const answer = `${date.toString()} · ${startEnd.start.timeLabel}–${startEnd.end.timeLabel} · ${formatInt(numPeople)} pessoas${budget ? ` · até ${money(budget)}` : ""}`;
    onContinue(answer);
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
          <InputNumber
            label="Orçamento total (opcional)"
            value={budget}
            onChange={setBudget}
            allowNegative={false}
            decimalScale={0}
            suffix=" €"
          />
        </div>
        <Button type="primary" label="Ver sugestões" onClick={submit} />
      </AssistantBubble>
    </div>
  );
};

const SpaceStep = ({
  eventType,
  date,
  startEnd,
  numPeople,
  budget,
  excludedSpaceIDs,
  onSelect,
}: {
  eventType: SpaceEventType | null;
  date: CalendarDate | null;
  startEnd: { start: TimeDuration | null; end: TimeDuration | null };
  numPeople: number | undefined;
  budget: number | undefined;
  excludedSpaceIDs: string[];
  onSelect: (searchResult: SearchResult) => void;
}) => {
  const [pageSize, setPageSize] = useState(6);

  const searchResults = useSearchResults({
    query: {
      eventType: eventType ?? undefined,
      date: date?.toString(),
      start: startEnd.start?.string,
      end: startEnd.end?.string,
      numPeople,
      pageSize: pageSize + excludedSpaceIDs.length,
    },
  });

  const options = useMemo(() => {
    const list = (searchResults ?? []).filter(
      (searchResult) => !excludedSpaceIDs.includes(searchResult.id),
    );

    if (!budget) return list.slice(0, pageSize);

    // Soft budget ordering: affordable spaces first, but keep all visible.
    return [...list]
      .sort((a, b) => {
        const aOver = (a.price.min ?? 0) > budget ? 1 : 0;
        const bOver = (b.price.min ?? 0) > budget ? 1 : 0;
        return aOver - bOver;
      })
      .slice(0, pageSize);
  }, [searchResults, excludedSpaceIDs, budget, pageSize]);

  return (
    <div className={element("exchange")}>
      <AssistantBubble>
        Estes são os espaços mais adequados ao seu evento. Qual prefere?
        {!searchResults ? (
          <div className={element("loading")}>
            <CircleLoader size={48} />
          </div>
        ) : options.length === 0 ? (
          <p className={element("empty")}>
            Não encontrámos espaços disponíveis para estes critérios.
            Experimente alterar a data ou o número de pessoas, ou{" "}
            <TextButton text="peça um orçamento" href="/quote-request" />.
          </p>
        ) : (
          <>
            <div className={element("options")}>
              {options.map((searchResult) => (
                <SpaceOption
                  key={searchResult.id}
                  searchResult={searchResult}
                  overBudget={
                    !!budget && (searchResult.price.min ?? 0) > budget
                  }
                  onSelect={() => onSelect(searchResult)}
                />
              ))}
            </div>
            {options.length >= pageSize && (
              <TextButton
                text="Mostrar mais espaços"
                onClick={() => setPageSize((size) => size + 6)}
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
  overBudget,
  onSelect,
}: {
  searchResult: SearchResult;
  overBudget: boolean;
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
      </p>
      <Stack row gap="0.5rem" alignItems="center" flexWrap="wrap">
        {!!searchResult.formattedPrice && (
          <p className={element("option__price")}>
            desde <b>{money(searchResult.formattedPrice.amount)}</b>/
            {searchResult.formattedPrice.type}
          </p>
        )}
        {searchResult.recommended && (
          <Tag text="Recomendado" type="info" size="small" />
        )}
        {overBudget && (
          <Tag text="Acima do orçamento" type="warning" size="small" />
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
  date,
  startEnd,
  numPeople,
  onBack,
  onSelect,
}: {
  space: SearchResult;
  date: CalendarDate;
  startEnd: { start: TimeDuration | null; end: TimeDuration | null };
  numPeople: number | undefined;
  onBack: () => void;
  onSelect: (pack: Pack) => void;
}) => {
  const packsQuery = useMemo(() => {
    if (!startEnd.start || !startEnd.end || !numPeople) return undefined;
    return {
      date: date.toDate("Etc/UTC").toISOString(),
      start: startEnd.start.string,
      end: startEnd.end.string,
      num_persons: numPeople,
      extras: "",
    };
  }, [date, startEnd, numPeople]);

  const { data: allPacks, isLoading } = usePacks({
    spaceID: space.id,
    query: packsQuery,
    mode: "public",
  });

  const packs = useMemo(
    () =>
      (allPacks ?? [])
        .filter((pack) =>
          pack.prices.some((price) => new Date(price.to) > new Date()),
        )
        .filter((pack) => !pack.unavailabilityReason),
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
            Este espaço não tem packs disponíveis para a data e horário
            escolhidos.{" "}
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

const ExtrasStep = ({
  pack,
  startEnd,
  numPeople,
  onConfirm,
}: {
  pack: Pack;
  startEnd: { start: TimeDuration | null; end: TimeDuration | null };
  numPeople: number | undefined;
  onConfirm: (extras: PlanExtra[]) => void;
}) => {
  const eventHours =
    startEnd.start && startEnd.end
      ? Math.max(startEnd.end.number - startEnd.start.number, 0)
      : 0;
  const eventPax = numPeople ?? 0;

  const buildPlanExtra = (
    extra: Extra,
    hours?: number | null,
    pax?: number | null,
  ): PlanExtra => {
    const resolvedHours = resolveExtraHours(extra, eventHours, hours);
    const resolvedPax = resolveExtraPax(extra, eventPax, pax);
    return {
      id: extra.id,
      description: extra.description,
      hours: resolvedHours,
      pax: resolvedPax,
      value: computeExtraPrice(extra, resolvedHours, resolvedPax),
    };
  };

  const [selected, setSelected] = useState<Record<string, PlanExtra>>(() =>
    Object.fromEntries(
      pack.extras
        .filter((extra) => extra.mandatory)
        .map((extra) => [extra.id, buildPlanExtra(extra)]),
    ),
  );

  const toggleExtra = (extra: Extra, checked: boolean) => {
    setSelected((current) => {
      const next = { ...current };
      if (checked) {
        next[extra.id] = buildPlanExtra(extra);
      } else {
        delete next[extra.id];
      }
      return next;
    });
  };

  const updateQuantity = (
    extra: Extra,
    field: "hours" | "pax",
    value: number | undefined,
  ) => {
    setSelected((current) => {
      const existing = current[extra.id];
      if (!existing) return current;
      return {
        ...current,
        [extra.id]: buildPlanExtra(
          extra,
          field === "hours" ? (value ?? null) : existing.hours,
          field === "pax" ? (value ?? null) : existing.pax,
        ),
      };
    });
  };

  return (
    <div className={element("exchange")}>
      <AssistantBubble>
        Quer adicionar serviços a este pack?
        <div className={element("extras")}>
          {pack.extras.map((extra) => {
            const planExtra = selected[extra.id];
            return (
              <div key={extra.id} className={element("extras__item")}>
                <Stack row gap="0.5rem" alignItems="center">
                  <InputCheckbox
                    checked={!!planExtra}
                    onChange={(checked) => toggleExtra(extra, checked)}
                    label={extra.description}
                    disabled={extra.mandatory}
                  />
                  {extra.mandatory && (
                    <Tag text="Incluído" type="neutral" size="small" />
                  )}
                </Stack>
                {!!planExtra && (
                  <Stack
                    row
                    gap="0.75rem"
                    alignItems="center"
                    className={element("extras__item__details")}
                    flexWrap="wrap"
                  >
                    {usesExtraHours(extra) && (
                      <InputNumber
                        label="Horas"
                        value={planExtra.hours ?? undefined}
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
                        value={planExtra.pax ?? undefined}
                        onChange={(value) => updateQuantity(extra, "pax", value)}
                        allowNegative={false}
                        decimalScale={0}
                        suffix=" pax"
                      />
                    )}
                    <span className={element("extras__item__price")}>
                      {money(planExtra.value)}
                    </span>
                  </Stack>
                )}
              </div>
            );
          })}
        </div>
        <Button
          type="primary"
          label="Adicionar ao plano"
          onClick={() => onConfirm(Object.values(selected))}
        />
      </AssistantBubble>
    </div>
  );
};

const MoreStep = ({
  canAddMore,
  onAddMore,
  onFinish,
}: {
  canAddMore: boolean;
  onAddMore: () => void;
  onFinish: () => void;
}) => (
  <div className={element("exchange")}>
    <AssistantBubble>
      Adicionado ao plano! ✅ Quer adicionar mais alguma coisa?
      <Stack row gap="0.75rem" flexWrap="wrap">
        {canAddMore && (
          <Button
            type="secondary"
            label="Adicionar outro espaço ou serviço"
            onClick={onAddMore}
          />
        )}
        <Button type="primary" label="Concluir e enviar pedido" onClick={onFinish} />
      </Stack>
    </AssistantBubble>
  </div>
);

const ContactStep = ({
  plan,
  total,
  eventType,
  eventTypeLabel,
  date,
  startEnd,
  numPeople,
  budget,
  onSuccess,
}: {
  plan: PlanItem[];
  total: number;
  eventType: SpaceEventType | null;
  eventTypeLabel: string;
  date: CalendarDate | null;
  startEnd: { start: TimeDuration | null; end: TimeDuration | null };
  numPeople: number | undefined;
  budget: number | undefined;
  onSuccess: () => void;
}) => {
  const [session] = useSession();

  const [name, setName] = useState(session?.name ?? "");
  const [email, setEmail] = useState(session?.email ?? "");
  const [phone, setPhone] = useState<{ extension?: number; number?: number }>(
    {},
  );
  const [notes, setNotes] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const {
    mutateAsync: createQuote,
    isPending,
    isError,
  } = useCreateQuote();

  const hasInvalidPhone =
    !!phone.extension &&
    !!phone.number &&
    !isValidPhone({ ...phone, fullCheck: true });

  const submit = async () => {
    setShowErrors(true);
    if (!name || !email || !phone.extension || !phone.number || hasInvalidPhone) {
      return;
    }

    const planSummary = plan
      .map(
        (item) =>
          `- ${item.packName} — ${item.spaceName} (${item.venueName}, ${item.city}): ${money(planItemTotal(item))}` +
          (item.extras.length > 0
            ? ` [serviços: ${item.extras.map((extra) => extra.description).join(", ")}]`
            : ""),
      )
      .join("\n");

    await createQuote({
      user_id: session?.user_id,
      name,
      email,
      phone_extension: phone.extension,
      phone_number: phone.number,
      event_kind: eventType ?? undefined,
      area: plan[0]?.city ?? "",
      country: "Portugal",
      event_date: date?.toString(),
      start_at: startEnd.start?.string,
      end_at: startEnd.end?.string,
      timezone: getLocalTimeZone(),
      budget: budget ?? undefined,
      currency: "EUR",
      num_people: numPeople ?? undefined,
      notes: [
        "Pedido criado pelo Event Builder.",
        `Tipo de evento: ${eventTypeLabel}`,
        "Plano escolhido:",
        planSummary,
        `Total estimado: ${money(total)}`,
        notes ? `Notas do cliente: ${notes}` : null,
      ]
        .filter(Boolean)
        .join("\n"),
      venue_id: plan[0]?.venueID,
      space_id: plan[0]?.spaceID,
      pack_id: plan[0]?.packID,
      packs: plan.map((item) => ({
        packID: item.packID,
        extraIDs: item.extras.map((extra) => extra.id),
        extraParams: item.extras
          .filter((extra) => extra.hours != null || extra.pax != null)
          .map((extra) => ({
            id: extra.id,
            hours: extra.hours,
            pax: extra.pax,
          })),
      })),
    });

    onSuccess();
  };

  return (
    <div className={element("exchange")}>
      <AssistantBubble>
        Excelente escolha! Só faltam os seus contactos para enviarmos o pedido
        à nossa equipa.
        <div className={element("form-grid")}>
          <InputText
            label="Nome"
            value={name}
            onChange={setName}
            invalid={showErrors && !name}
          />
          <InputText
            label="Email"
            type="email"
            value={email}
            onChange={setEmail}
            invalid={showErrors && !email}
          />
          <InputPhone
            extension={phone.extension}
            number={phone.number}
            onChange={(extension, number) => setPhone({ extension, number })}
            invalid={showErrors && (!phone.extension || !phone.number)}
            error={
              showErrors && hasInvalidPhone
                ? "Insira um telemóvel válido"
                : undefined
            }
          />
        </div>
        <InputTextArea
          label="Notas adicionais (opcional)"
          showLabel
          value={notes}
          onChange={setNotes}
          height="small"
        />
        {showErrors && isError && (
          <InputError error="Ocorreu um erro ao enviar o pedido. Tente novamente." />
        )}
        <Button
          type="primary"
          label={`Enviar pedido · ${money(total)}`}
          loading={isPending}
          onClick={() => void submit()}
        />
      </AssistantBubble>
    </div>
  );
};

const PlanSummary = ({
  plan,
  total,
  eventTypeLabel,
  date,
  startEnd,
  numPeople,
  onRemove,
  showCTA,
  onFinish,
}: {
  plan: PlanItem[];
  total: number;
  eventTypeLabel: string;
  date: CalendarDate | null;
  startEnd: { start: TimeDuration | null; end: TimeDuration | null };
  numPeople: number | undefined;
  onRemove: (key: string) => void;
  showCTA: boolean;
  onFinish: () => void;
}) => (
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
      {!!numPeople && <Tag text={`${formatInt(numPeople)} pessoas`} size="small" />}
    </div>
    {plan.length === 0 ? (
      <p className={element("summary__empty")}>
        O seu plano ainda está vazio. À medida que escolher espaços e serviços,
        eles aparecem aqui com o preço.
      </p>
    ) : (
      <div className={element("summary__items")}>
        {plan.map((item) => (
          <div key={item.key} className={element("summary__item")}>
            <div className={element("summary__item__photo")}>
              {item.photoURL && (
                <Image alt="" src={item.photoURL} fill sizes="6rem" />
              )}
            </div>
            <div className={element("summary__item__info")}>
              <p className={element("summary__item__title")}>{item.packName}</p>
              <p className={element("summary__item__detail")}>
                {item.spaceName} · {item.city}
              </p>
              {item.extras.length > 0 && (
                <p className={element("summary__item__detail")}>
                  {item.extras.length}{" "}
                  {item.extras.length === 1 ? "serviço" : "serviços"} incluído
                  {item.extras.length === 1 ? "" : "s"}
                </p>
              )}
            </div>
            <div className={element("summary__item__side")}>
              <span>{money(planItemTotal(item))}</span>
              <IconButton
                ariaLabel="Remover do plano"
                icon={<IconUserInterfaceActionsDelete />}
                onClick={() => onRemove(item.key)}
                showTooltip={false}
              />
            </div>
          </div>
        ))}
      </div>
    )}
    <div className={element("summary__total")}>
      <span>Total estimado</span>
      <strong>{money(total)}</strong>
    </div>
    <p className={element("summary__disclaimer")}>
      Valores estimados com base nos preços publicados. A proposta final é
      confirmada pela nossa equipa.
    </p>
    {showCTA && (
      <Button
        type="primary"
        label="Concluir e enviar pedido"
        onClick={onFinish}
      />
    )}
  </aside>
);

export default BuilderPage;
