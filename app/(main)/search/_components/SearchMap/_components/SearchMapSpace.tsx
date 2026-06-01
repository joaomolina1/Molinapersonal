import {
  getGASearchEventData,
  useSearchContext,
} from "@/(main)/search/useSearchState";
import HiddenVenueName from "@/_components/HiddenVenueName";
import { IconButton } from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import IconUserInterfaceMiscellaneousUsers from "@/_design_system/_icons/UserInterface/Miscellaneous/Users.svg";
import IconUserInterfaceNavigationArrowLeft from "@/_design_system/_icons/UserInterface/Navigation/ArrowLeft.svg";
import IconUserInterfaceNavigationArrowRight from "@/_design_system/_icons/UserInterface/Navigation/ArrowRight.svg";
import { Link } from "@/_services/navigation";
import { createBEMClasses } from "@/_utils/classname";
import { formatInt, formatMoney } from "@/_utils/number";
import { sendGAEvent } from "@next/third-parties/google";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";

const { block, element } = createBEMClasses("search-map-space");

const SearchMapSpace = ({
  id,
  onArrowClick,
}: {
  id: string;
  onArrowClick: (direction: "right" | "left") => void;
}) => {
  const searchParams = useSearchParams();

  const search = useSearchContext();
  const { searchResults } = search;

  const pathname = usePathname();

  const searchResult = searchResults?.find(
    (searchResult) => id === searchResult.id,
  );

  if (!searchResult) {
    return null;
  }

  const params = new URLSearchParams(searchParams);
  params.delete("eventType");
  params.delete("city");
  params.delete("top");
  params.delete("right");
  params.delete("bottom");
  params.delete("left");
  params.delete("attributes");
  params.delete("category");

  const openSpaceHref = `/space/${searchResult.id}?${params.toString()}`;

  const showArrows = (searchResults?.length ?? 0) > 1;

  const handleMapSpaceClick = (itemType: string) => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "map",
      Rinu_ItemType: itemType,
      Rinu_eLabel1: searchResult.spaceName,
      Rinu_eLabel2: searchResult.venueName,
      ...getGASearchEventData(search),
    });
  };

  return (
    <div className={block()}>
      <Link
        href={openSpaceHref}
        target="_blank"
        className={element("link", { withArrows: showArrows })}
        onClick={() => handleMapSpaceClick("map_space_click")}
      >
        <div className={element("photo")}>
          {!!searchResult.photoURLs[0] && (
            <Image
              alt="Imagem do espaço"
              src={searchResult.photoURLs[0]}
              fill
            />
          )}
        </div>
        <Stack gap="0.5rem" className={element("content")}>
          <Stack gap="0.25rem">
            <p className={element("title")}>
              {searchResult.spaceName}
              <HiddenVenueName
                name={` · ${searchResult.venueName}`}
                subscription={searchResult.subscription}
              />
            </p>
            <p className={element("location")}>{searchResult.address.city}</p>
          </Stack>
          <Stack
            row
            gap="0.25rem"
            alignItems="center"
            className={element("capacity")}
          >
            <IconUserInterfaceMiscellaneousUsers />
            <span>{formatInt(searchResult.capacity)}</span>
          </Stack>
          <span className={element("price")}>
            {searchResult.formattedPrice && (
              <>
                desde{" "}
                <b>
                  {formatMoney(searchResult.formattedPrice.amount, {
                    maximumFractionDigits: 0,
                  })}
                </b>
                /{searchResult.formattedPrice.type}
              </>
            )}
          </span>
        </Stack>
      </Link>
      {showArrows && (
        <>
          <IconButton
            ariaLabel="Anterior"
            icon={<IconUserInterfaceNavigationArrowLeft />}
            onClick={() => {
              onArrowClick("left");
              handleMapSpaceClick("left");
            }}
            className={element("arrow", { direction: "left" })}
            showTooltip={false}
          />
          <IconButton
            ariaLabel="Seguinte"
            icon={<IconUserInterfaceNavigationArrowRight />}
            onClick={() => {
              onArrowClick("right");
              handleMapSpaceClick("right");
            }}
            className={element("arrow", { direction: "right" })}
            showTooltip={false}
          />
        </>
      )}
    </div>
  );
};

export default SearchMapSpace;
