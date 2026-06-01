import Image from "next/image";
import { createBEMClasses } from "@/_utils/classname";
import Stack from "@/_design_system/Stack";
import { PropsWithChildren, ReactNode } from "react";
import AmenitiesItem, { AmenitiesList } from "@/_design_system/AmenitiesItem";
import IconUserInterfaceFormsCustomOption from "@/_design_system/_icons/UserInterface/Forms/CustomOption.svg";
import IconUserInterfaceFormsCalendar from "@/_design_system/_icons/UserInterface/Forms/Calendar.svg";
import IconUserInterfaceMiscellaneousClock from "@/_design_system/_icons/UserInterface/Miscellaneous/Clock.svg";
import IconUserInterfaceMiscellaneousCapacity from "@/_design_system/_icons/UserInterface/Miscellaneous/Capacity.svg";
import IconUserInterfacePaymentCard from "@/_design_system/_icons/UserInterface/Payment/Card.svg";
import PackCancellationLabel from "../PackCancellationLabel";
import { CalculatedPrice } from "@/_models/pack";
import PackPriceDetail from "../SpacePage/Packs/PackCard/PackPriceDetail";
import { TimeDuration, formatMoney } from "@/_utils/number";
import { formatDate } from "@/_utils/date";
import IconUserInterfaceMiscellaneousEmail from "@/_design_system/_icons/UserInterface/Miscellaneous/Email.svg";
import IconUserInterfaceMiscellaneousPhone from "@/_design_system/_icons/UserInterface/Miscellaneous/Phone.svg";
import IconUserInterfaceMiscellaneousPin from "@/_design_system/_icons/UserInterface/Miscellaneous/Pin.svg";
import { getLocalTimeZone } from "@internationalized/date";
import { Booking } from "@/_models/booking";
import { isNotNil } from "@/_utils/filter";
import { Venue } from "@/_models/venue";
import type { PackPaymentBreakdown } from "@lib/payment/upfront";
import {
  formatRemainingPaymentDate,
  formatShortCancellationDate,
} from "@/_utils/packPayment";

const { element } = createBEMClasses("booking-details");

export const BookingPhotoName = ({
  url,
  packName,
  spaceName,
  venueName,
}: {
  url?: string;
  packName?: string;
  spaceName?: string;
  venueName?: ReactNode;
}) => (
  <div className={element("photo-name")}>
    <div className={element("photo-name__photo")}>
      {!!url && <Image alt="" src={url} fill />}
    </div>
    <Stack gap="0.5rem" className={element("photo-name__name")}>
      <p className={element("photo-name__pack-name")}>{packName}</p>
      <p className={element("photo-name__space-venue-name")}>
        {spaceName}
        {!!venueName && (
          <>
            <br />
            {venueName}
          </>
        )}
      </p>
    </Stack>
  </div>
);

export const BookingMainDetails = ({
  booking,
  showReference,
  showPrice,
}: {
  booking: Booking;
  showReference?: boolean;
  showPrice?: boolean;
}) => {
  const numPeopleString =
    booking.numPeople === 1
      ? `${booking.numPeople} pessoa`
      : `${booking.numPeople} pessoas`;

  const numPeopleLayout = `${numPeopleString} (${booking.layoutWording?.text})`;

  return (
    <Stack gap="0.5rem">
      {showReference && (
        <AmenitiesItem
          icon={<IconUserInterfaceFormsCustomOption />}
          label={`Reserva nº ${booking.shortId}`}
          iconSize="small"
          textSize="large"
        />
      )}
      <AmenitiesItem
        icon={<IconUserInterfaceFormsCalendar />}
        label={formatDate(booking.date.toDate(getLocalTimeZone()), {
          dateStyle: "full",
        })}
        iconSize="small"
        textSize="large"
        className={element("date")}
      />
      <AmenitiesItem
        icon={<IconUserInterfaceMiscellaneousClock />}
        label={`Das ${booking.start?.timeLabel} às ${booking.end?.timeLabel} (${booking.duration}h)`}
        iconSize="small"
        textSize="large"
      />
      {!!booking.numPeople && !!booking.layout && (
        <AmenitiesItem
          icon={<IconUserInterfaceMiscellaneousCapacity />}
          label={numPeopleLayout}
          iconSize="small"
          textSize="large"
        />
      )}
      {showPrice && (
        <AmenitiesItem
          icon={<IconUserInterfacePaymentCard />}
          label={`${formatMoney(booking.totalAmount)} (com IVA)`}
          iconSize="small"
          textSize="large"
        />
      )}
    </Stack>
  );
};

const BookingDetailsSection = ({
  label,
  children,
  className,
}: PropsWithChildren<{ label: string; className?: string }>) => (
  <div className={element("section", undefined, className)}>
    <p className={element("section__title")}>{label}</p>
    {children}
  </div>
);

type Attributes = { icon: ReactNode; label: string }[];

const BookingAttributes = ({
  label,
  attributes,
  className,
}: {
  label: string;
  attributes: Attributes;
  className?: string;
}) => (
  <BookingDetailsSection label={label} className={className}>
    <AmenitiesList
      items={attributes.map(({ icon, label }) => ({
        icon,
        label,
      }))}
      iconSize="small"
      textSize="small"
    />
  </BookingDetailsSection>
);

export const BookingPackAttributes = ({
  attributes,
}: {
  attributes: Attributes;
}) => (
  <BookingAttributes
    label="Incluído no pack"
    attributes={attributes}
    className={element("pack-attributes")}
  />
);

export const BookingSpaceAttributes = ({
  attributes,
}: {
  attributes: Attributes;
}) => (
  <BookingAttributes
    label="Características do espaço"
    attributes={attributes}
  />
);

export const BookingVenueAttributes = ({
  attributes,
}: {
  attributes: Attributes;
}) => (
  <BookingAttributes label="Informações adicionais" attributes={attributes} />
);

export const BookingCancellation = ({
  cancellationPeriod,
}: {
  cancellationPeriod: string;
}) => (
  <BookingDetailsSection label="Política de cancelamento">
    <PackCancellationLabel
      cancellation={cancellationPeriod}
      className={element("cancellation")}
    />
  </BookingDetailsSection>
);

export const BookingPriceDetail = ({
  start,
  priceDetail,
}: {
  start: TimeDuration | null;
  priceDetail: CalculatedPrice;
}) => (
  <BookingDetailsSection label="Detalhes do pagamento">
    <div className={element("price-detail")}>
      <PackPriceDetail price={priceDetail} start={start ?? undefined} />
    </div>
  </BookingDetailsSection>
);

export const BookingTotalPrice = ({
  amount,
  label = "Total c/ IVA",
}: {
  amount: number;
  label?: string;
}) => (
  <Stack row justifyContent="space-between" className={element("total")}>
    <span className={element("total__label")}>{label}</span>
    <span className={element("total__value")}>{formatMoney(amount)}</span>
  </Stack>
);

export const BookingPaymentSummary = ({
  breakdown,
  variant = "full",
}: {
  breakdown: PackPaymentBreakdown;
  variant?: "full" | "compact";
}) => {
  if (!breakdown.isPartial) {
    if (variant === "compact") {
      return null;
    }

    return (
      <BookingTotalPrice
        amount={breakdown.totalAmount}
        label="Total da reserva c/ IVA"
      />
    );
  }

  if (variant === "compact") {
    return (
      <Stack gap="0.5rem" className={element("payment-summary")}>
        <div className={element("payment-summary__box")}>
          <Stack
            row
            justifyContent="space-between"
            alignItems="center"
            className={element("payment-summary__row")}
          >
            <span className={element("payment-summary__label")}>
              Hoje irá pagar
            </span>
            <span className={element("payment-summary__value")}>
              {formatMoney(breakdown.todayAmount)}
            </span>
          </Stack>
        </div>
        <p className={element("payment-summary__cancellation")}>
          Cancelamento gratuito até{" "}
          {formatShortCancellationDate(breakdown.freeCancellationUntil)}
        </p>
      </Stack>
    );
  }

  return (
    <Stack gap="0.5rem" className={element("payment-summary")}>
      <BookingTotalPrice
        amount={breakdown.totalAmount}
        label="Total da reserva c/ IVA"
      />
      <div className={element("payment-summary__box")}>
        <Stack gap="0.5rem">
          <Stack
            row
            justifyContent="space-between"
            alignItems="center"
            className={element("payment-summary__row")}
          >
            <span className={element("payment-summary__label")}>
              Hoje vai pagar
            </span>
            <span className={element("payment-summary__value")}>
              {formatMoney(breakdown.todayAmount)}
            </span>
          </Stack>
          <Stack
            row
            justifyContent="space-between"
            alignItems="center"
            className={element("payment-summary__row")}
          >
            <span className={element("payment-summary__label")}>
              A {formatRemainingPaymentDate(breakdown.freeCancellationUntil)}{" "}
              irá pagar
            </span>
            <span className={element("payment-summary__value")}>
              {formatMoney(breakdown.laterAmount)}
            </span>
          </Stack>
        </Stack>
      </div>
    </Stack>
  );
};

export const BookingBillingContent = ({ booking }: { booking: Booking }) => {
  if (!booking.hasBillingData) {
    return <p>-</p>;
  }

  const vatName = [booking.billingVAT || null, booking.billingName || null]
    .filter(isNotNil)
    .join(" - ");
  const address = booking.billingAddress || null;
  const zipCity = [booking.billingPostCode || null, booking.billingCity || null]
    .filter(isNotNil)
    .join(" ");
  const zipCityCountry = [zipCity || null, booking.billingCountry || null]
    .filter(isNotNil)
    .join(" - ");

  return (
    <p>
      {!!vatName && <span>{vatName}</span>}
      {!!vatName && !!address && <br />}
      {!!address && <span>{address}</span>}
      {!!address && !!zipCityCountry && <br />}
      {!!zipCityCountry && <span>{zipCityCountry}</span>}
    </p>
  );
};

export const BookingBilling = ({ booking }: { booking: Booking }) => {
  if (!booking.hasBillingData) {
    return null;
  }

  return (
    <BookingDetailsSection label="Dados de faturação">
      <div className={element("billing")}>
        <BookingBillingContent booking={booking} />
      </div>
    </BookingDetailsSection>
  );
};

export const BookingContact = ({ booking }: { booking: Booking }) => {
  if (!booking.contactPhone) {
    return null;
  }

  return (
    <BookingDetailsSection label="Contacto disponibilizado">
      <p className={element("phone")}>{booking.contactPhone}</p>
    </BookingDetailsSection>
  );
};

export const BookingHostContact = ({ venue }: { venue?: Venue }) => (
  <BookingDetailsSection label="Contacto do fornecedor">
    <Stack gap="0.5rem">
      <AmenitiesItem
        icon={<IconUserInterfaceMiscellaneousEmail />}
        label={venue?.contactEmail}
        iconSize="small"
        textSize="small"
      />
      <AmenitiesItem
        icon={<IconUserInterfaceMiscellaneousPhone />}
        label={`+${venue?.contactPhoneExtension}${venue?.contactPhoneNumber}`}
        iconSize="small"
        textSize="small"
      />
      <AmenitiesItem
        icon={<IconUserInterfaceMiscellaneousPin />}
        label={
          <>
            {venue?.street1} {venue?.street2}
            <br />
            {venue?.postalCode} {venue?.city}, Portugal
          </>
        }
        iconSize="small"
        textSize="small"
      />
    </Stack>
  </BookingDetailsSection>
);
