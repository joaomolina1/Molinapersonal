"use client";

import Stack from "@/_design_system/Stack";
import SpacesTable from "./SpacesTable";
import VenueName from "../VenueName";
import SubscriptionSection from "../Subscription";
import VenueCollaboratorsSection from "../VenueCollaborators";
import { DashboardList } from "../useDashboardList";
import { useSession } from "@/_services/session";
import Tag from "@/_design_system/Tag";

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
  const [session] = useSession();
  const isOwner = session?.user_id === venue.venue.ownerID;
  const isCollaborator = venue.venue.accessRole === "collaborator";

  return (
    <Stack gap="1.5rem" style={{ padding: "24px 0" }}>
      <Stack row gap="0.5rem" alignItems="center" flexWrap="wrap">
        <VenueName showEdit={isOwner} venue={venue.venue} />
        {isCollaborator && (
          <Tag size="small" type="info" text="Acesso de colaborador" />
        )}
      </Stack>
      {isOwner && venue.spaces.length > 0 && (
        <SubscriptionSection venue={venue.venue} />
      )}
      {isOwner && <VenueCollaboratorsSection venue={venue.venue} />}
      <SpacesTable venue={venue} />
    </Stack>
  );
};

export default Venues;
