"use client";

import Logo from "@/_design_system/Logo";
import { Link } from "@/_services/navigation";
import { createBEMClasses } from "@/_utils/classname";
import { usePathname } from "next/navigation";
import IconUserInterfaceMiscellaneousDashboardBlocks from "@/_design_system/_icons/UserInterface/Miscellaneous/DashboardBlocks.svg";
import IconUserInterfaceMiscellaneousVenues from "@/_design_system/_icons/UserInterface/Miscellaneous/Venues.svg";
import IconUserInterfaceMiscellaneousPacks from "@/_design_system/_icons/UserInterface/Miscellaneous/Packs.svg";
import IconUserInterfaceFormsCalendar from "@/_design_system/_icons/UserInterface/Forms/Calendar.svg";
import IconUserInterfaceMiscellaneousUsers from "@/_design_system/_icons/UserInterface/Miscellaneous/Users.svg";
import IconUserInterfaceActionsMoveLeft from "@/_design_system/_icons/UserInterface/Actions/MoveLeft.svg";
import IconUserInterfaceActionsMoveRight from "@/_design_system/_icons/UserInterface/Actions/MoveRight.svg";
import type { ReactNode } from "react";

type NavItem = { href: string; label: string; icon: ReactNode };

export const buildHostNavGroups = (hasPaidTier: boolean): {
  label: string | null;
  items: NavItem[];
}[] => [
  {
    label: null,
    items: [
      {
        href: "/host",
        label: "Dashboard",
        icon: <IconUserInterfaceMiscellaneousDashboardBlocks />,
      },
    ],
  },
  {
    label: "Gestão",
    items: [
      {
        href: "/host/spaces",
        label: "Gestão de espaços",
        icon: <IconUserInterfaceMiscellaneousVenues />,
      },
      {
        href: "/host/services",
        label: "Gestão de serviços",
        icon: <IconUserInterfaceMiscellaneousPacks />,
      },
    ],
  },
  {
    label: "Operação",
    items: [
      {
        href: "/host/bookings",
        label: "Reservas",
        icon: <IconUserInterfaceFormsCalendar />,
      },
      {
        href: "/host/calendar",
        label: "Calendário",
        icon: <IconUserInterfaceFormsCalendar />,
      },
      ...(hasPaidTier
        ? [
            {
              href: "/host/event-hub",
              label: "Event Hub",
              icon: <IconUserInterfaceMiscellaneousUsers />,
            },
          ]
        : []),
    ],
  },
];

export const isHostNavItemActive = (pathname: string, href: string) =>
  pathname === href || (href !== "/host" && pathname.startsWith(`${href}/`));

const { block, element } = createBEMClasses("host-sidebar");

const Sidebar = ({
  isOpen,
  isCollapsed,
  hasPaidTier,
  onToggleCollapsed,
  onNavigate,
}: {
  isOpen: boolean;
  isCollapsed: boolean;
  hasPaidTier: boolean;
  onToggleCollapsed: () => void;
  onNavigate: () => void;
}) => {
  const pathname = usePathname();
  const groups = buildHostNavGroups(hasPaidTier);

  return (
    <aside className={block({ open: isOpen, collapsed: isCollapsed })}>
      <div className={element("brand")}>
        <Link href="/host" onClick={onNavigate}>
          <Logo />
          {!isCollapsed && <span>Cockpit</span>}
        </Link>
      </div>
      <nav className={element("nav")}>
        {groups.map((group, index) => (
          <div key={index} className={element("group")}>
            {group.label && !isCollapsed && (
              <p className={element("group__label")}>{group.label}</p>
            )}
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                title={isCollapsed ? item.label : undefined}
                className={element("link", {
                  active: isHostNavItemActive(pathname, item.href),
                })}
              >
                {item.icon}
                {!isCollapsed && item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className={element("footer")}>
        {!isCollapsed && (
          <Link href="/onboarding" onClick={onNavigate}>
            + Adicionar local ou empresa
          </Link>
        )}
        <button
          type="button"
          className={element("collapse")}
          onClick={onToggleCollapsed}
          aria-label={isCollapsed ? "Expandir menu" : "Comprimir menu"}
          title={isCollapsed ? "Expandir menu" : "Comprimir menu"}
        >
          {isCollapsed ? (
            <IconUserInterfaceActionsMoveRight />
          ) : (
            <IconUserInterfaceActionsMoveLeft />
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
