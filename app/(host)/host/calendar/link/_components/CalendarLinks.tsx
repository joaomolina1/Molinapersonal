"use client";

import Stack from "@/_design_system/Stack";
import { useAllSpaces } from "@/_models/space";
import { useVenues } from "@/_models/venue";
import CalendarLink from "./CalendarLink";
import { useMemo } from "react";
import VenueName from "@/(host)/host/_components/VenueName";

const CalendarLinks = () => {
  const { data: allVenues = [] } = useVenues();
  const { data: allSpaces = [] } = useAllSpaces();

  const activeVenuesWithActiveSpaces = useMemo(
    () =>
      allVenues
        .filter((venue) => venue.status === "active")
        .map((venue) =>
          Object.assign(venue, {
            spaces: allSpaces.filter(
              (space) =>
                space.status === "active" && space.venueID === venue.id,
            ),
          }),
        )
        .filter((venue) => !!venue.spaces.length),
    [allSpaces, allVenues],
  );

  return (
    <Stack gap="2rem">
      {activeVenuesWithActiveSpaces.map((venue) => (
        <Stack key={venue.id} gap="1rem">
          <VenueName venue={venue} />
          {venue.spaces.map((space) => (
            <CalendarLink key={space.id} space={space} />
          ))}
        </Stack>
      ))}
    </Stack>
  );
};

export default CalendarLinks;
