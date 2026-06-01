import { Venue } from "@/_models/venue";
import RecapItem, {
  RecapItemPhotos,
  RecapItemText,
  RecapItemValue,
} from "./RecapItem";
import { AmenitiesList } from "@/_design_system/AmenitiesItem";
import Stack from "@/_design_system/Stack";
import { usePhotos } from "@/_models/photo";
import { useSession } from "@/_services/session";

const VenueRecap = ({ venue }: { venue: Venue }) => {
  const step1Href = `/onboarding/venue?venueID=${venue.id}`;

  const { data: photos = [] } = usePhotos(venue.allPhotoIDs);

  const [session] = useSession();
  const isAdmin = session?.roles.includes("admin");

  return (
    <div>
      <RecapItem
        label="Descrição"
        editHref={`${step1Href}&scrollTo=description`}
        showEditButton={venue.isInProgress && !isAdmin}
      >
        <RecapItemText text={venue.description ?? "-"} />
      </RecapItem>
      <RecapItem
        label="Localizaçao"
        editHref={`${step1Href}&scrollTo=address`}
        showEditButton={venue.isInProgress && !isAdmin}
      >
        <RecapItemText
          text={
            <>
              Portugal - PT
              <br />
              {venue.street1} {venue.street2}
              <br />
              {venue.postalCode} {venue.city}
            </>
          }
        />
      </RecapItem>
      {venue.isVenuesJourney && (
        <RecapItem
          label="Alojamento"
          editHref={`${step1Href}&scrollTo=sleepingParking`}
          showEditButton={venue.isInProgress && !isAdmin}
        >
          {venue.sleepingAttributes.length > 0 ? (
            <AmenitiesList
              items={venue.sleepingAttributes.map(({ label, icon }) => ({
                label,
                icon,
              }))}
            />
          ) : (
            <RecapItemText text="Sem opções de alojamento" />
          )}
        </RecapItem>
      )}
      {venue.isVenuesJourney && (
        <RecapItem
          label="Estacionamento"
          editHref={`${step1Href}&scrollTo=sleepingParking`}
          showEditButton={venue.isInProgress && !isAdmin}
        >
          {venue.parkingAttributes.length > 0 ? (
            <AmenitiesList
              items={venue.parkingAttributes.map(({ label, icon }) => ({
                label,
                icon,
              }))}
            />
          ) : (
            <RecapItemText text="Sem opções de estacionamento" />
          )}
        </RecapItem>
      )}
      <RecapItem
        label={venue.isServicesJourney ? "Logótipo" : "Fotografias do local"}
        editHref={`${step1Href}&scrollTo=photos`}
        showEditButton={venue.isInProgress && !isAdmin}
      >
        {photos.length ? (
          <RecapItemPhotos photos={photos} />
        ) : (
          <RecapItemText text="Sem fotografias" />
        )}
      </RecapItem>
      <RecapItem
        label="Dados de faturação"
        editHref={`${step1Href}&scrollTo=billing`}
        showEditButton={venue.isInProgress && !isAdmin}
      >
        <Stack gap="1.5rem">
          <RecapItemValue label="Nome" value={venue.billingName ?? "-"} />
          <RecapItemValue label="NIF" value={venue.billingVAT ?? "-"} />
          <RecapItemValue
            label="Morada"
            value={
              !!venue.billingAddress ||
              !!venue.billingPostalCode ||
              !!venue.billingCity
                ? [
                    venue.billingAddress,
                    venue.billingPostalCode,
                    venue.billingCity,
                  ].join(" ")
                : "-"
            }
          />
          <RecapItemValue label="IBAN" value={venue.billingIBAN ?? "-"} />
          <RecapItemValue
            label="E-mail para envio da fatura"
            value={venue.billingEmail ?? "-"}
          />
        </Stack>
      </RecapItem>
      <RecapItem
        label="Responsável pelo espaço"
        editHref={`${step1Href}&scrollTo=contact`}
        showEditButton={venue.isInProgress && !isAdmin}
      >
        <Stack gap="1.5rem">
          <RecapItemValue label="Nome" value={venue.contactName ?? "-"} />
          <RecapItemValue
            label="Telemóvel"
            value={
              venue.contactPhoneNumber && venue.contactPhoneExtension
                ? `+${venue.contactPhoneExtension}${venue.contactPhoneNumber}`
                : "-"
            }
          />
          <RecapItemValue label="Email" value={venue.contactEmail ?? "-"} />
        </Stack>
      </RecapItem>
    </div>
  );
};

export default VenueRecap;
