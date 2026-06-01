import Alert from "@/_design_system/Alert";
import InputText from "@/_design_system/InputText";
import Stack from "@/_design_system/Stack";
import StackHalfHalf from "@/_design_system/StackHalfHalf";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceMiscellaneousTip from "@/_design_system/_icons/UserInterface/Miscellaneous/Tip.svg";
import { PropsWithChildren } from "react";

const Name = ({
  name,
  setName,
  label,
  ariaLabel,
  maxChars = 32,
  tip,
  error,
  children,
}: PropsWithChildren<{
  name?: string;
  setName?: (name: string) => void;
  label: string;
  ariaLabel: string;
  maxChars?: number;
  tip?: string;
  error?: string;
}>) => {
  return (
    <Stack gap="16px">
      <div className="hide-desktop-large">
        <TextBlock label={label} />
      </div>
      <div className="hide-mobile-large">
        <TextBlock subtitle={label} />
      </div>
      <StackHalfHalf rightEmpty={!tip} reverse={!!tip}>
        {tip && (
          <Alert
            icon={<IconUserInterfaceMiscellaneousTip />}
            title="Dica"
            text={tip}
          />
        )}
        <Stack gap="1rem">
          <InputText
            label={ariaLabel}
            showLabel={false}
            value={name}
            onChange={(value) => value.length <= maxChars && setName?.(value)}
            info={`${name?.length ?? 0}/${maxChars}`}
            error={error}
          />
          {children}
        </Stack>
      </StackHalfHalf>
    </Stack>
  );
};

export default Name;
