"use client";

import { PrimaryHeader } from "@/_components/Header";
import Button from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import IconUserInterfaceFormsCalendar from "@/_design_system/_icons/UserInterface/Forms/Calendar.svg";
import IconUserInterfaceMiscellaneousDashboardBlocks from "@/_design_system/_icons/UserInterface/Miscellaneous/DashboardBlocks.svg";
import { createBEMClasses } from "@/_utils/classname";
import { usePathname } from "next/navigation";

const { block, element } = createBEMClasses("host-header");

const HostHeader = () => {
  const pathname = usePathname();

  return (
    <PrimaryHeader hideDefaultButton className={block()}>
      <Stack row gap="1.25rem">
        <div className={element("nav-link", { active: pathname === "/host" })}>
          <Button
            type="link-inverted"
            leftIcon={<IconUserInterfaceMiscellaneousDashboardBlocks />}
            label="Dashboard"
            href="/host"
          />
        </div>
        <div
          className={element("nav-link", {
            active: pathname === "/host/bookings",
          })}
        >
          <Button
            type="link-inverted"
            leftIcon={<IconUserInterfaceFormsCalendar />}
            label="Reservas"
            href="/host/bookings"
          />
        </div>
        <div
          className={element("nav-link", {
            active: pathname === "/host/calendar",
          })}
        >
          <Button
            type="link-inverted"
            leftIcon={<IconUserInterfaceFormsCalendar />}
            label="Calendário"
            href="/host/calendar"
          />
        </div>
      </Stack>
    </PrimaryHeader>
  );
};

export default HostHeader;
