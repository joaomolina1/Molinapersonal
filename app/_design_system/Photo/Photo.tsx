import Image from "next/image";
import { MenuTrigger, Popover } from "react-aria-components";

import { createBEMClasses } from "@/_utils/classname";
import IconUserInterfaceNavigationMenuHorizontal from "../_icons/UserInterface/Navigation/MenuHorizontal.svg";
import Callout, { CalloutOption } from "../Callout";
import Tag, { TagProps } from "../Tag";
import Stack from "../Stack";
import { NavButton } from "../Button";

export type PhotoProps<T> = {
  src: string;
  alt: string;

  tag?: TagProps;

  calloutOptions?: CalloutOption<T>[];
  onClickCalloutOption?: (id: T) => void;

  className?: string;
};

const { block, element } = createBEMClasses("photo");

function Photo<T extends string>({
  src,
  alt,
  tag,
  calloutOptions,
  onClickCalloutOption,
  className,
}: PhotoProps<T>) {
  return (
    <div className={block({}, className)}>
      <Image alt={alt} src={src} fill />
      <Stack row gap="1rem" alignItems="center" className={element("overlay")}>
        {!!tag && <Tag {...tag} size="small" border={false} />}
        {!!calloutOptions &&
          !!onClickCalloutOption &&
          calloutOptions.length > 0 && (
            <MenuTrigger>
              <NavButton
                ariaLabel="Menu de fotografia"
                icon={<IconUserInterfaceNavigationMenuHorizontal />}
              />
              <Popover placement="bottom right" crossOffset={20}>
                <Callout
                  ariaLabel="Opções do menu de fotografia"
                  options={calloutOptions}
                  onClickOption={onClickCalloutOption}
                />
              </Popover>
            </MenuTrigger>
          )}
      </Stack>
    </div>
  );
}

export default Photo;
