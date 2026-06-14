"use client";

import { SpaceEventType } from "@/_constants/space/eventTypes";
import {
  instanciateSearchResults,
  useAttributes,
  useCities,
  useSearch,
} from "@/_models/search";
import {
  useDebouncedSearchParamState,
  useSearchParamsArrayState,
  useSearchParamsObjectState,
  useSearchParamsState,
} from "@/_services/searchParams";
import { TimeDuration } from "@/_utils/number";
import { parseDate, CalendarDate } from "@internationalized/date";
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AttributeFilterKey,
  TabFilterKey,
  getAttributeFilters,
  getEventTypeOptions,
  getServiceTabFilters,
  getTabFilters,
} from "./_utils/attributes";
import { useSession } from "@/_services/session";
import { ALL_KEYWORD_OPTIONS } from "./_components/KeywordSearch/KeywordSearch";

const PAGE_SIZE = 23;

export const useDateStartEnd = () => {
  const [_dateStartEnd, _setDateStartEnd] = useSearchParamsObjectState([
    "date",
    "start",
    "end",
  ]);

  const date = useMemo(() => {
    if (!_dateStartEnd.date) return null;

    try {
      return parseDate(_dateStartEnd.date);
    } catch {
      console.error("Invalid date on search params: ", _dateStartEnd.date);
      return null;
    }
  }, [_dateStartEnd.date]);

  const start = useMemo(() => {
    if (!_dateStartEnd.start) return null;

    try {
      return TimeDuration.fromString(_dateStartEnd.start);
    } catch {
      console.error("Invalid start on search params: ", _dateStartEnd.start);
      return null;
    }
  }, [_dateStartEnd.start]);

  const end = useMemo(() => {
    if (!_dateStartEnd.end) return null;

    try {
      return TimeDuration.fromString(_dateStartEnd.end);
    } catch {
      console.error("Invalid end on search params: ", _dateStartEnd.end);
      return null;
    }
  }, [_dateStartEnd.end]);

  const setDateStartEnd = useCallback(
    (
      newDate: CalendarDate | null,
      newStart: TimeDuration | null,
      newEnd: TimeDuration | null,
    ) => {
      if (
        newDate?.toString() !== date?.toString() ||
        newStart?.id !== start?.id ||
        newEnd?.id !== end?.id
      ) {
        _setDateStartEnd({
          date: newDate ? newDate.toString() : null,
          start: newStart ? newStart.string : null,
          end: newEnd ? newEnd.string : null,
        });
      }
    },
    [_setDateStartEnd, date, end, start],
  );

  const state = useMemo(
    () => ({
      date,
      start,
      end,
      setDateStartEnd,
    }),
    [date, end, setDateStartEnd, start],
  );

  return state;
};

export const useNumPeople = () => {
  const [numPeopleString, numPeopleDebouncedString, setNumPeopleString] =
    useDebouncedSearchParamState("numPeople");

  let numPeople: number | null = null;
  let numPeopleDebounced: number | null = null;

  try {
    numPeople = numPeopleString ? parseInt(numPeopleString) : null;
    numPeopleDebounced = numPeopleDebouncedString
      ? parseInt(numPeopleDebouncedString)
      : null;
  } catch {
    numPeople = null;
    numPeopleDebounced = null;
    console.error("Invalid numPeople on search params: ", numPeopleString);
  }

  const state = useMemo(
    () => ({
      numPeople,
      numPeopleDebounced,
      setNumPeople: (
        numPeople: number | null,
        onUpdateDebouncedState?: () => void,
      ) =>
        setNumPeopleString(
          numPeople ? `${numPeople}` : null,
          onUpdateDebouncedState,
        ),
    }),
    [numPeople, numPeopleDebounced, setNumPeopleString],
  );

  return state;
};

export const useBudget = () => {
  const [session] = useSession();
  const isAdmin = session?.roles.includes("admin");

  const [_budget, _setBudget] = useSearchParamsObjectState([
    "budgetMin",
    "budgetMax",
  ]);

  const budgetMin =
    _budget.budgetMin && isAdmin ? parseInt(_budget.budgetMin) : null;
  const budgetMax =
    _budget.budgetMax && isAdmin ? parseInt(_budget.budgetMax) : null;

  const setBudget = useCallback(
    (min: number | null, max: number | null) => {
      if (min !== budgetMin || max !== budgetMax) {
        _setBudget({
          budgetMin: min?.toString() ?? null,
          budgetMax: max?.toString() ?? null,
        });
      }
    },
    [_setBudget, budgetMax, budgetMin],
  );

  const state = useMemo(
    () => ({ budgetMin, budgetMax, setBudget }),
    [budgetMax, budgetMin, setBudget],
  );

  return state;
};

export const useSearchState = () => {
  const [page, setPage] = useState(1);

  const { data: cities = [] } = useCities({ enabled: true });
  const { data: availableAttributes = [] } = useAttributes();

  const { date, start, end, setDateStartEnd } = useDateStartEnd();
  const { numPeople, numPeopleDebounced, setNumPeople } = useNumPeople();
  const { budgetMin, budgetMax, setBudget } = useBudget();

  const [eventTypeString, setEventType] =
    useSearchParamsState<SpaceEventType>("eventType");
  const [journeyString] = useSearchParamsState<"venues" | "services">(
    "journey",
  );
  const [_boundsCity, _setBoundsCity] = useSearchParamsObjectState([
    "top",
    "right",
    "bottom",
    "left",
    "city",
  ]);
  const [attributes, setAttributes] =
    useSearchParamsArrayState<AttributeFilterKey>("attributes");
  const [tabFilterString, setTabFilter] =
    useSearchParamsState<TabFilterKey>("category");
  const [keywords, setKeywords] = useSearchParamsArrayState<string>("q");

  const [hoveredSearchResultId, setHoveredSearchResultId] = useState<
    string | null
  >(null);

  const [hasDoneInitialFit, setHasDoneInitialFit] = useState(false);

  // EventType

  const eventTypeOptions = getEventTypeOptions(availableAttributes);

  const eventType: SpaceEventType | null =
    eventTypeOptions.find(({ id }) => id === eventTypeString)?.id ?? null;

  // Bounds & City

  const top = _boundsCity.top ? parseFloat(_boundsCity.top) : null;
  const right = _boundsCity.right ? parseFloat(_boundsCity.right) : null;
  const bottom = _boundsCity.bottom ? parseFloat(_boundsCity.bottom) : null;
  const left = _boundsCity.left ? parseFloat(_boundsCity.left) : null;

  const bounds = useMemo(
    () =>
      !!top && !!right && !!left && !!bottom
        ? { top, right, left, bottom }
        : undefined,
    [bottom, left, right, top],
  );

  const city = _boundsCity.city
    ? cities.find(({ Name }) => Name === _boundsCity.city)
      ? _boundsCity.city
      : null
    : null;

  const setBounds = useCallback(
    (newBounds: google.maps.LatLngBounds) => {
      const top = newBounds.getNorthEast().lat().toString();
      const right = newBounds.getNorthEast().lng().toString();
      const bottom = newBounds.getSouthWest().lat().toString();
      const left = newBounds.getSouthWest().lng().toString();

      if (
        parseFloat(top) !== bounds?.top ||
        parseFloat(right) !== bounds?.right ||
        parseFloat(bottom) !== bounds?.bottom ||
        parseFloat(left) !== bounds?.left
      ) {
        _setBoundsCity(
          { top, right, bottom, left, city: _boundsCity.city },
          "replace",
        );
      }
    },
    [
      _boundsCity.city,
      _setBoundsCity,
      bounds?.bottom,
      bounds?.left,
      bounds?.right,
      bounds?.top,
    ],
  );

  const setCity = useCallback(
    (newCity: string | null) => {
      const newCityData = cities.find(({ Name }) => Name === newCity);

      if (newCityData) {
        setHasDoneInitialFit(false);
        _setBoundsCity({
          top: newCityData.Top.toString(),
          right: newCityData.Right.toString(),
          bottom: newCityData.Bottom.toString(),
          left: newCityData.Left.toString(),
          city: newCity,
        });
      }
    },
    [_setBoundsCity, cities],
  );

  useEffect(() => {
    if (city && !bounds) {
      setCity(city);
    }
  }, [bounds, city, setCity]);

  // Attributes

  const attributeFilters = getAttributeFilters(availableAttributes);

  // EventType

  const tabFilters =
    journeyString === "services"
      ? getServiceTabFilters(availableAttributes)
      : getTabFilters(availableAttributes);

  const tabFilter: TabFilterKey | null =
    tabFilters.find(({ id }) => id === tabFilterString)?.id ?? null;

  // Search

  const nonAttributeKeywords = keywords.filter(
    (keyword) => !ALL_KEYWORD_OPTIONS.find(({ value }) => value === keyword),
  );

  const attributeKeywords = keywords.filter(
    (keyword) => !!ALL_KEYWORD_OPTIONS.find(({ value }) => value === keyword),
  ) as (typeof ALL_KEYWORD_OPTIONS)[number]["value"][];

  const allAttributes = [
    ...new Set(
      [
        ...attributes,
        ...attributeKeywords,
        tabFilter === null || tabFilter === "all" ? undefined : tabFilter,
      ].filter((itemOrUndefined) => !!itemOrUndefined),
    ),
  ];

  const journey: "venues" | "services" =
    journeyString === "services" ? "services" : "venues";

  const filters = {
    eventType: eventType ?? undefined,
    journey,
    date: date ? date.toString() : undefined,
    start: start ? start.string : undefined,
    end: end ? end.string : undefined,
    numPeople: numPeopleDebounced ?? undefined,
    budgetMin: budgetMin ?? undefined,
    budgetMax: budgetMax ?? undefined,
    attributes: allAttributes,
    top: bounds?.top,
    right: bounds?.right,
    bottom: bounds?.bottom,
    left: bounds?.left,
    q: nonAttributeKeywords.join(" ") || undefined,
    mode: "search" as const,
  };

  const listPageSize = PAGE_SIZE - 1;
  const mapBatchPage = Math.ceil(page / 5);
  const useSharedMapBatch = mapBatchPage === 1;

  const { data: _filteredSearchResults, isFetching: isFetchingSearch } =
    useSearch({
      ...filters,
      page: useSharedMapBatch ? 1 : page,
      pageSize: useSharedMapBatch ? 100 : listPageSize,
    });

  const totalFilteredResults = _filteredSearchResults?.totalResults;

  const { data: _moreFilteredSearchResultsForMap } = useSearch(
    {
      ...filters,
      page: mapBatchPage,
      pageSize: 100,
    },
    {
      enabled: !useSharedMapBatch && !isFetchingSearch,
    },
  );

  const { data: _unfilteredSearchResults } = useSearch(
    {
      mode: "search",
      journey,
      page,
      pageSize: listPageSize,
    },
    {
      enabled: totalFilteredResults === 0,
    },
  );

  const totalUnfilteredResults = _unfilteredSearchResults?.totalResults;

  const filteredSearchResults = instanciateSearchResults(
    useSharedMapBatch
      ? _filteredSearchResults?.data?.slice(
          (page - 1) * listPageSize,
          page * listPageSize,
        )
      : _filteredSearchResults?.data,
  );

  const moreFilteredSearchResultsForMap = instanciateSearchResults(
    useSharedMapBatch
      ? _filteredSearchResults?.data
      : _moreFilteredSearchResultsForMap?.data,
  );

  const unfilteredSearchResults = instanciateSearchResults(
    _unfilteredSearchResults?.data,
  );

  const searchResults =
    totalFilteredResults === 0
      ? unfilteredSearchResults
      : filteredSearchResults;

  const totalSearchResults =
    totalFilteredResults === 0 ? totalUnfilteredResults : totalFilteredResults;

  const mapPins = [
    ...(filteredSearchResults ?? []),
    ...(moreFilteredSearchResultsForMap ?? []),
  ].reduce<{ lat: number; lng: number; spaceIds: string[] }[]>(
    (acc, searchResult) => {
      if (!searchResult.address.latitude || !searchResult.address.longitude) {
        return acc;
      }

      const spaceAlreadyAdded = acc.find((pin) =>
        pin.spaceIds.includes(searchResult.id),
      );

      if (spaceAlreadyAdded) {
        return acc;
      }

      const existingPin = acc.find(
        (pin) =>
          pin.lat === searchResult.address.latitude &&
          pin.lng === searchResult.address.longitude,
      );

      if (existingPin) {
        existingPin.spaceIds.push(searchResult.id);
      } else {
        acc.push({
          lat: searchResult.address.latitude,
          lng: searchResult.address.longitude,
          spaceIds: [searchResult.id],
        });
      }

      return acc;
    },
    [],
  );

  const state = useMemo(
    () => ({
      eventTypeOptions,
      eventType,
      setEventType: (newEventType: SpaceEventType | null) => {
        setEventType(newEventType);
        setPage(1);
      },
      journey,
      cities,
      city,
      setCity: (newCity: string | null) => {
        setCity(newCity);
        setPage(1);
      },
      numPeople,
      numPeopleDebounced,
      setNumPeople: (
        numPeople: number | null,
        onUpdateDebouncedState?: () => void,
      ) => {
        setNumPeople(numPeople, () => {
          onUpdateDebouncedState?.();
          setPage(1);
        });
      },
      budgetMin,
      budgetMax,
      setBudget: (min: number | null, max: number | null) => {
        setBudget(min, max);
        setPage(1);
      },
      bounds,
      setBounds: (newBounds: google.maps.LatLngBounds) => {
        setBounds(newBounds);
        setPage(1);
      },
      hasDoneInitialFit,
      setHasDoneInitialFit,
      date,
      start,
      end,
      setDateStartEnd: (
        newDate: CalendarDate | null,
        newStart: TimeDuration | null,
        newEnd: TimeDuration | null,
      ) => {
        setDateStartEnd(newDate, newStart, newEnd);
        setPage(1);
      },
      attributeFilters,
      attributes,
      setAttributes: (newAttributes: AttributeFilterKey[]) => {
        setAttributes(newAttributes);
        setPage(1);
      },
      tabFilters,
      tabFilter,
      setTabFilter: (newTabFilter: TabFilterKey) => {
        setTabFilter(newTabFilter);
        setPage(1);
      },
      keywords,
      setKeywords: (newKeywords: string[]) => {
        setKeywords(newKeywords);
        setPage(1);
      },
      hoveredSearchResultId,
      setHoveredSearchResultId,
      searchResults: searchResults,
      totalFilteredResults,
      isFetchingSearchResults: isFetchingSearch,
      mapPins,
      page,
      setPage,
      numPages: Math.ceil((totalSearchResults ?? 0) / PAGE_SIZE),
    }),
    [
      eventTypeOptions,
      eventType,
      setEventType,
      journey,
      cities,
      city,
      setCity,
      numPeople,
      numPeopleDebounced,
      setNumPeople,
      budgetMin,
      budgetMax,
      setBudget,
      bounds,
      setBounds,
      hasDoneInitialFit,
      date,
      start,
      end,
      setDateStartEnd,
      attributeFilters,
      attributes,
      setAttributes,
      tabFilters,
      tabFilter,
      setTabFilter,
      keywords,
      setKeywords,
      hoveredSearchResultId,
      searchResults,
      totalFilteredResults,
      totalSearchResults,
      isFetchingSearch,
      mapPins,
      page,
    ],
  );

  return state;
};

export type SearchState = ReturnType<typeof useSearchState>;

export const SearchContext = createContext<SearchState>({
  eventTypeOptions: [],
  eventType: null,
  setEventType: () => {},
  journey: "venues",
  cities: [],
  city: null,
  setCity: () => {},
  numPeople: null,
  numPeopleDebounced: null,
  setNumPeople: () => {},
  budgetMin: null,
  budgetMax: null,
  setBudget: () => {},
  bounds: undefined,
  setBounds: () => {},
  hasDoneInitialFit: false,
  setHasDoneInitialFit: () => {},
  date: null,
  start: null,
  end: null,
  setDateStartEnd: () => {},
  attributeFilters: [],
  attributes: [],
  setAttributes: () => {},
  tabFilters: [],
  tabFilter: null,
  setTabFilter: () => {},
  keywords: [],
  setKeywords: () => {},
  hoveredSearchResultId: null,
  setHoveredSearchResultId: () => {},
  searchResults: undefined,
  totalFilteredResults: undefined,
  isFetchingSearchResults: true,
  mapPins: [],
  page: 1,
  setPage: () => {},
  numPages: 1,
});

export const useSearchContext = () => {
  const searchState = useContext(SearchContext);

  return searchState;
};

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const searchState = useSearchState();

  return <SearchContext value={searchState}>{children}</SearchContext>;
};

export const useSearchDateStartEndTooltip = () => {
  const [showDateStartEndTooltip, setShowDateStartEndTooltip] = useState(false);

  useEffect(() => {
    const timeId = setTimeout(() => {
      setShowDateStartEndTooltip(true);
    }, 2000);

    return () => {
      clearTimeout(timeId);
    };
  }, []);

  useEffect(() => {
    const timeId = setTimeout(() => {
      setShowDateStartEndTooltip(false);
    }, 7000);

    return () => {
      clearTimeout(timeId);
    };
  }, []);

  return showDateStartEndTooltip;
};

export const getGASearchEventData = (search: SearchState) => {
  return {
    Rinu_eLabel3: search.eventType,
    Rinu_eLabel4: search.city,
    Rinu_eLabel5: search.date
      ? `${search.date.toString()}: ${search.start?.timeLabel}-${
          search.end?.timeLabel
        }`
      : null,
    Rinu_eLabel6: search.numPeople,
    Rinu_eLabel7: search.attributes.join(",") || null,
    Rinu_eLabel8: search.tabFilter,
  };
};
