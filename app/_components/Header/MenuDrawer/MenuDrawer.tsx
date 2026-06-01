"use client";

import { IconButton } from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import IconUserInterfaceActionsClose from "@/_design_system/_icons/UserInterface/Actions/Close.svg";
import IconUserInterfaceFormsCalendar from "@/_design_system/_icons/UserInterface/Forms/Calendar.svg";
import IconUserInterfaceMiscellaneousDashboardBlocks from "@/_design_system/_icons/UserInterface/Miscellaneous/DashboardBlocks.svg";
import IconUserInterfaceMiscellaneousVenues from "@/_design_system/_icons/UserInterface/Miscellaneous/Venues.svg";
import { useLogout, useSession } from "@/_services/session";
import { createBEMClasses } from "@/_utils/classname";
import { PropsWithChildren, ReactNode, Suspense } from "react";
import {
  ModalOverlay as AriaModalOverlay,
  Modal as AriaModal,
  Dialog as AriaDialog,
  Button as AriaButton,
} from "react-aria-components";
import Session from "../Session";
import { Link } from "@/_services/navigation";
import { useHostStatus } from "../useHostStatus";
import IconUserInterfaceMiscellaneousUser from "@/_design_system/_icons/UserInterface/Miscellaneous/User.svg";
import IconUserInterfaceMiscellaneousLogout from "@/_design_system/_icons/UserInterface/Miscellaneous/Logout.svg";
import { HeroSearchModal } from "@/(main)/search/_components/HeroSearchModal";
import { usePathname } from "next/navigation";
import IconUserInterfaceActionsSave from "@/_design_system/_icons/UserInterface/Actions/Save.svg";
import Counter from "@/_design_system/Counter";
import { useWatchlist } from "@/_models/watchlist";
import IconUserInterfaceMiscellaneousPromote from "@/_design_system/_icons/UserInterface/Miscellaneous/Promote.svg";
import IconUserInterfaceMiscellaneousChat from "@/_design_system/_icons/UserInterface/Miscellaneous/Chat.svg";

export type MenuDrawerProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  loginHref: string;
};

const { block, element } = createBEMClasses("menu-drawer");

const MenuDrawer = ({ isOpen, onOpenChange, loginHref }: MenuDrawerProps) => {
  const [session] = useSession();
  const { mutateAsync: logout } = useLogout();

  const hostStatus = useHostStatus();
  const { data: watchlist } = useWatchlist();

  return (
    <AriaModalOverlay
      className={element("overlay")}
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      isDismissable
    >
      <AriaModal className={block()}>
        <AriaDialog className={element("dialog")} aria-label="Menu">
          <Stack
            row
            justifyContent="flex-end"
            style={{ paddingBottom: "1.5rem" }}
          >
            <IconButton
              ariaLabel="Fechar menu"
              onClick={() => onOpenChange(false)}
              icon={<IconUserInterfaceActionsClose />}
            />
          </Stack>
          <nav>
            <Stack gap="1.5rem">
              <Session menuDrawer loginHref={loginHref} />
              <MenuSearch closeDrawer={() => onOpenChange(false)} />
              {!!session && (
                <div>
                  {!session.roles.includes("admin") && (
                    <>
                      <MenuItem
                        icon={<IconUserInterfaceFormsCalendar />}
                        text="As minhas reservas"
                        href="/my-bookings"
                        close={() => onOpenChange(false)}
                      />
                      <MenuItem
                        icon={<IconUserInterfaceActionsSave />}
                        text="Favoritos"
                        rightIcon={
                          watchlist?.spaces.length ? (
                            <Counter value={watchlist.spaces.length} />
                          ) : null
                        }
                        href="/saved"
                        close={() => onOpenChange(false)}
                      />
                    </>
                  )}
                  <MenuItem
                    icon={<IconUserInterfaceMiscellaneousUser />}
                    text="Gerir conta"
                    href="/account"
                    close={() => onOpenChange(false)}
                  />
                  <MenuItem
                    icon={<IconUserInterfaceMiscellaneousLogout />}
                    text="Terminar sessão"
                    onClick={() => {
                      onOpenChange(false);
                      logout();
                    }}
                  />
                </div>
              )}
            </Stack>
            {!!hostStatus && (
              <MenuSection title="Parceiro">
                {hostStatus.isAlreadyHost ? (
                  <div>
                    <MenuItem
                      icon={<IconUserInterfaceMiscellaneousDashboardBlocks />}
                      text="Dashboard"
                      href="/host"
                      close={() => onOpenChange(false)}
                    />
                    <MenuItem
                      icon={<IconUserInterfaceFormsCalendar />}
                      text="Reservas"
                      href="/host/bookings"
                      close={() => onOpenChange(false)}
                    />
                    <MenuItem
                      icon={<IconUserInterfaceFormsCalendar />}
                      text="Calendário"
                      href="/host/calendar"
                      close={() => onOpenChange(false)}
                    />
                  </div>
                ) : (
                  <MenuItem
                    icon={<IconUserInterfaceMiscellaneousVenues />}
                    text="Registar o seu espaço"
                    href={hostStatus.href}
                    close={session ? () => onOpenChange(false) : undefined}
                    prefetch={false}
                  />
                )}
              </MenuSection>
            )}
            {session?.roles.includes("admin") && (
              <MenuSection title="Admin RINU">
                <div>
                  <MenuItem
                    icon={<IconUserInterfaceMiscellaneousDashboardBlocks />}
                    text="Estados"
                    href="/admin"
                    close={() => onOpenChange(false)}
                  />
                  <MenuItem
                    icon={<IconUserInterfaceFormsCalendar />}
                    text="Reservas"
                    href="/admin/bookings"
                    close={() => onOpenChange(false)}
                  />
                  <MenuItem
                    icon={<IconUserInterfaceMiscellaneousUser />}
                    text="Utilizadores"
                    href="/admin/users"
                    close={() => onOpenChange(false)}
                  />
                  <MenuItem
                    icon={<IconUserInterfaceMiscellaneousPromote />}
                    text="Destaques"
                    href="/admin/highlights"
                    close={() => onOpenChange(false)}
                  />
                  <MenuItem
                    icon={<IconUserInterfaceMiscellaneousChat />}
                    text="Pedidos de Orçamento"
                    href="/admin/quotes"
                    close={() => onOpenChange(false)}
                  />
                </div>
              </MenuSection>
            )}
          </nav>
        </AriaDialog>
      </AriaModal>
    </AriaModalOverlay>
  );
};

const MenuSearch = ({ closeDrawer }: { closeDrawer: () => void }) => {
  const pathname = usePathname();

  return (
    <Suspense fallback={null}>
      {pathname !== "/search" && <HeroSearchModal closeDrawer={closeDrawer} />}
    </Suspense>
  );
};

const MenuSection = ({
  title,
  children,
}: PropsWithChildren<{ title: string }>) => {
  return (
    <Stack gap="1rem">
      <h6>{title}</h6>
      {children}
    </Stack>
  );
};

export const MenuItem = ({
  icon,
  rightIcon,
  text,
  href,
  prefetch,
  onClick,
  close,
}: {
  icon: ReactNode;
  rightIcon?: ReactNode;
  text: string;
  href?: string;
  prefetch?: boolean;
  onClick?: () => void;
  close?: () => void;
}) => {
  if (href) {
    return (
      <Link
        href={href}
        className={element("item")}
        onClick={close}
        prefetch={prefetch}
      >
        {icon}
        <span>{text}</span>
        {rightIcon}
      </Link>
    );
  }

  return (
    <AriaButton onPress={() => onClick?.()} className={element("item")}>
      {icon}
      <span>{text}</span>
      {rightIcon}
    </AriaButton>
  );
};

export default MenuDrawer;
