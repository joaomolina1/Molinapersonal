"use client";

import { createBEMClasses } from "@/_utils/classname";
import Logo from "@/_design_system/Logo";
import Button, { IconButton } from "@/_design_system/Button";
import IconUserInterfaceNavigationMenuHamburguer from "@/_design_system/_icons/UserInterface/Navigation/MenuHamburguer.svg";
import MenuDrawer from "./MenuDrawer";
import {
  PropsWithChildren,
  ReactNode,
  Suspense,
  useEffect,
  useState,
} from "react";
import Stack from "@/_design_system/Stack";
import IconUserInterfaceMiscellaneousVenues from "@/_design_system/_icons/UserInterface/Miscellaneous/Venues.svg";
import Session from "./Session";
import { useSession } from "@/_services/session";
import IconUserInterfaceFormsCalendar from "@/_design_system/_icons/UserInterface/Forms/Calendar.svg";
import { useMediaQuery } from "@/_utils/mediaQuery";
import Tooltip from "@/_design_system/Tooltip";
import { useRouterPush } from "@/_services/navigation";
import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";
import RegisterSuccessModal from "./RegisterSuccessModal";
import { useHostStatus } from "./useHostStatus";
import { useSearchParamsObjectState } from "@/_services/searchParams";
import RequestResetPasswordModal from "./RequestResetPasswordModal";
import ResetPasswordModal from "./ResetPasswordModal";
import { ErrorBoundary } from "@/_services/sentry";
import IconUserInterfaceActionsSave from "@/_design_system/_icons/UserInterface/Actions/Save.svg";
import { useWatchlist } from "@/_models/watchlist";
import Counter from "@/_design_system/Counter";
import CompleteProfileModal from "./CompleteProfileModal";

const { block } = createBEMClasses("main-header");

export const useSessionSearchParams = () => {
  return useSearchParamsObjectState(["action", "source", "otp", "username"]);
};

type HeaderProps = PropsWithChildren<{
  variant: "default" | "inverted";
  logoLink?: boolean;
  hideDefaultButton?: boolean;
  hideSession?: boolean;
  hideDrawer?: boolean;
}>;

const HeaderSuspense = (props: HeaderProps) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<HeaderFallback {...props} />}>
        <Header {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

const Header = ({
  variant,
  logoLink = true,
  hideDefaultButton = false,
  hideSession = false,
  hideDrawer = false,
  children,
}: HeaderProps) => {
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);

  const isLargeMobile = useMediaQuery("large");
  const isXLargeMobile = useMediaQuery("xLarge");
  const [session] = useSession();

  const collapse = !!isXLargeMobile && children !== undefined;

  // Login, Register modals

  const [
    sessionSearchParams,
    setSessionSearchParams,
    getSessionSearchParamsHref,
  ] = useSessionSearchParams();

  const { action, source, otp, username } = sessionSearchParams as {
    action:
      | "login"
      | "register"
      | "register-success"
      | "request-reset-password"
      | "reset-password"
      | null;
    source: "login" | "become-host" | "show-price" | "write-review" | null;
    otp: string | null;
    username: string | null;
  };

  const loginHref = getSessionSearchParamsHref({
    action: "login",
    source,
    otp: null,
    username: null,
  });
  const registerHref = getSessionSearchParamsHref({
    action: "register",
    source,
    otp: null,
    username: null,
  });
  const requestResetPasswordHref = getSessionSearchParamsHref({
    action: "request-reset-password",
    source,
    otp: null,
    username: null,
  });

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setSessionSearchParams({
        action: null,
        source: null,
        otp: null,
        username: null,
      });
    }
  };

  // Clear action after login

  useEffect(() => {
    if (!!session && !!action) {
      setSessionSearchParams({
        action: null,
        source: null,
        otp: null,
        username: null,
      });
    }
  }, [action, source, session, setSessionSearchParams]);

  // Handle host callback

  const routerPush = useRouterPush();
  const hostStatus = useHostStatus();

  useEffect(() => {
    if (!!session && source === "become-host") {
      if (!session?.roles.includes("admin")) {
        if (hostStatus) {
          if (hostStatus.isAlreadyHost) {
            routerPush("/host");
          } else {
            routerPush("/onboarding");
          }
        }
      } else {
        setSessionSearchParams({
          action: null,
          source: null,
          otp: null,
          username: null,
        });
      }
    }
  }, [source, hostStatus, routerPush, session, setSessionSearchParams]);

  // Saved

  const { data: watchlist } = useWatchlist();

  return (
    <>
      <div className={block({ variant })}>
        <Logo type={variant} link={logoLink} />

        {!isLargeMobile && (
          <nav>
            {children}
            <Stack
              row
              gap="0.5rem"
              alignItems="center"
              style={{ marginLeft: "auto" }}
            >
              {!hideDefaultButton && (
                <>
                  {session === null && (
                    <HeaderButton
                      icon={<IconUserInterfaceMiscellaneousVenues />}
                      label="Torne-se parceiro"
                      href="?action=register&source=become-host"
                      collapse={collapse}
                      prefetch={false}
                    />
                  )}

                  {!!session && !session.roles.includes("admin") && (
                    <>
                      <HeaderButton
                        icon={<IconUserInterfaceFormsCalendar />}
                        label="As minhas reservas"
                        href="/my-bookings"
                        collapse={collapse}
                      />
                      <HeaderButton
                        icon={<IconUserInterfaceActionsSave />}
                        label="Favoritos"
                        rightIcon={
                          watchlist?.spaces.length ? (
                            <Counter
                              value={watchlist.spaces.length}
                              variant="inverted"
                            />
                          ) : null
                        }
                        href="/saved"
                        collapse={collapse}
                      />
                    </>
                  )}
                </>
              )}

              {!hideSession && (
                <Session collapse={collapse} loginHref={loginHref} />
              )}
            </Stack>
          </nav>
        )}

        {isLargeMobile &&
          (hideDrawer ? (
            children
          ) : (
            <IconButton
              ariaLabel="Abrir menu"
              icon={<IconUserInterfaceNavigationMenuHamburguer />}
              onClick={() => setIsMenuDrawerOpen(true)}
            />
          ))}
      </div>
      <MenuDrawer
        isOpen={isMenuDrawerOpen}
        onOpenChange={setIsMenuDrawerOpen}
        loginHref={loginHref}
      />
      <LoginModal
        isOpen={action === "login"}
        onOpenChange={handleClose}
        registerHref={registerHref}
        requestResetPasswordHref={requestResetPasswordHref}
        source={source}
      />
      <RegisterModal
        isOpen={action === "register"}
        onOpenChange={handleClose}
        loginHref={loginHref}
        source={source}
      />
      <RequestResetPasswordModal
        isOpen={action === "request-reset-password"}
        onOpenChange={handleClose}
        loginHref={loginHref}
      />
      <ResetPasswordModal
        isOpen={action === "reset-password" && !!otp}
        onOpenChange={handleClose}
        otp={otp}
      />
      {/* Accessed when the client clicks on the validation email */}
      {!!otp && !!username && action === "register-success" && (
        <RegisterSuccessModal
          isOpen={true}
          onOpenChange={handleClose}
          loginHref={loginHref}
          username={username}
          otp={otp}
        />
      )}
      <CompleteProfileModal />
    </>
  );
};

const HeaderButton = ({
  icon,
  rightIcon,
  label,
  href,
  prefetch,
  collapse,
}: {
  icon: ReactNode;
  rightIcon?: ReactNode;
  label: string;
  href: string;
  prefetch?: boolean;
  collapse: boolean;
}) => {
  const routerPush = useRouterPush();

  if (collapse) {
    return (
      <Tooltip content={label}>
        <Button
          type="link-inverted"
          leftIcon={icon}
          onClick={() => routerPush(href)}
        />
      </Tooltip>
    );
  }

  return (
    <Button
      type="link-inverted"
      leftIcon={icon}
      label={label}
      rightIcon={rightIcon}
      href={href}
      prefetch={prefetch}
    />
  );
};

const HeaderFallback = ({ variant, logoLink }: HeaderProps) => {
  return (
    <div className={block({ variant })}>
      <Logo type={variant} link={logoLink} />
    </div>
  );
};

export default HeaderSuspense;
