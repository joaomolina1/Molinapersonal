"use client";

import AmenitiesItem from "@/_design_system/AmenitiesItem";
import Stack from "@/_design_system/Stack";
import Tag from "@/_design_system/Tag";
import IconUserInterfaceFormsCalendar from "@/_design_system/_icons/UserInterface/Forms/Calendar.svg";
import IconUserInterfaceFormsCustomOption from "@/_design_system/_icons/UserInterface/Forms/CustomOption.svg";
import IconUserInterfaceMiscellaneousCapacity from "@/_design_system/_icons/UserInterface/Miscellaneous/Capacity.svg";
import IconUserInterfaceMiscellaneousClock from "@/_design_system/_icons/UserInterface/Miscellaneous/Clock.svg";
import IconUserInterfaceMiscellaneousGraphUp from "@/_design_system/_icons/UserInterface/Miscellaneous/GraphUp.svg";
import IconUserInterfaceNavigationArrowRight from "@/_design_system/_icons/UserInterface/Navigation/ArrowRight.svg";
import IconUserInterfacePaymentCard from "@/_design_system/_icons/UserInterface/Payment/Card.svg";
import { createBEMClasses } from "@/_utils/classname";

const { block: bookingSmallBlock, element: bookingSmallElement } =
  createBEMClasses("help-host-app-snippet-booking-small");

export const BookingSmall = () => (
  <Stack
    gap="1.5rem"
    row
    alignItems="center"
    justifyContent="space-between"
    className={bookingSmallBlock()}
  >
    <Stack gap="0.5rem">
      <Stack gap="0.25rem">
        <p className={bookingSmallElement("name")}>Aluguer do espaço</p>
        <p className={bookingSmallElement("hours")}>08:00 - 00:00</p>
      </Stack>
      <Tag type="success" text="Pago" />
    </Stack>
    <IconUserInterfaceNavigationArrowRight />
  </Stack>
);

const { block: bookingLargeBlock, element: bookingLargeElement } =
  createBEMClasses("help-host-app-snippet-booking-large");

export const BookingLarge = () => (
  <Stack gap="2rem" row className={bookingLargeBlock()}>
    <div className={bookingLargeElement("image")}>
      <Tag type="warning" text="Em confirmação" />
    </div>
    <Stack gap="1rem" className={bookingLargeElement("content")}>
      <Stack gap="0.25rem">
        <p className={bookingLargeElement("title")}>Aluguer do espaço</p>
        <p className={bookingLargeElement("subtitle")}>
          Sala de reuniões
          <br />
          Memmo Príncipe Real
        </p>
      </Stack>
      <Stack gap="0.5rem">
        <AmenitiesItem
          icon={<IconUserInterfaceFormsCustomOption />}
          label="Reserva nº 57483832"
          iconSize="small"
          textSize="large"
        />
        <AmenitiesItem
          icon={<IconUserInterfaceFormsCalendar />}
          label="Segunda-feira, 23 de janeiro de 2023"
          iconSize="small"
          textSize="large"
        />
        <AmenitiesItem
          icon={<IconUserInterfaceMiscellaneousClock />}
          label="Das 09:00 às 17:00 (8h)"
          iconSize="small"
          textSize="large"
        />
        <AmenitiesItem
          icon={<IconUserInterfaceMiscellaneousCapacity />}
          label="60 pessoas (em pé)"
          iconSize="small"
          textSize="large"
        />
        <AmenitiesItem
          icon={<IconUserInterfacePaymentCard />}
          label="440,00€ (com IVA)"
          iconSize="small"
          textSize="large"
        />
      </Stack>
    </Stack>
  </Stack>
);

const { block: statisticsBlock, element: statisticsElement } = createBEMClasses(
  "help-host-app-snippet-statistics",
);

export const Statistics = () => (
  <Stack gap="1rem" row alignItems="center" className={statisticsBlock()}>
    <div className={statisticsElement("icon")}>
      <IconUserInterfaceFormsCalendar />
    </div>
    <Stack gap="0.125rem">
      <p className={statisticsElement("label")}>Reservas</p>
      <Stack gap="0.5rem" row alignItems="center">
        <span className={statisticsElement("value")}>1.293</span>
        <div className={statisticsElement("tag")}>
          <IconUserInterfaceMiscellaneousGraphUp />
          <span>+23 mês passado</span>
        </div>
      </Stack>
    </Stack>
  </Stack>
);
