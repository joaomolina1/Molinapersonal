import Image from "next/image";
import { createBEMClasses } from "@/_utils/classname";
import { NavButton } from "@/_design_system/Button";
import IconUserInterfaceNavigationArrowLeft from "@/_design_system/_icons/UserInterface/Navigation/ArrowLeft.svg";
import IconUserInterfaceNavigationArrowRight from "@/_design_system/_icons/UserInterface/Navigation/ArrowRight.svg";
import Stack from "@/_design_system/Stack";
import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { Link, LinkProps } from "@/_services/navigation";
import { useCheckIfTouchDevice } from "@/_utils/mediaQuery";

const { block, element } = createBEMClasses("photo-carousel");

const PhotoCarousel = ({
  photoURLs,
  topRightButtons,
  showPrevNextButtons = true,
  linkProps,
  onScroll,
  lazyLoading,
  selected: selectedProp,
  setSelected: setSelectedProp,
}: {
  photoURLs: string[];
  topRightButtons?: ReactNode;
  showPrevNextButtons?: boolean;
  linkProps?: LinkProps;
  onScroll?: (direction: string) => void;
  lazyLoading?: boolean;
  selected?: number;
  setSelected?: (selected: number) => void;
}) => {
  const [selectedState, setSelectedState] = useState(0);
  const isTouchDevice = useCheckIfTouchDevice();

  const ref = useRef<HTMLDivElement>(null);

  const selected = selectedProp !== undefined ? selectedProp : selectedState;
  const setSelected = setSelectedProp ?? setSelectedState;

  useEffect(() => {
    const node = ref.current;

    if (node) {
      const handleScroll = () => {
        const { clientWidth, scrollLeft } = node;
        setSelected(Math.round(scrollLeft / clientWidth));
      };

      node.addEventListener("scroll", handleScroll);

      return () => {
        node.removeEventListener("scroll", handleScroll);
      };
    }
  }, [setSelected]);

  const scroll = (direction: "right" | "left") => {
    if (ref.current) {
      ref.current.scrollBy({
        left: ref.current.clientWidth * (direction === "right" ? 1 : -1),
        behavior: "smooth",
      });
    }
    onScroll?.(direction);
  };

  return (
    <div className={block({ "show-next-prev": showPrevNextButtons })}>
      <div className={element("image-wrapper")} ref={ref}>
        {photoURLs.map((photoURL, index) => (
          <Fragment key={index}>
            {linkProps ? (
              <Link {...linkProps}>
                <div className={element("image")}>
                  {Math.abs(index - selected) <= 1 && (
                    <Image
                      alt=""
                      src={photoURL}
                      fill
                      loading={lazyLoading ? "lazy" : undefined}
                    />
                  )}
                </div>
              </Link>
            ) : (
              <div className={element("image")}>
                {Math.abs(index - selected) <= 1 && (
                  <Image
                    alt=""
                    src={photoURL}
                    fill
                    loading={lazyLoading ? "lazy" : undefined}
                  />
                )}
              </div>
            )}
          </Fragment>
        ))}
      </div>
      {photoURLs.length > 1 && (
        <>
          <div className={element("previous", { visible: isTouchDevice })}>
            {selected !== 0 && (
              <NavButton
                ariaLabel="Fotografia anterior"
                icon={<IconUserInterfaceNavigationArrowLeft />}
                onClick={() => scroll("left")}
              />
            )}
          </div>

          <div className={element("next", { visible: isTouchDevice })}>
            {selected !== photoURLs.length - 1 && (
              <NavButton
                ariaLabel="Fotografia seguinte"
                icon={<IconUserInterfaceNavigationArrowRight />}
                onClick={() => scroll("right")}
              />
            )}
          </div>
        </>
      )}
      {topRightButtons && (
        <Stack row gap="0.75rem" className={element("share-save")}>
          {topRightButtons}
        </Stack>
      )}
    </div>
  );
};

export default PhotoCarousel;
