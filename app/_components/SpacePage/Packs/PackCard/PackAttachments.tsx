import { TextButton } from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import { Attachment, useAttachments } from "@/_models/attachment";
import { Pack } from "@/_models/pack";
import { createBEMClasses } from "@/_utils/classname";

const { element } = createBEMClasses("client-pack-card");

const PackAttachments = ({ pack }: { pack: Pack }) => {
  const { data: attachments = [] } = useAttachments(
    pack.attachmentIDs?.length ? pack.attachmentIDs : undefined,
  );

  if (!attachments.length) {
    return null;
  }

  return (
    <Stack gap="0.75rem" className={element("attachments")}>
      <p className={element("attachments__title")}>Anexos</p>
      <ul className={element("attachments__list")}>
        {attachments.map((attachment) => (
          <PackAttachmentItem key={attachment.id} attachment={attachment} />
        ))}
      </ul>
    </Stack>
  );
};

const PackAttachmentItem = ({ attachment }: { attachment: Attachment }) => {
  return (
    <li className={element("attachments__item")}>
      <TextButton
        text={attachment.filename}
        href={attachment.url}
        target="_blank"
      />
    </li>
  );
};

export default PackAttachments;
