import Button from "@/_design_system/Button";
import Callout from "@/_design_system/Callout";
import ProfileButton from "@/_design_system/ProfileButton";
import IconUserInterfaceMiscellaneousLogout from "@/_design_system/_icons/UserInterface/Miscellaneous/Logout.svg";
import { useSession, useLogout } from "@/_services/session";
import {
  MenuTrigger as AriaMenuTrigger,
  Popover as AriaPopover,
} from "react-aria-components";
import { MenuItem } from "../MenuDrawer";
import IconUserInterfaceMiscellaneousUser from "@/_design_system/_icons/UserInterface/Miscellaneous/User.svg";
import { createBEMClasses } from "@/_utils/classname";
import Stack from "@/_design_system/Stack";
import Avatar from "@/_design_system/Avatar";
import { Suspense } from "react";
import { useRouterPush } from "@/_services/navigation";
import { useHostStatus } from "../useHostStatus";
import IconUserInterfaceMiscellaneousPin from "@/_design_system/_icons/UserInterface/Miscellaneous/Pin.svg";

const { block, element } = createBEMClasses("header-session");

type SessionProps = {
  menuDrawer?: boolean;
  collapse?: boolean;
  loginHref: string;
};

const SessionSuspense = (props: SessionProps) => {
  return (
    <Suspense fallback={<LoginButton menuDrawer={props.menuDrawer} />}>
      <Session {...props} />
    </Suspense>
  );
};

export const Session = ({ menuDrawer, collapse, loginHref }: SessionProps) => {
  const [session] = useSession();
  const { mutateAsync: logout } = useLogout();
  const routerPush = useRouterPush();

  const hostStatus = useHostStatus();

  const accountCalloutOptions = hostStatus
    ? hostStatus.isAlreadyHost
      ? [HOST_ACCOUNT_CALLOUT_OPTION, ...BASE_ACCOUNT_CALLOUT_OPTIONS]
      : [ONBOARDING_ACCOUNT_CALLOUT_OPTION, ...BASE_ACCOUNT_CALLOUT_OPTIONS]
    : BASE_ACCOUNT_CALLOUT_OPTIONS;

  const handleAccountCalloutClickOption = (id: AccountCalloutOption) => {
    switch (id) {
      case "account":
        routerPush("/account");
        return;
      case "logout":
        logout();
        return;
      case "host":
        routerPush("/host");
        return;
      case "onboarding":
        routerPush("/onboarding");
        return;
    }
  };

  return (
    <>
      {!!session &&
        (menuDrawer ? (
          <Stack row alignItems="center" gap="1rem" className={block()}>
            <Avatar name={session.name} size="medium" />
            <div>
              <p className={element("greeting")}>Olá,</p>
              <p className={element("name")}>{session.name}</p>
            </div>
          </Stack>
        ) : (
          <AriaMenuTrigger>
            <ProfileButton name={session.name} collapse={collapse} />
            <AriaPopover placement="bottom right" offset={8}>
              <Callout
                ariaLabel="Account menu options"
                options={accountCalloutOptions}
                onClickOption={handleAccountCalloutClickOption}
                elevation="large"
              />
            </AriaPopover>
          </AriaMenuTrigger>
        ))}
      {session === null && (
        <LoginButton menuDrawer={menuDrawer} loginHref={loginHref} />
      )}
    </>
  );
};

const BASE_ACCOUNT_CALLOUT_OPTIONS = [
  {
    id: "account",
    text: "Gerir conta",
    icon: <IconUserInterfaceMiscellaneousUser />,
  },
  {
    id: "logout",
    text: "Terminar sessão",
    icon: <IconUserInterfaceMiscellaneousLogout />,
  },
] as const;

const HOST_ACCOUNT_CALLOUT_OPTION = {
  id: "host",
  text: "A minha oferta",
  icon: <IconUserInterfaceMiscellaneousPin />,
} as const;

const ONBOARDING_ACCOUNT_CALLOUT_OPTION = {
  id: "onboarding",
  text: "Torne-se parceiro",
  icon: <IconUserInterfaceMiscellaneousPin />,
} as const;

type AccountCalloutOption =
  | (typeof BASE_ACCOUNT_CALLOUT_OPTIONS)[number]["id"]
  | (typeof HOST_ACCOUNT_CALLOUT_OPTION)["id"]
  | (typeof ONBOARDING_ACCOUNT_CALLOUT_OPTION)["id"];

export const LoginButton = ({
  menuDrawer,
  loginHref,
}: {
  menuDrawer?: boolean;
  loginHref?: string;
}) => {
  return menuDrawer ? (
    <MenuItem
      icon={<IconUserInterfaceMiscellaneousUser />}
      text="Entrar ou registar"
      href={loginHref}
      prefetch={false}
    />
  ) : (
    <Button
      type="secondary-inverted"
      label="Entrar"
      href={loginHref}
      prefetch={false}
    />
  );
};

export default SessionSuspense;
