"use client";

import { CSSProperties, PropsWithChildren, ReactNode } from "react";
import { createBEMClasses } from "@/_utils/classname";
import Stack from "../Stack";
import IconUserInterfaceFormsRadio from "../_icons/UserInterface/Forms/Radio.svg";
import IconUserInterfaceFormsCheckbox from "../_icons/UserInterface/Forms/Checkbox.svg";
import { Button as AriaButton } from "react-aria-components";
import IconUserInterfaceNavigationArrowRight from "../_icons/UserInterface/Navigation/ArrowRight.svg";
import IconUserInterfaceMiscellaneousLoading from "../_icons/UserInterface/Miscellaneous/Loading.svg";

export type CardProps = {
  type?: "display" | "checkbox" | "radio" | "button";
  variant?: "default" | "large-icon";
  radioGroupName?: string;
  checked?: boolean;
  onChange?: () => void;
  onClick?: () => void | Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;

  size?: "default" | "large";
  icon?: ReactNode;
  iconAlignment?: "top" | "center";
  text?: string;
  microcopy?: ReactNode;
};

const { block, element } = createBEMClasses("card");

const Card = ({
  type = "display",
  variant = "default",
  radioGroupName,
  checked,
  onChange,
  onClick,
  isLoading,
  disabled,
  className,
  style,
  ...contentProps
}: PropsWithChildren<CardProps>) => {
  if (type === "display") {
    return (
      <div className={block({ type }, className)} style={style}>
        <CardContent {...contentProps} type={type} variant={variant} />
      </div>
    );
  } else if (type === "button") {
    return (
      <AriaButton
        className={block({ type }, className)}
        style={style}
        onPress={() => {
          onClick?.();
        }}
        isDisabled={isLoading}
      >
        <CardContent
          {...contentProps}
          type={type}
          variant={variant}
          isLoading={isLoading}
        />
      </AriaButton>
    );
  } else {
    return (
      <label
        className={block({ type, checked, disabled }, className)}
        style={style}
      >
        <input
          type={type}
          checked={checked}
          onChange={() => onChange?.()}
          disabled={disabled}
          name={radioGroupName}
        />
        <CardContent
          {...contentProps}
          type={type}
          checked={checked}
          variant={variant}
          disabled={disabled}
        />
      </label>
    );
  }
};

const CardContent = ({
  type = "display",
  variant = "default",
  checked,
  isLoading,
  disabled,
  size = "default",
  icon,
  iconAlignment = "top",
  text,
  microcopy,
  children,
}: PropsWithChildren<CardProps>) => {
  if (variant === "large-icon") {
    return (
      <Stack
        gap="1rem"
        className={element("content", { size, checked, variant, disabled })}
      >
        <Stack
          row
          gap="1rem"
          alignItems="flex-start"
          justifyContent="space-between"
        >
          {icon}
          {type === "radio" && (
            <IconUserInterfaceFormsRadio checked={checked} />
          )}
          {type === "checkbox" && (
            <IconUserInterfaceFormsCheckbox checked={checked} />
          )}
          {type === "button" &&
            (isLoading ? (
              <IconUserInterfaceMiscellaneousLoading />
            ) : (
              <IconUserInterfaceNavigationArrowRight />
            ))}
        </Stack>
        <Stack
          gap="0.5rem"
          alignItems="flex-start"
          style={{ textAlign: "left" }}
        >
          {!!text && <p className={element("content__text")}>{text}</p>}
          {!!microcopy && (
            <div className={element("content__microcopy")}>{microcopy}</div>
          )}
          {children}
        </Stack>
      </Stack>
    );
  }

  return (
    <Stack
      row
      gap="1rem"
      alignItems="flex-start"
      justifyContent="space-between"
      className={element("content", { size, checked, variant, disabled })}
    >
      <Stack
        row
        gap="1rem"
        alignItems={iconAlignment === "top" ? "flex-start" : "center"}
      >
        {icon}
        <Stack
          gap="0.5rem"
          alignItems="flex-start"
          style={{ textAlign: "left" }}
        >
          {!!text && <p className={element("content__text")}>{text}</p>}
          {!!microcopy && (
            <div className={element("content__microcopy")}>{microcopy}</div>
          )}
          {children}
        </Stack>
      </Stack>
      {type === "radio" && <IconUserInterfaceFormsRadio checked={checked} />}
      {type === "checkbox" && (
        <IconUserInterfaceFormsCheckbox checked={checked} />
      )}
      {type === "button" &&
        (isLoading ? (
          <IconUserInterfaceMiscellaneousLoading />
        ) : (
          <IconUserInterfaceNavigationArrowRight />
        ))}
    </Stack>
  );
};

export default Card;
