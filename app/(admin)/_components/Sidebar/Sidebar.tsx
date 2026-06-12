"use client";

import Logo from "@/_design_system/Logo";
import { Link } from "@/_services/navigation";
import { createBEMClasses } from "@/_utils/classname";
import { usePathname } from "next/navigation";
import IconUserInterfaceMiscellaneousDashboardBlocks from "@/_design_system/_icons/UserInterface/Miscellaneous/DashboardBlocks.svg";
import IconUserInterfaceFormsCalendar from "@/_design_system/_icons/UserInterface/Forms/Calendar.svg";
import IconUserInterfaceMiscellaneousChat from "@/_design_system/_icons/UserInterface/Miscellaneous/Chat.svg";
import IconUserInterfaceMiscellaneousPromote from "@/_design_system/_icons/UserInterface/Miscellaneous/Promote.svg";
import IconUserInterfaceMiscellaneousGraphUp from "@/_design_system/_icons/UserInterface/Miscellaneous/GraphUp.svg";
import IconUserInterfaceMiscellaneousQuote from "@/_design_system/_icons/UserInterface/Miscellaneous/Quote.svg";
import IconUserInterfaceMiscellaneousUser from "@/_design_system/_icons/UserInterface/Miscellaneous/User.svg";
import IconUserInterfaceMiscellaneousTip from "@/_design_system/_icons/UserInterface/Miscellaneous/Tip.svg";
import type { ReactNode } from "react";

const { block, element } = createBEMClasses("admin-sidebar");

export const ADMIN_NAV_GROUPS: {
  label: string | null;
  items: { href: string; label: string; icon: ReactNode }[];
}[] = [
  {
    label: null,
    items: [
      {
        href: "/admin",
        label: "Estados",
        icon: <IconUserInterfaceMiscellaneousDashboardBlocks />,
      },
    ],
  },
  {
    label: "Operação",
    items: [
      {
        href: "/admin/bookings",
        label: "Reservas",
        icon: <IconUserInterfaceFormsCalendar />,
      },
      {
        href: "/admin/quotes",
        label: "Pedidos",
        icon: <IconUserInterfaceMiscellaneousChat />,
      },
    ],
  },
  {
    label: "Oferta",
    items: [
      {
        href: "/admin/highlights",
        label: "Destaques",
        icon: <IconUserInterfaceMiscellaneousPromote />,
      },
      {
        href: "/admin/subscriptions",
        label: "Subscrições",
        icon: <IconUserInterfaceMiscellaneousGraphUp />,
      },
    ],
  },
  {
    label: "Conteúdo",
    items: [
      {
        href: "/admin/testimonials",
        label: "Testemunhos",
        icon: <IconUserInterfaceMiscellaneousQuote />,
      },
    ],
  },
  {
    label: "Contas",
    items: [
      {
        href: "/admin/users",
        label: "Utilizadores",
        icon: <IconUserInterfaceMiscellaneousUser />,
      },
    ],
  },
  {
    label: "Ferramentas",
    items: [
      {
        href: "/admin/chat",
        label: "GENINU",
        icon: <IconUserInterfaceMiscellaneousTip />,
      },
    ],
  },
];

export const isAdminNavItemActive = (pathname: string, href: string) =>
  pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));

const Sidebar = ({
  isOpen,
  onNavigate,
}: {
  isOpen: boolean;
  onNavigate: () => void;
}) => {
  const pathname = usePathname();

  return (
    <aside className={block({ open: isOpen })}>
      <div className={element("brand")}>
        <Link href="/admin" onClick={onNavigate}>
          <Logo />
          <span>Backoffice</span>
        </Link>
      </div>
      <nav className={element("nav")}>
        {ADMIN_NAV_GROUPS.map((group, index) => (
          <div key={index} className={element("group")}>
            {group.label && (
              <p className={element("group__label")}>{group.label}</p>
            )}
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={element("link", {
                  active: isAdminNavItemActive(pathname, item.href),
                })}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className={element("footer")}>
        <Link href="/" onClick={onNavigate}>
          Ver site →
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
