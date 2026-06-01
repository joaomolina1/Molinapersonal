import { createBEMClasses } from "@/_utils/classname";
import Stack from "@/_design_system/Stack";
import PhotoCarousel from "@/_components/SpacePage/PhotoCarousel";
import { Link } from "@/_services/navigation";
import SkeletonLoader from "@/_design_system/SkeletonLoader";
import { useState } from "react";
import SavedSpaceButton from "@/_components/SavedSpaceButton";
import { useSpace } from "@/_models/space";
import { useVenue } from "@/_models/venue";
import { getPhotoURLs, usePhotos } from "@/_models/photo";
import HiddenVenueName from "@/_components/HiddenVenueName";

const { block, element } = createBEMClasses("search-space-card");

const SavedSpaceCard = ({ spaceId }: { spaceId: string }) => {
  const { data: space } = useSpace(spaceId, "public");
  const { data: venue } = useVenue(space?.venueID, "public");
  const { data: photos = [] } = usePhotos(
    !!space && !!venue ? [...space.allPhotoIDs, ...venue.allPhotoIDs] : [],
  );

  const [isHovering, setIsHovering] = useState(false);
  const [isFocusing, setIsFocusing] = useState(false);

  if (!space || !venue) {
    return <SavedSpaceCardSkeleton />;
  }

  const openSpaceHref = `/space/${spaceId}`;

  return (
    <div
      className={block()}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocus={() => setIsFocusing(true)}
      onBlur={() => setIsFocusing(false)}
    >
      <Link href={openSpaceHref} target="_blank" className={element("link")} />
      <div className={element("photo")}>
        {!!photos?.length && (
          <PhotoCarousel
            photoURLs={getPhotoURLs(photos, "medium")}
            linkProps={{
              href: openSpaceHref,
              target: "_blank",
              tabIndex: -1,
            }}
            showPrevNextButtons={isHovering || isFocusing}
          />
        )}
        <div className={element("photo__top")}>
          <SavedSpaceButton spaceId={spaceId} variant="space-card-saved" />
        </div>
      </div>
      <Link
        href={openSpaceHref}
        target="_blank"
        tabIndex={-1}
        className={element("content")}
      >
        <Stack gap="0.25rem">
          <p className={element("content__title")}>
            {space.name}{" "}
            <HiddenVenueName
              name={`· ${venue.name}`}
              subscription={venue.subscription}
            />
          </p>
          <p className={element("content__location")}>{venue.city}</p>
        </Stack>
      </Link>
    </div>
  );
};

export const SavedSpaceCardSkeleton = () => {
  return (
    <div className={block()}>
      <div className={element("photo")}>
        <SkeletonLoader />
      </div>
      <Stack gap="0.5rem" className={element("content")}>
        <Stack gap="0.25rem">
          <SkeletonLoader type="text" />
          <SkeletonLoader type="text" />
        </Stack>
      </Stack>
    </div>
  );
};

export default SavedSpaceCard;
