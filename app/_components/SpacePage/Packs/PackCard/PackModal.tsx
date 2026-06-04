import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import { TextButton } from "@/_design_system/Button";
import { Pack } from "@/_models/pack";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import AmenitiesItem, { AmenitiesList } from "@/_design_system/AmenitiesItem";
import IconUserInterfaceMiscellaneousSeparatorDot from "@/_design_system/_icons/UserInterface/Miscellaneous/SeparatorDot.svg";
import InputCapacity from "@/_design_system/InputCapacity";
import IconUserInterfaceMiscellaneousClock from "@/_design_system/_icons/UserInterface/Miscellaneous/Clock.svg";
import PackCancellationLabel from "@/_components/PackCancellationLabel";
import SimpleBar from "simplebar-react";
import IconUserInterfaceMiscellaneousCapacity from "@/_design_system/_icons/UserInterface/Miscellaneous/Capacity.svg";
import IconUserInterfaceFormsCalendar from "@/_design_system/_icons/UserInterface/Forms/Calendar.svg";
import { useAttachments } from "@/_models/attachment";

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

  const { data: attachments = [] } = useAttachments(
    pack.attachmentIDs?.length ? pack.attachmentIDs : undefined,
  );

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      width="xx-large"
      ariaLabel="Detalhes do pack"
      className={block()}
      contentStyle={isMobile ? { padding: 0 } : { overflow: "hidden" }}
    >
      {!!attachments.length && (
        <SimpleBar
          style={isMobile ? undefined : { width: "55%", flexShrink: 0 }}
        >
          <Stack gap="0.75rem" className={element("attachments")}>
            <h5>Anexos</h5>
            <ul className={element("attachments__list")}>
              {attachments.map((attachment) => (
                <li key={attachment.id} className={element("attachments__item")}>
                  <TextButton
                    text={attachment.filename}
                    href={attachment.url}
                    target="_blank"
                  />
                </li>
              ))}
            </ul>
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
