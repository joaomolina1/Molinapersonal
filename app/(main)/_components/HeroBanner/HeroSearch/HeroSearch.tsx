"use client";

import { SpaceEventType } from "@/_constants/space/eventTypes";
import InputSelect from "@/_design_system/InputSelect";
import { createBEMClasses } from "@/_utils/classname";
import { Ref, useCallback, useEffect, useRef, useState } from "react";
import { CalendarDate, today } from "@internationalized/date";
import Button from "@/_design_system/Button";
import IconUserInterfaceActionsSearch from "@/_design_system/_icons/UserInterface/Actions/Search.svg";
import IconUserInterfaceMiscellaneousSeparatorBar from "@/_design_system/_icons/UserInterface/Miscellaneous/SeparatorBar.svg";
import InputNumber from "@/_design_system/InputNumber";
import IconUserInterfaceActionsEdit from "@/_design_system/_icons/UserInterface/Actions/Edit.svg";
import { City, useAttributes, useCities } from "@/_models/search";
import { useRouterPush } from "@/_services/navigation";
import { SearchState, useSearchContext } from "@/(main)/search/useSearchState";
import InputDateTimeRange from "@/_design_system/InputDateTimeRange";
import { TimeDuration, formatInt } from "@/_utils/number";
import {
  EventTypeOptions,
  getEventTypeOptions,
} from "@/(main)/search/_utils/attributes";
import { sendGAEvent } from "@next/third-parties/google";
import EventTypeSelect from "../../EventTypeSelect";
import AIPlannerButton from "../../AIPlannerButton";
import { usePathname } from "next/navigation";
import { ErrorBoundary } from "@/_services/sentry";
import { useSession } from "@/_services/session";
import HeroSearchBudget from "./HeroSearchBudget";

const { block, element } = createBEMClasses("hero-search");

export const LiveHeroSearch = ({
  mode,
  onSearchDone,
  showDateStartEndTooltip,
}: {
  mode: "header" | "modal";
  onSearchDone?: () => void;
  showDateStartEndTooltip?: boolean;
}) => {
  const search = useSearchContext();
  const [isClient, setIsClient] = useState(false);

  // Do not render this component on the server
  useEffect(() => setIsClient(true), []);

  if (!isClient) {
    return;
  }

  return (
    <HeroSearchContent
      mode={mode}
      eventTypeOptions={search.eventTypeOptions}
      eventType={search.eventType}
      setEventType={search.setEventType}
      cities={search.cities}
      city={search.city}
      setCity={search.setCity}
      date={search.date}
      start={search.start}
      end={search.end}
      setDateStartEnd={search.setDateStartEnd}
      showDateStartEndTooltip={showDateStartEndTooltip}
      numPeople={search.numPeople}
      setNumPeople={search.setNumPeople}
      budgetMin={search.budgetMin}
      budgetMax={search.budgetMax}
      setBudget={search.setBudget}
      onSearch={onSearchDone}
    />
  );
};

export const HeroSearch = ({
  mode,
  onSearchDone,
  defaultEventType,
  listenOnEnter,
  initialSearchState,
}: {
  mode: "hero" | "header" | "modal";
  onSearchDone?: () => void;
  defaultEventType?: SpaceEventType;
  listenOnEnter?: boolean;
  initialSearchState?: SearchState;
}) => {
  const { data: cities = [] } = useCities({ enabled: true });
  const { data: availableAttributes = [] } = useAttributes();

  const [eventType, setEventType] = useState<SpaceEventType | null>(
    initialSearchState?.eventType ?? null,
  );
  const [city, setCity] = useState<string | null>(
    initialSearchState?.city ?? null,
  );
  const [date, setDate] = useState<CalendarDate | null>(
    initialSearchState?.date ?? null,
  );
  const [start, setStart] = useState<TimeDuration | null>(
    initialSearchState?.start ?? null,
  );
  const [end, setEnd] = useState<TimeDuration | null>(
    initialSearchState?.end ?? null,
  );
  const [numPeople, setNumPeople] = useState<number | null>(
    initialSearchState?.numPeopleDebounced ?? null,
  );
  const [budgetMin, setBudgetMin] = useState<number | null>(
    initialSearchState?.budgetMin ?? null,
  );
  const [budgetMax, setBudgetMax] = useState<number | null>(
    initialSearchState?.budgetMax ?? null,
  );

  const routerPush = useRouterPush();
  const [isLoading, setIsLoading] = useState(false);

  const eventTypeOptions = getEventTypeOptions(availableAttributes);
  const isEventTypeValid =
    !!eventType && !!eventTypeOptions.find(({ id }) => id === eventType);

  const cityData = cities.find(({ Name }) => Name === city);

  const handleSearch = useCallback(() => {
    setIsLoading(true);

    const searchParams = new URLSearchParams();

    if (defaultEventType) {
      searchParams.set("eventType", defaultEventType);
    } else if (isEventTypeValid) {
      searchParams.set("eventType", eventType);
    }

    if (cityData) {
      searchParams.set("city", cityData.Name);
      searchParams.set("top", cityData.Top.toString());
      searchParams.set("bottom", cityData.Bottom.toString());
      searchParams.set("left", cityData.Left.toString());
      searchParams.set("right", cityData.Right.toString());
    }

    if (date) {
      searchParams.set("date", date.toString());
    }

    if (start && end) {
      searchParams.set("start", start.string);
      searchParams.set("end", end.string);
    }

    if (numPeople) {
      searchParams.set("numPeople", numPeople.toString());
    }

    if (budgetMin) {
      searchParams.set("budgetMin", budgetMin.toString());
    }

    if (budgetMax) {
      searchParams.set("budgetMax", budgetMax.toString());
    }

    routerPush("/search?" + searchParams.toString());
    onSearchDone?.();
  }, [
    budgetMax,
    budgetMin,
    cityData,
    date,
    defaultEventType,
    end,
    eventType,
    isEventTypeValid,
    numPeople,
    onSearchDone,
    routerPush,
    start,
  ]);

  useEffect(() => {
    if (listenOnEnter) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          handleSearch();
        }
      };

      document.addEventListener("keydown", onKeyDown);

      return () => {
        document.removeEventListener("keydown", onKeyDown);
      };
    }
  }, [handleSearch, listenOnEnter]);

  return (
    <HeroSearchContent
      mode={mode}
      defaultEventType={defaultEventType}
      eventTypeOptions={eventTypeOptions}
      eventType={eventType}
      setEventType={setEventType}
      cities={cities}
      city={city}
      setCity={setCity}
      date={date}
      start={start}
      end={end}
      setDateStartEnd={(date, start, end) => {
        setDate(date);
        setStart(start);
        setEnd(end);
      }}
      numPeople={numPeople}
      setNumPeople={setNumPeople}
      budgetMin={budgetMin}
      budgetMax={budgetMax}
      setBudget={(min, max) => {
        setBudgetMin(min);
        setBudgetMax(max);
      }}
      onSearch={handleSearch}
      isSearchLoading={isLoading}
    />
  );
};

const HeroSearchContent = ({
  mode,
  defaultEventType,
  eventTypeOptions,
  eventType,
  setEventType,
  cities,
  city,
  setCity,
  date,
  start,
  end,
  setDateStartEnd,
  showDateStartEndTooltip,
  numPeople,
  setNumPeople,
  budgetMin,
  budgetMax,
  setBudget,
  onSearch,
  isSearchLoading,
}: {
  mode: "header" | "hero" | "modal";
  defaultEventType?: SpaceEventType;
  eventTypeOptions: EventTypeOptions;
  eventType: SpaceEventType | null;
  setEventType: (eventType: SpaceEventType | null) => void;
  cities: City[];
  city: string | null;
  setCity: (city: string | null) => void;
  date: CalendarDate | null;
  start: TimeDuration | null;
  end: TimeDuration | null;
  setDateStartEnd: (
    date: CalendarDate | null,
    start: TimeDuration | null,
    end: TimeDuration | null,
  ) => void;
  showDateStartEndTooltip?: boolean;
  numPeople: number | null;
  setNumPeople: (numPeople: number | null) => void;
  budgetMin: number | null;
  budgetMax: number | null;
  setBudget: (min: number | null, max: number | null) => void;
  onSearch?: () => void;
  isSearchLoading?: boolean;
}) => {
  const pathname = usePathname();
  const handleHeroSearch = () => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "Standard",
      Rinu_ItemType: "Pesquisar",
      Rinu_eLabel1: eventType ?? null,
      Rinu_eLabel2: city ?? null,
      Rinu_eLabel3: numPeople ?? null,
      Rinu_eLabel4: date ?? null,
      Rinu_eLabel5: start ?? null,
      Rinu_eLabel6: end ?? null,
      Rinu_eLabel7: budgetMin ?? null,
      Rinu_eLabel8: budgetMax ?? null,
    });

    onSearch?.();
  };

  const [session] = useSession();
  const isAdmin = !!session?.roles.includes("admin");

  const dateStartEndRef = useRef<HTMLButtonElement>(null);
  const numPeopleRef = useRef<HTMLInputElement>(null);

  return (
    <ErrorBoundary>
      <div className={block({ mode, isAdmin })}>
        {!defaultEventType && (
          <>
            <EventTypeSelect
              eventTypeOptions={eventTypeOptions}
              eventType={eventType}
              setEventType={setEventType}
              label={mode === "header" ? undefined : "O que está a planear?"}
              placeholder={
                mode === "header" ? "O que está a planear?" : undefined
              }
            />
            <IconUserInterfaceMiscellaneousSeparatorBar />
          </>
        )}
        <HeroSearchCity
          mode={mode}
          cities={cities}
          city={city}
          setCity={setCity}
        />
        <IconUserInterfaceMiscellaneousSeparatorBar />
        {mode !== "hero" && (
          <>
            <InputDateTimeRange
              mode="select"
              label="Quando?"
              date={date}
              start={start}
              end={end}
              onChange={setDateStartEnd}
              minDate={today("Europe/Lisbon")}
              showLabel={mode !== "header"}
              placeholder={mode === "header" ? "Quando?" : undefined}
              helpTooltip={
                showDateStartEndTooltip && mode == "header" && !date
                  ? {
                      content:
                        "Clique aqui para escolher a data e hora do seu evento",
                      visible: true,
                      visibleOnTouchDevice: true,
                      style: { position: "fixed" },
                    }
                  : undefined
              }
              ref={dateStartEndRef}
            />
            <IconUserInterfaceMiscellaneousSeparatorBar />
          </>
        )}
        <HeroSearchNumPeople
          numPeople={numPeople}
          setNumPeople={setNumPeople}
          mode={mode}
          ref={numPeopleRef}
        />
        {session?.roles.includes("admin") && mode !== "hero" && (
          <>
            <IconUserInterfaceMiscellaneousSeparatorBar />
            <HeroSearchBudget
              mode={mode}
              min={budgetMin}
              max={budgetMax}
              setBudget={setBudget}
              onClick={
                !!date && !!start && !!end && !!numPeople
                  ? undefined
                  : () => {
                      if (!date || !start || !end) {
                        dateStartEndRef.current?.click();
                      } else if (!numPeople) {
                        numPeopleRef.current?.focus();
                      }
                    }
              }
            />
          </>
        )}
        {onSearch && (
          <Button
            type={mode === "header" ? "primary-inverted" : "primary"}
            label={mode === "header" ? undefined : "Pesquisar"}
            leftIcon={<IconUserInterfaceActionsSearch />}
            onClick={handleHeroSearch}
            loading={isSearchLoading}
          />
        )}
        {mode === "hero" && (
          <AIPlannerButton source="hero" className={element("ai-planner")} />
        )}
      </div>
    </ErrorBoundary>
  );
};

export const HeroSearchCity = ({
  cities,
  city,
  setCity,
  mode,
}: {
  cities: City[];
  city: string | null;
  setCity: (city: string | null) => void;
  mode: "header" | "hero" | "modal";
}) => {
  return (
    <InputSelect
      label="Onde?"
      options={cities.map((cityOption) => ({
        id: cityOption.Name,
        text: cityOption.Name,
      }))}
      value={city ?? undefined}
      onChange={setCity}
      showLabel={mode !== "header"}
      placeholder={mode === "header" ? "Onde?" : undefined}
    />
  );
};

export const HeroSearchNumPeople = ({
  numPeople,
  setNumPeople,
  mode,
  ref,
}: {
  numPeople: number | null;
  setNumPeople: (numPeople: number | null) => void;
  mode: "header" | "hero" | "modal";
  ref?: Ref<HTMLInputElement>;
}) => {
  const numPeopleSuffix = numPeople === 1 ? " pessoa" : " pessoas";
  const numPeopleInputWidth =
    `${formatInt(numPeople)}${numPeopleSuffix}`.length - 1 + "ch";

  return (
    <InputNumber
      label="Quantas pessoas?"
      value={numPeople ?? undefined}
      onChange={(value) => setNumPeople(value ?? null)}
      suffix={numPeopleSuffix}
      allowNegative={false}
      decimalScale={0}
      showLabel={mode !== "header"}
      placeholder={mode === "header" ? "Quantas pessoas?" : undefined}
      inputStyle={{ width: numPeople ? numPeopleInputWidth : "15ch" }}
      rightIcon={
        mode === "modal" ? <IconUserInterfaceActionsEdit /> : undefined
      }
      className={element("num-people")}
      ref={ref}
    />
  );
};
