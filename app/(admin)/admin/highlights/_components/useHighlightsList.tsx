import {
  HIGHLIGHT_MODES,
  HIGHLIGHT_STATUSES,
  HighlightMode,
  HighlightStatus,
} from "@/_constants/highlights";
import { Highlight, useHighlights } from "@/_models/highlight";
import { Space, useAllSpaces } from "@/_models/space";
import { useVenues, Venue } from "@/_models/venue";
import { lowerCaseIncludes } from "@/_utils/text";
import { useState } from "react";

const modeOptions = [
  { id: "all", text: "Todas as zonas" },
  ...HIGHLIGHT_MODES.map(({ id, label }) => ({ id, text: label })),
] as const;

const statusOptions = [
  { id: "all", text: "Todos os estados" },
  ...HIGHLIGHT_STATUSES.map(({ id, label }) => ({ id, text: label })),
] as const;

export const useHighlightsList = () => {
  const { data: highlights = [] } = useHighlights();
  const { data: venues = [] } = useVenues();
  const { data: spaces = [] } = useAllSpaces();

  const [query, setQuery] = useState<string>("");
  const [venue, setVenue] = useState<string>("all");
  const [space, setSpace] = useState<string>("all");
  const [mode, setMode] = useState<HighlightMode | "all">("all");
  const [status, setStatus] = useState<HighlightStatus | "all">("all");

  const venueOptions = [
    {
      id: "all",
      text: "Todos os locais",
    },
    ...venues.map((venue) => ({
      id: venue.id,
      text: venue.name || `Sem nome (${venue.reference})`,
    })),
  ];

  const spacesForVenue =
    venue === "all"
      ? spaces
      : spaces.filter((space) => space.venueID === venue);

  const spaceOptions = [
    {
      id: "all",
      text: "Todos os espaços",
    },
    ...spacesForVenue.map((space) => ({
      id: space.id,
      text: space.name || `Sem nome (${space.reference})`,
    })),
  ];

  const modalSpaceOptions = spaces
    .map((space) => {
      const venue = venues.find((venue) => venue.id === space.venueID);
      const venueName = venue?.name || `Sem nome (${venue?.reference})`;
      const spaceName = space.name || "Sem nome";

      return {
        id: space.id,
        text: `${venueName} - ${space.reference} - ${spaceName}`,
        status: space.status,
      };
    })
    .sort((a, b) => a.text.localeCompare(b.text));

  const queryFilter = (highlight: HighlightWithRelations) =>
    lowerCaseIncludes(highlight.spaceID, query) ||
    lowerCaseIncludes(highlight.space?.name ?? "", query) ||
    lowerCaseIncludes(highlight.space?.reference ?? "", query) ||
    lowerCaseIncludes(highlight.venue?.name ?? "", query) ||
    lowerCaseIncludes(highlight.venue?.reference ?? "", query);

  const venueFilter = (highlight: HighlightWithRelations) =>
    venue === "all" || highlight.venue?.id === venue;

  const spaceFilter = (highlight: HighlightWithRelations) =>
    space === "all" || highlight.space?.id === space;

  const modeFilter = (highlight: HighlightWithRelations) =>
    mode === "all" || highlight.mode === mode;

  const statusFilter = (highlight: HighlightWithRelations) =>
    status === "all" || highlight.status === status;

  const highlightsToDisplay = (highlights ?? [])
    .map((highlight) => {
      const space = spaces.find(({ id }) => id === highlight.spaceID);
      const venue = venues.find(({ id }) => id === space?.venueID);

      return Object.assign(highlight, {
        space,
        venue,
      });
    })
    .filter(queryFilter)
    .filter(venueFilter)
    .filter(spaceFilter)
    .filter(modeFilter)
    .filter(statusFilter);

  return {
    highlights: highlightsToDisplay,
    query,
    setQuery,
    venue,
    setVenue,
    venueOptions,
    space,
    setSpace,
    spaceOptions,
    mode,
    setMode,
    modeOptions,
    status,
    setStatus,
    statusOptions,
    modalSpaceOptions,
  };
};

export type HighlightsList = ReturnType<typeof useHighlightsList>;
export type HighlightWithRelations = Highlight & {
  space?: Space;
  venue?: Venue;
};
