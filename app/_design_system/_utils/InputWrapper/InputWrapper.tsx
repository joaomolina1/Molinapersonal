import Stack from "@/_design_system/Stack";
import IconUserInterfaceFormsErrorAlert from "@/_design_system/_icons/UserInterface/Forms/ErrorAlert.svg";
import { createBEMClasses } from "@/_utils/classname";
import { CSSProperties, ReactNode } from "react";

const { block, element } = createBEMClasses("input-wrapper");

const InputWrapper = ({
  info,
  error,
  className,
  style,
  children,
}: {
  info?: string;
  error?: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) => (
  <Stack gap="0.5rem" className={block({}, className)} style={style}>
    <div>{children}</div>
    {!!info && <span className={element("info")}>{info}</span>}
    {!!error && <InputError error={error} />}
  </Stack>
);

export const InputError = ({ error }: { error: string }) => (
  <Stack className={element("error")} row gap="0.25rem">
    <IconUserInterfaceFormsErrorAlert />
    <span>{error}</span>
  </Stack>
);

export default InputWrapper;
