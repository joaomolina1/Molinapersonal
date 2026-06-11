"use client";

import { PrimaryHeader } from "@/_components/Header";
import Button from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import IconUserInterfaceFormsCalendar from "@/_design_system/_icons/UserInterface/Forms/Calendar.svg";
import IconUserInterfaceMiscellaneousChat from "@/_design_system/_icons/UserInterface/Miscellaneous/Chat.svg";
import IconUserInterfaceMiscellaneousDashboardBlocks from "@/_design_system/_icons/UserInterface/Miscellaneous/DashboardBlocks.svg";
import IconUserInterfaceMiscellaneousPromote from "@/_design_system/_icons/UserInterface/Miscellaneous/Promote.svg";
import IconUserInterfaceMiscellaneousUser from "@/_design_system/_icons/UserInterface/Miscellaneous/User.svg";
import IconUserInterfaceMiscellaneousQuoteSign from "@/_design_system/_icons/UserInterface/Miscellaneous/Quote.svg";
import { createBEMClasses } from "@/_utils/classname";
import { usePathname } from "next/navigation";

const { block, element } = createBEMClasses("admin-header");

const AdminHeader = () => {
  const pathname = usePathname();

  return (
    <PrimaryHeader hideDefaultButton className={block()}>
      <Stack row gap="1.25rem">
        <div className={element("nav-link", { active: pathname === "/admin" })}>
          <Button
            type="link-inverted"
            leftIcon={<IconUserInterfaceMiscellaneousDashboardBlocks />}
            label="Estados"
            href="/admin"
          />
        </div>
        <div
          className={element("nav-link", {
            active: pathname === "/admin/bookings",
          })}
        >
          <Button
            type="link-inverted"
            leftIcon={<IconUserInterfaceFormsCalendar />}
            label="Reservas"
            href="/admin/bookings"
          />
        </div>
        <div
          className={element("nav-link", {
            active: pathname === "/admin/users",
          })}
        >
          <Button
            type="link-inverted"
            leftIcon={<IconUserInterfaceMiscellaneousUser />}
            label="Utilizadores"
            href="/admin/users"
          />
        </div>
        <div
          className={element("nav-link", {
            active: pathname === "/admin/highlights",
          })}
        >
          <Button
            type="link-inverted"
            leftIcon={<IconUserInterfaceMiscellaneousPromote />}
            label="Destaques"
            href="/admin/highlights"
          />
        </div>
        <div
          className={element("nav-link", {
            active: pathname === "/admin/subscriptions",
          })}
        >
          <Button
            type="link-inverted"
            leftIcon={<IconUserInterfaceMiscellaneousPromote />}
            label="Subscrições"
            href="/admin/subscriptions"
          />
        </div>
        <div
          className={element("nav-link", {
            active: pathname === "/admin/testimonials",
          })}
        >
          <Button
            type="link-inverted"
            leftIcon={<IconUserInterfaceMiscellaneousQuoteSign />}
            label="Testemunhos"
            href="/admin/testimonials"
          />
        </div>
        <div
          className={element("nav-link", {
            active: pathname === "/admin/quotes",
          })}
        >
          <Button
            type="link-inverted"
            leftIcon={<IconUserInterfaceMiscellaneousChat />}
            label="Pedidos"
            href="/admin/quotes"
          />
        </div>
      </Stack>
    </PrimaryHeader>
  );
};

export default AdminHeader;
