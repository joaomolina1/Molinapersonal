import { createBEMClasses } from "@/_utils/classname";
import Tag from "@/_design_system/Tag";
import Stack from "@/_design_system/Stack";
import IconUserInterfaceMiscellaneousSeparatorDot from "@/_design_system/_icons/UserInterface/Miscellaneous/SeparatorDot.svg";
import { formatInt, formatMoney } from "@/_utils/number";
import IconUserInterfaceMiscellaneousUsers from "@/_design_system/_icons/UserInterface/Miscellaneous/Users.svg";
import { SearchResult } from "@/_models/search";
import PhotoCarousel from "@/_components/SpacePage/PhotoCarousel";
import { Link } from "@/_services/navigation";
import SkeletonLoader from "@/_design_system/SkeletonLoader";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import SavedSpaceButton from "@/_components/SavedSpaceButton";
import IconSpacesCategoryExclusive from "@/_design_system/_icons/Spaces/Category/Exclusive.svg";
import HiddenVenueName from "@/_components/HiddenVenueName";
import { useSession } from "@/_services/session";

const { block, element } = createBEMClasses("search-space-card");

const SpaceCard = ({
  searchResult,
  searchParams,
  variant = "grid",
  onHoverChange,
  onClick,
}: {
  searchResult: SearchResult;
  searchParams?: {
    date: string | null;
    start: string | null;
    end: string | null;
    numPeople: string | null;
  };
  variant?: "grid" | "list";
  onHoverChange?: (isHovering: boolean) => void;
  onClick?: () => void;
}) => {
  const [session] = useSession();

  const [isHovering, setIsHovering] = useState(false);
  const [isFocusing, setIsFocusing] = useState(false);

  const handleHover = (state: boolean) => {
    setIsHovering(state);
    onHoverChange?.(state);
  };

  const handleFocus = (state: boolean) => {
    setIsFocusing(state);
    onHoverChange?.(state);
  };

  const ageInDays =
    (new Date().getTime() - new Date(searchResult.createdAt).getTime()) /
    (1000 * 60 * 60 * 24);

  const openSpaceHref = useMemo(() => {
    const params = new URLSearchParams();

    if (searchParams?.date) {
      params.set("date", searchParams.date);
    }

    if (searchParams?.start) {
      params.set("start", searchParams.start);
    }

    if (searchParams?.end) {
      params.set("end", searchParams.end);
    }

    if (searchParams?.numPeople) {
      params.set("numPeople", searchParams.numPeople);
    }

    return `/space/${searchResult.id}?${params.toString()}`;
  }, [searchParams, searchResult.id]);

  const pathname = usePathname();

  const handleSpaceScroll = (direction: string) => {
    let screenName = pathname;
    let itemCategory = "Standard";
    let itemType = "Spaces_most_searched_Swipe";
    if (pathname.includes("/space/")) {
      screenName = "/space";
      itemCategory = "other_space_same_local";
      itemType = "other_space_same_local_swipe";
    } else if (pathname.includes("/space")) {
      screenName = "/space";
      itemCategory = "activeSpace";
      itemType = "activeSpace";
    }
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: screenName,
      Rinu_ItemCategory: itemCategory,
      Rinu_ItemType: itemType,
      Rinu_eLabel1: searchResult.spaceName,
      Rinu_eLabel2: searchResult.venueName,
      Rinu_eLabel3: searchResult.id,
      Rinu_eLabel4: searchResult.venueID,
      Rinu_eLabel5: direction,
    });
  };

  return (
    <div
      className={block({
        recommended: searchResult.recommended,
        list: variant === "list",
      })}
      onMouseEnter={() => handleHover(true)}
      onMouseLeave={() => handleHover(false)}
      onFocus={() => handleFocus(true)}
      onBlur={() => handleFocus(false)}
    >
      <Link
        href={openSpaceHref}
        target="_blank"
        className={element("link")}
        onClick={onClick}
      />
      <div className={element("photo")}>
        {!!searchResult.photoURLs?.length && (
          <PhotoCarousel
            photoURLs={searchResult.photoURLs}
            linkProps={{
              href: openSpaceHref,
              target: "_blank",
              tabIndex: -1,
              onClick: onClick,
            }}
            showPrevNextButtons={isHovering || isFocusing}
            onScroll={handleSpaceScroll}
            lazyLoading
          />
        )}
        <div className={element("photo__top")}>
          <div className={element("photo__top__left")}>
            <Stack gap="0.25rem">
              {searchResult.recommended && (
                <Tag
                  text="Recomendado"
                  iconLeft={<IconSpacesCategoryExclusive />}
                  size="small"
                  border={false}
                  className={element("photo__top__recommended")}
                />
              )}
              {session?.roles.includes("admin") &&
                searchResult.status !== "active" && (
                  <Tag
                    size="small"
                    text={searchResult.statusWording.label}
                    type={searchResult.statusWording.tagType}
                  />
                )}
            </Stack>
          </div>
          <div className={element("photo__top__right")}>
            {ageInDays < 60 && (
              <Tag text="Novo" type="neutral" size="small" border={false} />
            )}
            <SavedSpaceButton spaceId={searchResult.id} variant="space-card" />
          </div>
        </div>
        {!!searchResult.formattedPrice && (
          <div className={element("photo__bottom")}>
            <p>
              desde{" "}
              <span>
                {formatMoney(searchResult.formattedPrice.amount, {
                  maximumFractionDigits: 0,
                }).replace(/\s/g, "")}
              </span>
            </p>
            <p>valor/{searchResult.formattedPrice.type}</p>
          </div>
        )}
      </div>
      <Link
        href={openSpaceHref}
        target="_blank"
        tabIndex={-1}
        className={element("content")}
        onClick={onClick}
      >
        <Stack gap="0.25rem">
          <p className={element("content__title")}>
            {searchResult.spaceName}
            <HiddenVenueName
              name={` · ${searchResult.venueName}`}
              subscription={searchResult.subscription}
            />
          </p>
          <p className={element("content__location")}>
            {searchResult.address.city}
          </p>
        </Stack>
        <Stack row alignItems="center">
          <Stack
            row
            gap="0.25rem"
            alignItems="center"
            className={element("content__capacity")}
          >
            <IconUserInterfaceMiscellaneousUsers />
            <span>{formatInt(searchResult.capacity)}</span>
          </Stack>
          {!!searchResult.price.min && (
            <>
              <IconUserInterfaceMiscellaneousSeparatorDot />
              <span className={element("content__price")}>
                Mínimo{" "}
                <b>
                  {formatMoney(searchResult.price.min, {
                    maximumFractionDigits: 0,
                  })}
                </b>
              </span>
            </>
          )}
        </Stack>
      </Link>
    </div>
  );
};

export const SpaceCardSkeleton = () => {
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
        <SkeletonLoader type="text" />
      </Stack>
    </div>
  );
};

export default SpaceCard;
