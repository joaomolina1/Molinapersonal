import { createBEMClasses } from "@/_utils/classname";
import { Button as AriaButton } from "react-aria-components";
import Avatar from "../Avatar";
import IconUserInterfaceNavigationArrowDown from "../_icons/UserInterface/Navigation/ArrowDown.svg";
import IconUserInterfaceNavigationArrowUp from "../_icons/UserInterface/Navigation/ArrowUp.svg";

export type ProfileButtonProps = {
  name: string;
  url?: string;
  collapse?: boolean;
};

const { block, element } = createBEMClasses("profile-button");

const ProfileButton = ({ name, url, collapse = false }: ProfileButtonProps) => {
  return (
    <AriaButton className={block()}>
      <Avatar name={name} url={url} size="small" />
      {!collapse && (
        <span className={element("name")}>{name.split(" ")[0]}</span>
      )}
      <IconUserInterfaceNavigationArrowUp />
      <IconUserInterfaceNavigationArrowDown />
    </AriaButton>
  );
};

export default ProfileButton;
