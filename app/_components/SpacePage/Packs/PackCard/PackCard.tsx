import AmenitiesItem, { AmenitiesList } from "@/_design_system/AmenitiesItem";
import Button, { IconButton, TextButton } from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import IconUserInterfaceFormsErrorAlert from "@/_design_system/_icons/UserInterface/Forms/ErrorAlert.svg";
import IconUserInterfaceMiscellaneousCapacity from "@/_design_system/_icons/UserInterface/Miscellaneous/Capacity.svg";
import IconUserInterfaceMiscellaneousClock from "@/_design_system/_icons/UserInterface/Miscellaneous/Clock.svg";
import IconUserInterfaceMiscellaneousSeparatorDot from "@/_design_system/_icons/UserInterface/Miscellaneous/SeparatorDot.svg";
import { Pack } from "@/_models/pack";
import { createBEMClasses } from "@/_utils/classname";
import { formatMoney } from "@/_utils/number";
import { BookingPaymentSummary } from "@/_components/BookingDetails";
import { getPackPaymentBreakdown } from "@/_utils/packPayment";
import { extraParamsFromRecord } from "@lib/extras/quantities";
import { useState } from "react";
import PackModal from "./PackModal";
import Tooltip from "@/_design_system/Tooltip";
import PackPriceDetail from "./PackPriceDetail";
import IconUserInterfaceMiscellaneousTooltip from "@/_design_system/_icons/UserInterface/Miscellaneous/Tooltip.svg";
import { PackSearchHook } from "../PackSearch";
import SkeletonLoader from "@/_design_system/SkeletonLoader";
import PackChooseLayoutModal from "./PackChooseLayoutModal";
import { useSession } from "@/_services/session";
import { PackCapacity } from "@/_constants/pack/capacities";
import { useCreateBooking } from "@/_models/booking";
import { useRouterPush } from "@/_services/navigation";
import { useSessionSearchParams } from "@/_components/Header";
import BookingOwnSpaceModal from "./BookingOwnSpaceModal";
import IconUserInterfaceFormsCalendar from "@/_design_system/_icons/UserInterface/Forms/Calendar.svg";
import AlreadyBookedModal from "@/_components/AlreadyBookedModal";
import { sendGAEvent } from "@next/third-parties/google";
import { getGaPackSearchData } from "../PackSearch/PackSearch";
import { Space } from "@/_models/space";
import { Venue } from "@/_models/venue";
import { PackPricesModal } from "./PackPricesModal";
import { useQuoteRequestContext } from "@/(main)/_components/QuoteRequest";
import { useMediaQuery } from "@/_utils/mediaQuery";
import Tag from "@/_design_system/Tag";
import CopyIconButton from "@/_components/CopyIconButton";
import PackExtras from "./PackExtras";
import PackAttachments from "./PackAttachments";

const { block, element } = createBEMClasses("client-pack-card");

const PackCard = ({
  pack,
  packSearch,
  mode,
  variant = "default",
  space,
  venue,
}: {
  pack: Pack;
  packSearch: PackSearchHook;
  mode: "public" | "auth";
  variant?: "default" | "other";
  space: Space;
  venue: Venue;
}) => {
  const [, setSessionSearchParams] = useSessionSearchParams();

  const [session] = useSession();
  const routerPush = useRouterPush();

  const [isOpen, setIsOpen] = useState(false);
  const [isOpenChooseLayout, setIsOpenChooseLayout] = useState(false);
  const [isOpenBookingOwnSpace, setIsOpenBookingOwnSpace] = useState(false);
  const [isOpenAlreadyBooked, setIsOpenAlreadyBooked] = useState(false);

  const paymentBreakdown =
    pack.price && packSearch.date && pack.cancellationPeriod
      ? getPackPaymentBreakdown(
          pack,
          new Date(packSearch.date.toString()),
        )
      : null;

  const availableCapacities = pack.formattedCapacities.filter(
    (capacity) => capacity.people >= (packSearch.numPeople ?? 0),
  );

  const {
    mutateAsync: createBooking,
    isPending: isPendingCreateBooking,
    isSuccess: isSuccessCreateBooking,
  } = useCreateBooking();

  const book = async (layout: PackCapacity["layout"]) => {
    if (
      packSearch.numPeople &&
      packSearch.date &&
      packSearch.start &&
      packSearch.end
    ) {
      try {
        const bookingID = await createBooking({
          spaceID: pack.spaceIDs?.[0] ?? space.id,
          packID: pack.id,
          layout,
          numPeople: packSearch.numPeople,
          date: packSearch.date.toString(),
          start: packSearch.start.string,
          end: packSearch.end.string,
          kind: "internal",
          extras: packSearch.extras,
          extraParams: extraParamsFromRecord(packSearch.extraParams),
        });

        routerPush(`/book?bookingID=${bookingID}`);
      } catch (e) {
        if ((e as Error).message.includes("already_booked")) {
          setIsOpenAlreadyBooked(true);
        } else {
          throw e;
        }
      }
    }
  };

  const handlBookOrChooseLayout = async () => {
    if (mode === "auth") {
      return;
    }

    if (pack.ownerID === session?.user_id) {
      setIsOpenBookingOwnSpace(true);
      return;
    }

    if (!availableCapacities.length) {
      console.error("No available capacities");
      return;
    }

    if (availableCapacities.length > 1) {
      setIsOpenChooseLayout(true);
    } else {
      await book(availableCapacities[0].id);
    }
  };

  const handleShowPrice = () => {
    if (!session) {
      handlePackInfo("show_price_forceLogIn");
      setSessionSearchParams({
        action: "login",
        source: "show-price",
        otp: null,
        username: null,
      });
    } else {
      packSearch.scrollIntoView();
      setTimeout(() => {
        packSearch.focusOnUnfilledInput();
      }, 750);
    }
  };

  const handlePackInfo = (itemCategory: string) => {
    let gaEventType = "Rinu_CustomClick";
    if (itemCategory === "show_price_forceLogIn")
      gaEventType = "Rinu_ScreenView";
    sendGAEvent("event", gaEventType, {
      Rinu_ScreenName: "/space",
      Rinu_ItemCategory: itemCategory,
      ...getGaPackSearchData(space, venue, packSearch),
      Rinu_eLabel8: pack.name,
      Rinu_eLabel9: pack.id,
      Rinu_eLabel10: pack.price?.value,
    });
  };

  return (
    <div className={block()}>
      <Stack gap="1rem" className={element("details")}>
        <div className={element("name")}>
          <TextButton
            text={pack.name}
            onClick={() => {
              setIsOpen(true);
              handlePackInfo("pack_detail");
            }}
          />
        </div>
        <div className={element("maxtime-capacity")}>
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
            !!pack.noticeDays && <IconUserInterfaceMiscellaneousSeparatorDot />}
          {!!pack.noticeDays && (
            <AmenitiesItem
              icon={<IconUserInterfaceFormsCalendar />}
              label={`${pack.noticeDays} ${
                pack.noticeDays === 1 ? "dia" : "dias"
              } para preparar a reserva`}
            />
          )}
          <IconUserInterfaceMiscellaneousSeparatorDot />
          <PackPricesModal pack={pack} />
        </div>
        {pack.price?.timeOverflow && (
          <div className={element("short-duration")}>
            <IconUserInterfaceFormsErrorAlert />
            <p>A duração deste pack é inferior à pretendida</p>
          </div>
        )}
        <p className={element("description")}>
          {pack.description.slice(0, 400)}
          {pack.description.length > 400 ? "..." : undefined}
        </p>
        {pack.featureAttributes.length > 0 && (
          <AmenitiesList
            items={pack.featureAttributes.map(({ icon, label }) => ({
              icon,
              label,
            }))}
          />
        )}
        {pack.serviceTypeFeatureAttributes.length > 0 && (
          <AmenitiesList items={pack.serviceTypeFeatureAttributes} />
        )}
        <PackAttachments pack={pack} />
        {!!pack.extras.length && (
          <PackExtras extras={pack.extras} packSearch={packSearch} />
        )}
        {session?.roles.includes("admin") && (
          <Stack row alignItems="center" gap="0.5rem">
            <Tag
              size="small"
              text={pack.statusWording.label}
              type={pack.statusWording.tagType}
            />
            <span className={element("admin-id")}>
              Pack ID: <span>{pack.id}</span>
            </span>
            <CopyIconButton text={pack.id} />
          </Stack>
        )}
      </Stack>
      {variant === "default" && (
        <Stack gap="0.5rem" className={element("pricing")}>
          {pack.price && !!session ? (
            <>
              <div className={element("pricing__amount")}>
                <div className={element("pricing__amount__top")}>
                  <Stack row gap="0.25rem" alignItems="center">
                    <span className={element("pricing__amount__label")}>
                      Total c/ IVA
                    </span>
                    <Tooltip
                      content={
                        <PackPriceDetail
                          price={pack.price}
                          start={packSearch.start ?? undefined}
                          showLabel
                          showTotal
                        />
                      }
                      style={{
                        maxWidth: "min(23.25rem, calc(100dvw - 2rem))",
                      }}
                      visibleOnTouchDevice
                    >
                      <IconButton
                        showTooltip={false}
                        ariaLabel="Cálculo do preço"
                        icon={<IconUserInterfaceMiscellaneousTooltip />}
                        onClick={() => handlePackInfo("calculated_price")}
                        onHover={() => handlePackInfo("calculated_price")}
                      />
                    </Tooltip>
                  </Stack>
                  <span className={element("pricing__amount__value")}>
                    {formatMoney(pack.price.value)}
                  </span>
                </div>
              </div>
              {paymentBreakdown?.isPartial && (
                <BookingPaymentSummary
                  breakdown={paymentBreakdown}
                  variant="compact"
                />
              )}
              {pack.isVenuesJourney && (
                <Button
                  type="primary"
                  label="Reservar"
                  onClick={() => {
                    handlBookOrChooseLayout();
                    handlePackInfo("book");
                  }}
                  loading={
                    !isOpenChooseLayout &&
                    (isPendingCreateBooking || isSuccessCreateBooking)
                  }
                />
              )}
            </>
          ) : (
            <Button
              type="primary"
              label="Mostrar preço"
              className={element("pricing__show")}
              onClick={() => {
                handleShowPrice();
                handlePackInfo("show_price");
              }}
            />
          )}
          <ContactSpaceButton space={space} venue={venue} pack={pack} />
        </Stack>
      )}
      {variant === "other" && (
        <Stack gap="1.5rem" className={element("no-availability")}>
          <div className={element("no-availability__message")}>
            <IconUserInterfaceFormsErrorAlert />
            <p>
              {pack.unavailabilityReasonLabel ??
                "Sem disponibilidade para os seus critérios"}
            </p>
          </div>
          <Stack gap="0.5rem">
            <Button
              type="secondary"
              label="Ajustar pesquisa"
              onClick={packSearch.scrollIntoView}
            />
            <ContactSpaceButton space={space} venue={venue} pack={pack} />
          </Stack>
        </Stack>
      )}
      <PackModal pack={pack} isOpen={isOpen} setIsOpen={setIsOpen} />
      {availableCapacities.length > 1 && (
        <PackChooseLayoutModal
          capacities={availableCapacities}
          isOpen={isOpenChooseLayout}
          setIsOpen={setIsOpenChooseLayout}
          onContinue={book}
          isPending={isPendingCreateBooking || isSuccessCreateBooking}
        />
      )}
      {pack.ownerID === session?.user_id && (
        <BookingOwnSpaceModal
          isOpen={isOpenBookingOwnSpace}
          setIsOpen={setIsOpenBookingOwnSpace}
          packSearch={packSearch}
        />
      )}
      <AlreadyBookedModal
        isOpen={isOpenAlreadyBooked}
        onBackToSearch={() => setIsOpenAlreadyBooked(false)}
      />
    </div>
  );
};

export const PackCardSkeleton = () => {
  return (
    <div className={block()}>
      <Stack gap="1rem" className={element("details")}>
        <div className={element("name")}>
          <SkeletonLoader type="text" />
        </div>
        <div className={element("maxtime-capacity")}>
          <SkeletonLoader type="text" />
        </div>
        <div className={element("description")}>
          <Stack gap="0.25rem">
            <SkeletonLoader type="text" />
            <SkeletonLoader type="text" />
            <SkeletonLoader type="text" />
          </Stack>
        </div>
      </Stack>
      <Stack gap="0.5rem" className={element("pricing")}>
        <SkeletonLoader type="button" />
      </Stack>
    </div>
  );
};

const ContactSpaceButton = ({
  space,
  venue,
  pack,
}: {
  space: Space;
  venue: Venue;
  pack: Pack;
}) => {
  const isMobile = useMediaQuery("large");
  const { setQuoteRequestModalData } = useQuoteRequestContext();

  const onClick = () => {
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: "/space",
      Rinu_ItemCategory: "contact_request",
      Rinu_ItemType: "pack_type",
      Rinu_eLabel1: pack.name,
      Rinu_eLabel2: space.name,
      Rinu_eLabel3: venue.name,
      Rinu_eLabel4: pack.id,
      Rinu_eLabel5: space.id,
      Rinu_eLabel6: venue.id,
    });

    if (!isMobile) {
      setQuoteRequestModalData({
        isOpen: true,
        context: {
          type: "contact-request",
          packID: pack.id,
          spaceID: space.id,
          venueID: venue.id,
        },
      });
    }
  };

  return (
    <Button
      type="secondary"
      label={
        pack.isServicesJourney ? "Contactar o serviço" : "Contactar o espaço"
      }
      href={
        isMobile
          ? `/contact-request?packID=${pack.id}&spaceID=${space.id}&venueID=${venue.id}`
          : undefined
      }
      onClick={onClick}
    />
  );
};

export default PackCard;
