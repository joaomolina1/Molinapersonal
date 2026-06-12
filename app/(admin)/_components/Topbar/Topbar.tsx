"use client";

import Button, { IconButton } from "@/_design_system/Button";
import IconUserInterfaceNavigationMenuHamburguer from "@/_design_system/_icons/UserInterface/Navigation/MenuHamburguer.svg";
import IconUserInterfaceMiscellaneousLogout from "@/_design_system/_icons/UserInterface/Miscellaneous/Logout.svg";
import { createBEMClasses } from "@/_utils/classname";
import { useLogout, useSession } from "@/_services/session";
import { usePathname } from "next/navigation";
import { ADMIN_NAV_GROUPS, isAdminNavItemActive } from "../Sidebar";

const { block, element } = createBEMClasses("admin-topbar");

const Topbar = ({ onMenuToggle }: { onMenuToggle: () => void }) => {
  const [session] = useSession();
  const pathname = usePathname();
  const { mutateAsync: logout, isPending: isPendingLogout } = useLogout();

  const currentItem = ADMIN_NAV_GROUPS.flatMap((group) => group.items).find(
    (item) => isAdminNavItemActive(pathname, item.href),
  );

  return (
    <header className={block()}>
      <div className={element("left")}>
        <IconButton
          ariaLabel="Abrir menu"
          icon={<IconUserInterfaceNavigationMenuHamburguer />}
          onClick={onMenuToggle}
          showTooltip={false}
          className={element("menu-button")}
        />
        <h1>{currentItem?.label ?? "Backoffice"}</h1>
      </div>
      <div className={element("right")}>
        {!!session && (
          <span className={element("user")}>
            {session.name || session.email}
          </span>
        )}
        <Button
          type="secondary"
          label="Sair"
          leftIcon={<IconUserInterfaceMiscellaneousLogout />}
          loading={isPendingLogout}
          onClick={() => void logout()}
        />
      </div>
    </header>
  );
};

export default Topbar;
