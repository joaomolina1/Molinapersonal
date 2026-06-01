"use client";

import Stack from "@/_design_system/Stack";
import SpacesTable from "./SpacesTable";
import VenueName from "../VenueName";
import { DashboardList } from "../useDashboardList";

const Venues = ({ dashboardList }: { dashboardList: DashboardList }) => {
  if (dashboardList.isPendingSpaces) {
    return null;
  }

  const venuesFromVenuesJourney = dashboardList.venues.filter(
    (venue) => venue.venue.isVenuesJourney,
  );
  const venuesFromServicesJourney = dashboardList.venues.filter(
    (venue) => venue.venue.isServicesJourney,
  );

  const hasVenues = venuesFromVenuesJourney.length > 0;
  const hasServices = venuesFromServicesJourney.length > 0;

  if (!hasVenues && !hasServices) {
    return null;
  }

  return (
    <>
      {hasVenues && (
        <>
          <h2>Locais</h2>
          {venuesFromVenuesJourney.map((venue) => (
            <VenueDetail key={venue.venue.id} venue={venue} />
          ))}
        </>
      )}
      {hasVenues && hasServices && <hr />}
      {hasServices && (
        <>
          <h2>Empresas</h2>
          {venuesFromServicesJourney.map((venue) => (
            <VenueDetail key={venue.venue.id} venue={venue} />
          ))}
        </>
      )}
    </>
  );
};

const VenueDetail = ({ venue }: { venue: DashboardList["venues"][number] }) => {
  return (
    <Stack gap="1.5rem" style={{ padding: "24px 0" }}>
      <VenueName showEdit venue={venue.venue} />
      <SpacesTable venue={venue} />
    </Stack>
  );
};

export default Venues;
