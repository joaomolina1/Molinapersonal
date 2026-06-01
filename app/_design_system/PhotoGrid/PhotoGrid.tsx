import Image from "next/image";
import { createBEMClasses } from "@/_utils/classname";
import {
  CSSProperties,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Button as AriaButton } from "react-aria-components";
import Modal from "../Modal";
import { useImageRatio } from "@/_utils/imageRatio";
import Stack from "../Stack";
import SimpleBar from "simplebar-react";
import { IconButton } from "../Button";
import IconUserInterfaceNavigationArrowLeft from "../_icons/UserInterface/Navigation/ArrowLeft.svg";
import IconUserInterfaceNavigationArrowRight from "../_icons/UserInterface/Navigation/ArrowRight.svg";

const { block, element } = createBEMClasses("photo-grid");
const { block: modalBlock, element: modalElement } =
  createBEMClasses("photo-grid-modal");

export type PhotoGridProps = {
  photos: { gridURL: string; modalURL: string; listURL: string }[];
  label: ReactNode;
  layout: "grid-5" | "grid-4" | "row-4";
  overlayMode: "extra" | "match";
  onClick?: (index: number) => void;
  className?: string;
  style?: CSSProperties;
};

const PhotoGrid = ({
  photos,
  label,
  layout,
  overlayMode,
  onClick,
  className,
  style,
}: PhotoGridProps) => {
  const [selected, setSelected] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const maxDisplayed = layout === "row-4" || layout === "grid-4" ? 4 : 5;
  const displayedPhotos = photos.slice(0, maxDisplayed);

  return (
    <div
      className={block({ total: displayedPhotos.length, layout }, className)}
      style={style}
    >
      {displayedPhotos.map((photo, index) => (
        <div key={index}>
          <Image alt="" src={photo.gridURL} fill />
          <AriaButton
            className={element("see-all", {
              visible:
                index === maxDisplayed - 1 &&
                (overlayMode === "match" || photos.length > maxDisplayed),
            })}
            onPress={() => {
              if (onClick) {
                onClick(index);
              } else {
                setSelected(index);
                setIsOpen(true);
              }
            }}
          >
            {overlayMode === "match" &&
              index === maxDisplayed - 1 &&
              "Ver todas as fotos"}
            {overlayMode === "extra" &&
              photos.length > maxDisplayed &&
              index === maxDisplayed - 1 &&
              `+${photos.length - maxDisplayed} fotos`}
          </AriaButton>
        </div>
      ))}
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        ariaLabel="Fotos do espaço"
        width="full-width"
        className={modalBlock()}
        label={label}
      >
        <ModalContent
          photos={photos}
          selected={selected}
          setSelected={setSelected}
        />
      </Modal>
    </div>
  );
};

const ModalContent = ({
  photos,
  selected,
  setSelected,
}: {
  photos: { gridURL: string; modalURL: string; listURL: string }[];
  selected: number;
  setSelected: (selected: number) => void;
}) => {
  const previous = useCallback(() => {
    if (selected === 0) {
      setSelected(photos.length - 1);
    } else {
      setSelected(selected - 1);
    }
  }, [photos.length, selected, setSelected]);

  const next = useCallback(() => {
    if (selected + 1 === photos.length) {
      setSelected(0);
    } else {
      setSelected(selected + 1);
    }
  }, [photos.length, selected, setSelected]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        next();
      } else if (e.key === "ArrowLeft") {
        previous();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [next, previous]);

  const { containerRatio, imageRatio, containerRef, onLoadImage } =
    useImageRatio(selected);

  return (
    <>
      <Stack gap="1.5rem" className={modalElement("content")}>
        <div
          className={modalElement("selected", {
            fit: containerRatio > imageRatio ? "width" : "height",
          })}
          ref={containerRef}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="" src={photos[selected].modalURL} onLoad={onLoadImage} />
        </div>
        <SimpleBar style={{ maxWidth: "100%" }}>
          <div className={modalElement("list")}>
            {photos.map((photo, index) => (
              <div
                key={index}
                className={modalElement("list__option", {
                  selected: selected === index,
                })}
              >
                <Image alt="" src={photo.listURL} fill />
                <AriaButton onPress={() => setSelected(index)} />
              </div>
            ))}
          </div>
        </SimpleBar>
      </Stack>
      <IconButton
        icon={<IconUserInterfaceNavigationArrowLeft />}
        style={{ fontSize: "2rem" }}
        className={modalElement("previous")}
        onClick={previous}
        ariaLabel="Anterior"
      />
      <IconButton
        icon={<IconUserInterfaceNavigationArrowRight />}
        style={{ fontSize: "2rem" }}
        className={modalElement("next")}
        onClick={next}
        ariaLabel="Próximo"
      />
    </>
  );
};

export default PhotoGrid;
