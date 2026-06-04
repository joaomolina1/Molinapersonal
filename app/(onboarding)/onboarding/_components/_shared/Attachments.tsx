import Alert from "@/_design_system/Alert";
import AttachmentUpload from "@/_design_system/AttachmentUpload";
import Stack from "@/_design_system/Stack";
import StackHalfHalf from "@/_design_system/StackHalfHalf";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceMiscellaneousTip from "@/_design_system/_icons/UserInterface/Miscellaneous/Tip.svg";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { Attachment } from "@/_models/attachment";
import { ReactNode } from "react";

const Attachments = ({
  attachments,
  setAttachments,
  max,
  subtitle,
  body,
  tip,
  error,
}: {
  attachments?: Attachment[];
  setAttachments?: (files: Attachment[]) => void;
  max: number;
  subtitle: string;
  body: string;
  tip?: ReactNode;
  error?: string;
}) => {
  return (
    <Stack gap="16px">
      <TextBlock subtitle={subtitle} body={body} />
      {error && <InputError error={error} />}
      <StackHalfHalf reverse={!!tip} rightEmpty={!tip}>
        {!!tip && (
          <Alert
            icon={<IconUserInterfaceMiscellaneousTip />}
            title="Dica"
            text={tip}
          />
        )}
        <AttachmentUpload
          attachments={attachments}
          onChangeAttachments={setAttachments}
          max={max}
          invalid={!!error}
        />
      </StackHalfHalf>
    </Stack>
  );
};

export default Attachments;
