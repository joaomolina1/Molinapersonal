import { Space } from "@/_models/space";
import { Venue } from "@/_models/venue";
import { createBEMClasses } from "@/_utils/classname";
import PhotoCarousel from "./PhotoCarousel";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceMiscellaneousPin from "@/_design_system/_icons/UserInterface/Miscellaneous/Pin.svg";
import Tag from "@/_design_system/Tag";
import { isNotNil } from "@/_utils/filter";
import { AmenitiesList } from "@/_design_system/AmenitiesItem";
import { MapWithPin } from "@/_design_system/Map";
import { useMediaQuery } from "@/_utils/mediaQuery";
import IconUserInterfaceActionsShare from "@/_design_system/_icons/UserInterface/Actions/Share.svg";
import Button, { NavButton } from "@/_design_system/Button";
import Packs from "./Packs";
import { getPhotoURLs, Photo, usePhotos } from "@/_models/photo";
import { useSearchResults } from "@/_models/search";
import SpaceCard from "@/(main)/search/_components/SearchResults/_components/SpaceCard";
import { Suspense, useEffect, useState } from "react";
import SavedSpaceButton from "../SavedSpaceButton";
import { SearchResult } from "@/_models/search";
import { sendGAEvent } from "@next/third-parties/google";
import {
  PackSearchHook,
  getGaPackSearchData,
  usePackSearch,
} from "./Packs/PackSearch/PackSearch";
import Reviews from "./Reviews";
import PhotoGrid from "@/_design_system/PhotoGrid";
import config from "@/_utils/config";
import IconUserInterfaceMiscellaneousChat from "@/_design_system/_icons/UserInterface/Miscellaneous/Chat.svg";
import { useQuoteRequestContext } from "@/(main)/_components/QuoteRequest";
import HiddenVenueName from "../HiddenVenueName";
import { useHideVenueName } from "../HiddenVenueName/HiddenVenueName";

const { block, element } = createBEMClasses("space-page");

const SpacePage = ({
  space,
  venue,
  mode,
}: {
  space: Space;
  venue: Venue;
  mode: "public" | "auth";
}) => {
  const { data: photos = [] } = usePhotos([
    ...space.allPhotoIDs,
    ...venue.allPhotoIDs,
  ]);

  return (
    <Stack gap="1.5rem">
      <SpacePhotoCaroussel space={space} photos={photos} venue={venue} />
      <Stack className={block()}>
        <SpaceInfo space={space} venue={venue} photos={photos} />
        <Suspense fallback={null}>
          <Packs space={space} mode={mode} venue={venue} />
        </Suspense>
        {space.isVenuesJourney && <Facilities space={space} />}
        <EventTypes space={space} />
        {config.enableReviews && (
          <Suspense fallback={null}>
            <Reviews space={space} venue={venue} />
          </Suspense>
        )}
        <Location venue={venue} />
        <VenueInfo space={space} venue={venue} spaceID={space.id} />
      </Stack>
    </Stack>
  );
};

const SpacePhotoCaroussel = ({
  space,
  photos,
  venue,
}: {
  space: Space;
  photos: Photo[];
  venue: Venue;
}) => {
  return (
    <div className={element("carousel-wrapper")}>
      <PhotoCarousel
        photoURLs={getPhotoURLs(photos, "large")}
        topRightButtons={
          <>
            <Suspense fallback={null}>
              <SpaceShareButtonMobile space={space} venue={venue} />
            </Suspense>

            <SavedSpaceButton spaceId={space.id} variant="space-page-mobile" />

            <ContactSpaceButton space={space} venue={venue} />
          </>
        }
      />
    </div>
  );
};

const SpaceShareButtonMobile = ({
  space,
  venue,
}: {
  space: Space;
  venue: Venue;
}) => {
  const packSearch = usePackSearch();

  const [showShareButton, setShowShareButton] = useState(false);

  useEffect(() => {
    setShowShareButton(!!window.navigator && !!window.navigator.share);
  }, []);

  if (!showShareButton) {
    return null;
  }
  return (
    <NavButton
      ariaLabel="Partilhar"
      icon={<IconUserInterfaceActionsShare />}
      onClick={() => {
        window.navigator.share({
          url: window.location.href,
          title: document.title,
        });
        handleSpaceSharingClick(space, venue, packSearch);
      }}
    />
  );
};

const ContactSpaceButton = ({
  space,
  venue,
}: {
  space: Space;
  venue: Venue;
}) => {
  const isMobile = useMediaQuery("large");
  const { setQuoteRequestModalData } = useQuoteRequestContext();

  const onClick = () => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: "/space",
      Rinu_ItemCategory: "contact_request",
      Rinu_ItemType: "info_type",
      Rinu_eLabel1: undefined,
      Rinu_eLabel2: space.name,
      Rinu_eLabel3: venue.name,
      Rinu_eLabel4: undefined,
      Rinu_eLabel5: space.id,
      Rinu_eLabel6: venue.id,
    });

    if (!isMobile) {
      setQuoteRequestModalData({
        isOpen: true,
        context: {
          type: "contact-request",
          spaceID: space.id,
          venueID: venue.id,
        },
      });
    }
  };

  if (isMobile === undefined) {
    return;
  }

  if (isMobile) {
    return (
      <NavButton
        ariaLabel="Pedir informações"
        icon={<IconUserInterfaceMiscellaneousChat />}
        href={`/contact-request?spaceID=${space.id}&venueID=${venue.id}`}
        onClick={onClick}
      />
    );
  }

  return (
    <Button
      type="secondary"
      label="Pedir informações"
      leftIcon={<IconUserInterfaceMiscellaneousChat />}
      onClick={onClick}
    />
  );
};

const SpaceName = ({ space, venue }: { space: Space; venue: Venue }) => {
  return (
    <>
      {space.name}
      <HiddenVenueName
        name={` · ${venue.name}`}
        subscription={venue.subscription}
      />
    </>
  );
};

const SpaceInfo = ({
  space,
  venue,
  photos,
}: {
  space: Space;
  venue: Venue;
  photos: Photo[];
}) => {
  const isMobile = useMediaQuery("large");

  return (
    <Stack gap="2.5rem">
      <PhotoGrid
        photos={photos.map((photo, index) => ({
          gridURL: index <= 1 ? photo.large : photo.medium,
          modalURL: photo.large,
          listURL: photo.small,
        }))}
        label={<SpaceName space={space} venue={venue} />}
        layout="grid-5"
        overlayMode="match"
        className={element("photo-grid")}
      />
      <Stack gap="1.5rem">
        <Stack
          row
          gap="1.5rem"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <TextBlock
            title={
              isMobile ? undefined : <SpaceName space={space} venue={venue} />
            }
            subtitle={
              isMobile ? <SpaceName space={space} venue={venue} /> : undefined
            }
            body={
              <Stack row gap="0.5rem">
                <IconUserInterfaceMiscellaneousPin
                  style={{ fontSize: "1.25rem" }}
                />
                {venue.city}
              </Stack>
            }
          />
          {!isMobile && (
            <Stack row gap="1rem">
              {
                <Suspense fallback={null}>
                  <SpaceShareButtonDesktop space={space} venue={venue} />
                </Suspense>
              }

              <SavedSpaceButton
                spaceId={space.id}
                variant="space-page-desktop"
              />

              <ContactSpaceButton space={space} venue={venue} />
            </Stack>
          )}
        </Stack>
        <Stack gap="0.5rem" row flexWrap="wrap">
          {(space.isServicesJourney
            ? [space.serviceTypeAttribute]
            : [
                space.privacyAttribute,
                space.kindAttribute,
                ...space.categoryAttributes,
                ...venue.parkingAttributes,
                ...venue.sleepingAttributes,
              ]
          )
            .filter(isNotNil)
            .map(({ id, icon, label }) => (
              <Tag key={id} iconLeft={icon} text={label} />
            ))}
        </Stack>
        <p className={element("description")}>{space.description}</p>
      </Stack>
    </Stack>
  );
};

const SpaceShareButtonDesktop = ({
  space,
  venue,
}: {
  space: Space;
  venue: Venue;
}) => {
  const packSearch = usePackSearch();

  const [showShareButton, setShowShareButton] = useState(false);

  useEffect(() => {
    setShowShareButton(!!window.navigator && !!window.navigator.share);
  }, []);

  if (!showShareButton) {
    return null;
  }

  return (
    <Button
      type="secondary"
      label="Partilhar"
      leftIcon={<IconUserInterfaceActionsShare />}
      onClick={() => {
        window.navigator.share({
          url: window.location.href,
          title: document.title,
        });
        handleSpaceSharingClick(space, venue, packSearch);
      }}
    />
  );
};

const Facilities = ({ space }: { space: Space }) => {
  const isMobile = useMediaQuery("large");

  return (
    <Stack gap="1.5rem">
      <TextBlock
        label={isMobile ? "Principais facilidades" : undefined}
        subtitle={isMobile ? undefined : "Principais facilidades"}
      />
      <AmenitiesList
        items={[
          ...space.facilitiesAttributes,
          ...space.accessibilitiesAttributes,
          ...space.cateringAttributes,
          ...space.soundAttributes,
        ].map(({ icon, label }) => ({ icon, label }))}
      />
    </Stack>
  );
};

const EventTypes = ({ space }: { space: Space }) => {
  const isMobile = useMediaQuery("large");

  return (
    <Stack gap="1.5rem">
      <TextBlock
        label={isMobile ? "Tipos de eventos" : undefined}
        subtitle={isMobile ? undefined : "Tipos de eventos"}
      />
      <Stack gap="0.5rem" row flexWrap="wrap">
        {space.eventTypeAttributes.map(({ id, icon, label }) => (
          <Tag key={id} iconLeft={icon} text={label} />
        ))}
      </Stack>
    </Stack>
  );
};

const Location = ({ venue }: { venue: Venue }) => {
  const isMobile = useMediaQuery("large");

  return (
    <Stack gap="1.5rem">
      <TextBlock
        label={isMobile ? "Localização" : undefined}
        subtitle={isMobile ? undefined : "Localização"}
      />
      <div className={element("map")}>
        <MapWithPin latitude={venue.latitude} longitude={venue.longitude} />
      </div>
    </Stack>
  );
};

const VenueInfo = ({
  space,
  venue,
  spaceID,
}: {
  space: Space;
  venue: Venue;
  spaceID: string;
}) => {
  const isMobile = useMediaQuery("large");
  const hideVenueName = useHideVenueName(venue.subscription);

  return (
    <Stack gap="1.5rem">
      {!hideVenueName && (
        <>
          <TextBlock
            label={isMobile ? venue.name : undefined}
            subtitle={isMobile ? undefined : venue.name}
          />
          <Stack gap="0.5rem">
            <p className={element("venue-section-title")}>
              {space.isServicesJourney ? "Sobre a empresa" : "Sobre o local"}
            </p>
            <p className={element("description")}>{venue.description}</p>
          </Stack>
        </>
      )}
      <Suspense fallback={null}>
        <OtherSpaceStack space={space} venue={venue} spaceID={spaceID} />
      </Suspense>
    </Stack>
  );
};

const OtherSpaceStack = ({
  space,
  venue,
  spaceID,
}: {
  space: Space;
  venue: Venue;
  spaceID: string;
}) => {
  const packSearch = usePackSearch();

  const otherSpaces = useSearchResults({
    query: {
      top: venue.latitude + 0.001,
      bottom: venue.latitude - 0.001,
      left: venue.longitude - 0.001,
      right: venue.longitude + 0.001,
    },
    filter: (results) =>
      results?.filter(
        (searchResult) =>
          searchResult.venueID === venue.id && searchResult.id !== spaceID,
      ),
  });

  const handleOtherSpaceClick = (otherSpace: SearchResult) => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: "/space",
      Rinu_ItemCategory: "other_spaces_same_local",
      ...getGaPackSearchData(space, venue, packSearch),
      Rinu_eLabel8: `${otherSpace.spaceName} - ${otherSpace.venueName}`,
    });
  };

  if (!otherSpaces?.length) {
    return null;
  }

  return (
    <Stack gap="0.5rem">
      <p className={element("venue-section-title")}>
        {space.isServicesJourney
          ? "Outros serviços desta empresa"
          : "Outros espaços deste local"}
      </p>
      <div className={element("other-spaces")}>
        {otherSpaces.map((otherSpace) => (
          <SpaceCard
            key={otherSpace.id}
            searchResult={otherSpace}
            onClick={() => handleOtherSpaceClick(otherSpace)}
          />
        ))}
      </div>
    </Stack>
  );
};

export const handleSpaceSharingClick = (
  space: Space,
  venue: Venue,
  packSearch: PackSearchHook,
) => {
  sendGAEvent("event", "Rinu_CustomClick", {
    Rinu_ScreenName: "/space",
    Rinu_ItemCategory: "share_space",
    ...getGaPackSearchData(space, venue, packSearch),
  });
};

export default SpacePage;
