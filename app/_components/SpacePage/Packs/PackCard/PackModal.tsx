import Image from "next/image";
import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import { Pack } from "@/_models/pack";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import PhotoCarousel from "../../PhotoCarousel";
import { getPhotoURLs, usePhotos } from "@/_models/photo";
import AmenitiesItem, { AmenitiesList } from "@/_design_system/AmenitiesItem";
import IconUserInterfaceMiscellaneousSeparatorDot from "@/_design_system/_icons/UserInterface/Miscellaneous/SeparatorDot.svg";
import { useState } from "react";
import { Button as AriaButton } from "react-aria-components";
import InputCapacity from "@/_design_system/InputCapacity";
import IconUserInterfaceMiscellaneousClock from "@/_design_system/_icons/UserInterface/Miscellaneous/Clock.svg";
import PackCancellationLabel from "@/_components/PackCancellationLabel";
import SimpleBar from "simplebar-react";
import IconUserInterfaceMiscellaneousCapacity from "@/_design_system/_icons/UserInterface/Miscellaneous/Capacity.svg";
import { useImageRatio } from "@/_utils/imageRatio";
import IconUserInterfaceFormsCalendar from "@/_design_system/_icons/UserInterface/Forms/Calendar.svg";

const { block, element } = createBEMClasses("client-pack-modal");

const PackModal = ({
  pack,
  isOpen,
  setIsOpen,
}: {
  pack: Pack;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const isMobile = useMediaQuery("large");

  const { data: photos = [] } = usePhotos(pack.allPhotoIDs);

  const [selected, setSelected] = useState(0);

  const { containerRatio, imageRatio, containerRef, onLoadImage } =
    useImageRatio(selected);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      width="xx-large"
      ariaLabel="Detalhes do pack"
      className={block()}
      contentStyle={isMobile ? { padding: 0 } : { overflow: "hidden" }}
    >
      {isMobile ? (
        <div className={element("photo-carousel")}>
          <PhotoCarousel photoURLs={getPhotoURLs(photos, "large")} />
        </div>
      ) : (
        <SimpleBar style={{ width: "55%", flexShrink: 0 }}>
          <Stack gap="0.5rem" className={element("photo-grid")}>
            <div
              className={element("photo-grid__selected", {
                fit: containerRatio > imageRatio ? "width" : "height",
              })}
              ref={containerRef}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" src={photos[selected]?.large} onLoad={onLoadImage} />
            </div>
            <div className={element("photo-grid__list")}>
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className={element("photo-grid__list__option", {
                    selected: selected === index,
                  })}
                >
                  <Image alt="" src={photo.small} fill />
                  <AriaButton onPress={() => setSelected(index)} />
                </div>
              ))}
            </div>
          </Stack>
        </SimpleBar>
      )}
      <SimpleBar style={{ flex: 1 }}>
        <div className={element("infos")}>
          <Stack gap="1rem">
            <h2>{pack.name}</h2>
            <Stack row alignItems="center" flexWrap="wrap" gap="0.5rem">
              {!!pack.formattedMinMaxTime && (
                <AmenitiesItem
                  icon={<IconUserInterfaceMiscellaneousClock />}
                  label={pack.formattedMinMaxTime}
                />
              )}
              {!!pack.formattedMinMaxTime &&
                (!!pack.maxCapacity || !!pack.noticeDays) && (
                  <IconUserInterfaceMiscellaneousSeparatorDot />
                )}
              {!!pack.maxCapacity && (
                <AmenitiesItem
                  icon={<IconUserInterfaceMiscellaneousCapacity />}
                  label={`Lotação ${pack.maxCapacity} pessoas`}
                />
              )}
              {(!!pack.formattedMinMaxTime || !!pack.maxCapacity) &&
                !!pack.noticeDays && (
                  <IconUserInterfaceMiscellaneousSeparatorDot />
                )}
              {!!pack.noticeDays && (
                <AmenitiesItem
                  icon={<IconUserInterfaceFormsCalendar />}
                  label={`${pack.noticeDays} ${
                    pack.noticeDays === 1 ? "dia" : "dias"
                  } para preparar a reserva`}
                />
              )}
            </Stack>
            <p className={element("description")}>{pack.description}</p>
          </Stack>
          {!!pack.formattedCapacities.length && (
            <Stack gap="1rem">
              <h5>Disposições</h5>
              {pack.formattedCapacities.map((capacity) => (
                <InputCapacity
                  key={capacity.id}
                  icon={capacity.icon}
                  text={capacity.text}
                  microcopy={capacity.microcopy}
                  value={capacity.people}
                  readOnly
                  className={element("capacity")}
                />
              ))}
            </Stack>
          )}
          {!!pack.featureAttributes.length && (
            <>
              <hr />
              <Stack gap="1rem">
                <h5>Incluído no pack</h5>
                <AmenitiesList
                  items={pack.featureAttributes.map(({ label, icon }) => ({
                    label,
                    icon,
                  }))}
                />
              </Stack>
            </>
          )}
          {!!pack.serviceTypeFeatureAttributes.length && (
            <>
              <hr />
              <Stack gap="1rem">
                <h5>Incluído no pack</h5>
                <AmenitiesList items={pack.serviceTypeFeatureAttributes} />
              </Stack>
            </>
          )}
          {!!pack.cancellationPeriod && (
            <>
              <hr />
              <Stack gap="1rem">
                <h5>Política de cancelamento</h5>
                <PackCancellationLabel
                  cancellation={pack.cancellationPeriod}
                  className={element("cancellation")}
                />
              </Stack>
            </>
          )}
        </div>
      </SimpleBar>
    </Modal>
  );
};

export default PackModal;
