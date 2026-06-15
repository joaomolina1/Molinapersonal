"use client";

import Button, { IconButton } from "@/_design_system/Button";
import Avatar from "@/_design_system/Avatar";
import IconUserInterfaceNavigationMenuHamburguer from "@/_design_system/_icons/UserInterface/Navigation/MenuHamburguer.svg";
import { createBEMClasses } from "@/_utils/classname";
import { useSession } from "@/_services/session";
import { usePathname } from "next/navigation";
import { buildHostNavGroups, isHostNavItemActive } from "../Sidebar";

const { block, element } = createBEMClasses("host-topbar");

const Topbar = ({
  hasPaidTier,
  onMenuToggle,
}: {
  hasPaidTier: boolean;
  onMenuToggle: () => void;
}) => {
  const [session] = useSession();
  const pathname = usePathname();

  const currentItem = buildHostNavGroups(hasPaidTier)
    .flatMap((group) => group.items)
    .find((item) => isHostNavItemActive(pathname, item.href));

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
        <h1>{currentItem?.label ?? "Cockpit"}</h1>
      </div>
      <div className={element("right")}>
        <Button type="secondary" label="Ver site" href="/" />
        {!!session && (
          <Avatar
            name={session.name}
            url={session.photoURL ?? undefined}
            size="medium"
          />
        )}
      </div>
    </header>
  );
};

export default Topbar;
