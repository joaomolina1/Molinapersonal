import { Space } from "@/_models/space";
import RecapItem, { RecapItemPhotos, RecapItemText } from "./RecapItem";
import AmenitiesItem, { AmenitiesList } from "@/_design_system/AmenitiesItem";
import Stack from "@/_design_system/Stack";
import IconUserInterfaceMiscellaneousSeparatorDot from "@/_design_system/_icons/UserInterface/Miscellaneous/SeparatorDot.svg";
import { usePhotos } from "@/_models/photo";
import { useSession } from "@/_services/session";

const SpaceRecap = ({ space }: { space: Space }) => {
  const step2Href = `/onboarding/space?spaceID=${space.id}`;
  const step3Href = `/onboarding/space-details?spaceID=${space.id}`;

  const { data: photos = [] } = usePhotos(space.allPhotoIDs);

  const [session] = useSession();
  const isAdmin = session?.roles.includes("admin");

  return (
    <div>
      <RecapItem
        label={space.name}
        editHref={`${step2Href}&scrollTo=name`}
        showEditButton={space.isInProgress && !isAdmin}
      >
        {space.isVenuesJourney && (
          <Stack gap="0.5rem">
            {!!space.privacyAttribute && (
              <AmenitiesItem
                icon={space.privacyAttribute.icon}
                label={
                  <Stack row alignItems="center">
                    {space.privacyAttribute.label}
                    {space.area && (
                      <>
                        <IconUserInterfaceMiscellaneousSeparatorDot />
                        {space.area} m<sup>2</sup>
                      </>
                    )}
                  </Stack>
                }
              />
            )}
            {!!space.kindAttribute && (
              <AmenitiesItem
                icon={space.kindAttribute.icon}
                label={space.kindAttribute.label}
              />
            )}
          </Stack>
        )}
        {space.isServicesJourney && !!space.serviceTypeAttribute && (
          <AmenitiesList items={[space.serviceTypeAttribute]} />
        )}
        <RecapItemText text={space.description ?? "-"} />
        {space.isVenuesJourney && space.categoryAttributes.length > 0 && (
          <AmenitiesList
            items={space.categoryAttributes.map(({ label, icon }) => ({
              label,
              icon,
            }))}
          />
        )}
      </RecapItem>
      <RecapItem
        label={
          space.isServicesJourney
            ? "Fotografias do serviço"
            : "Fotografias do espaço"
        }
        editHref={`${step2Href}&scrollTo=photos`}
        showEditButton={space.isInProgress && !isAdmin}
      >
        {photos.length ? (
          <RecapItemPhotos photos={photos} />
        ) : (
          <RecapItemText text="Sem fotografias" />
        )}
      </RecapItem>
      {space.isVenuesJourney && (
        <RecapItem
          label="Facilidades"
          editHref={`${step3Href}&scrollTo=facilities`}
          showEditButton={space.isInProgress && !isAdmin}
        >
          {space.facilitiesAttributes.length > 0 ? (
            <AmenitiesList
              items={space.facilitiesAttributes.map(({ label, icon }) => ({
                label,
                icon,
              }))}
            />
          ) : (
            <RecapItemText text="Sem facilidades" />
          )}
        </RecapItem>
      )}
      {space.isVenuesJourney && (
        <RecapItem
          label="Acessibilidades"
          editHref={`${step3Href}&scrollTo=accessibilities`}
          showEditButton={space.isInProgress && !isAdmin}
        >
          {space.accessibilitiesAttributes.length > 0 ? (
            <AmenitiesList
              items={space.accessibilitiesAttributes.map(({ label, icon }) => ({
                label,
                icon,
              }))}
            />
          ) : (
            <RecapItemText text="Sem acessibilidades" />
          )}
        </RecapItem>
      )}
      <RecapItem
        label="Tipos de eventos"
        editHref={`${step3Href}&scrollTo=eventTypes`}
        showEditButton={space.isInProgress && !isAdmin}
      >
        {space.eventTypeAttributes.length > 0 ? (
          <AmenitiesList
            items={space.eventTypeAttributes.map(({ label, icon }) => ({
              label,
              icon,
            }))}
          />
        ) : (
          <RecapItemText text="Tipos de eventos não especificados" />
        )}
      </RecapItem>
      {space.isVenuesJourney && (
        <RecapItem
          label="Catering disponível"
          editHref={`${step3Href}&scrollTo=catering`}
          showEditButton={space.isInProgress && !isAdmin}
        >
          {space.cateringAttributes.length > 0 ? (
            <AmenitiesList
              items={space.cateringAttributes.map(({ label, icon }) => ({
                label,
                icon,
              }))}
            />
          ) : (
            <RecapItemText text="Sem catering" />
          )}
        </RecapItem>
      )}
      {space.isVenuesJourney && (
        <RecapItem
          label="Equipamento de música e som"
          editHref={`${step3Href}&scrollTo=sound`}
          showEditButton={space.isInProgress && !isAdmin}
        >
          {space.soundAttributes.length > 0 ? (
            <AmenitiesList
              items={space.soundAttributes.map(({ label, icon }) => ({
                label,
                icon,
              }))}
            />
          ) : (
            <RecapItemText text="Não disponível" />
          )}
        </RecapItem>
      )}
    </div>
  );
};

export default SpaceRecap;
