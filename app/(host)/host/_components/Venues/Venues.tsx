"use client";

import Stack from "@/_design_system/Stack";
import SpacesTable from "./SpacesTable";
import VenueName from "../VenueName";
import SubscriptionSection from "../Subscription";
import VenueCollaboratorsSection from "../VenueCollaborators";
import { DashboardList } from "../useDashboardList";
import { useSession } from "@/_services/session";
import Tag from "@/_design_system/Tag";
import EmptyState from "@/_components/EmptyState";

const Venues = ({
  dashboardList,
  journey,
}: {
  dashboardList: DashboardList;
  // When set, only that journey is shown (used by the dedicated
  // "Gestão de espaços" / "Gestão de serviços" pages).
  journey?: "venues" | "services";
}) => {
  if (dashboardList.isPendingSpaces) {
    return null;
  }

  const venuesFromVenuesJourney = dashboardList.venues.filter(
    (venue) => venue.venue.isVenuesJourney,
  );
  const venuesFromServicesJourney = dashboardList.venues.filter(
    (venue) => venue.venue.isServicesJourney,
  );

  const showVenues = journey !== "services";
  const showServices = journey !== "venues";

  const hasVenues = showVenues && venuesFromVenuesJourney.length > 0;
  const hasServices = showServices && venuesFromServicesJourney.length > 0;

  if (!hasVenues && !hasServices) {
    return (
      <EmptyState
        text={{
          body:
            journey === "services"
              ? "Ainda não tem empresas de serviços. Adicione a primeira."
              : journey === "venues"
                ? "Ainda não tem locais. Adicione o primeiro."
                : "Ainda não tem locais nem empresas.",
        }}
      />
    );
  }

  return (
    <>
      {hasVenues && (
        <>
          {!journey && <h2>Locais</h2>}
          {venuesFromVenuesJourney.map((venue) => (
            <VenueDetail key={venue.venue.id} venue={venue} />
          ))}
        </>
      )}
      {hasVenues && hasServices && <hr />}
      {hasServices && (
        <>
          {!journey && <h2>Empresas</h2>}
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
      <Stack
        row
        gap="1rem"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
      >
        <Stack row gap="0.5rem" alignItems="center" flexWrap="wrap">
          <VenueName showEdit={isOwner} venue={venue.venue} />
          {isCollaborator && (
            <Tag size="small" type="info" text="Acesso de colaborador" />
          )}
        </Stack>
        {isOwner && <VenueCollaboratorsSection venue={venue.venue} />}
      </Stack>
      {isOwner && venue.spaces.length > 0 && (
        <SubscriptionSection venue={venue.venue} />
      )}
      <SpacesTable venue={venue} />
    </Stack>
  );
};

export default Venues;
