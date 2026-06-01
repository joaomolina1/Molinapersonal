import { useBookings } from "@/_models/booking";
import { useAllSpaces } from "@/_models/space";
import { useVenues } from "@/_models/venue";

export const useDashboardList = () => {
  const { data: venues = [] } = useVenues();
  const { data: spaces = [], isPending: isPendingSpaces } = useAllSpaces();
  const { data: bookings = [] } = useBookings(
    { space_id: spaces.map((space) => space.id) },
    { enabled: spaces.length > 0 },
  );

  const list = venues.map((venue) => ({
    venue,
    spaces: spaces
      .filter((space) => space.venueID === venue.id)
      .map((space) => ({
        space,
        bookings: bookings.filter((booking) => booking.spaceID === space.id),
      })),
  }));

  return { venues: list, isPendingSpaces };
};

export type DashboardList = ReturnType<typeof useDashboardList>;
