import Alert from "@/_design_system/Alert";
import InputTextArea from "@/_design_system/InputTextArea";
import Stack from "@/_design_system/Stack";
import StackHalfHalf from "@/_design_system/StackHalfHalf";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceMiscellaneousTip from "@/_design_system/_icons/UserInterface/Miscellaneous/Tip.svg";
import { ReactNode } from "react";

const Description = ({
  description,
  setDescription,
  subtitle,
  label,
  body,
  tip,
  ariaLabel,
  maxChars,
  minChars,
  error,
}: {
  description?: string;
  setDescription?: (description: string) => void;
  subtitle: string;
  label?: string;
  body?: string;
  tip?: ReactNode;
  ariaLabel: string;
  maxChars: number;
  minChars: number;
  error?: string;
}) => {
  return (
    <Stack gap="16px">
      <TextBlock subtitle={subtitle} label={label} body={body} />
      <StackHalfHalf reverse>
        {tip && (
          <Alert
            icon={<IconUserInterfaceMiscellaneousTip />}
            title="Dica"
            text={tip}
          />
        )}
        <InputTextArea
          label={ariaLabel}
          value={description}
          onChange={(value) =>
            value.length <= maxChars && setDescription?.(value)
          }
          info={`${description?.length ?? 0}/${maxChars} (Mín. ${minChars})`}
          error={error}
        />
      </StackHalfHalf>
    </Stack>
  );
};

export default Description;
