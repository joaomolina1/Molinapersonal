import { DropZone, FileTrigger } from "react-aria-components";
import type { DropEvent } from "@react-types/shared";

import { createBEMClasses } from "@/_utils/classname";
import IllustrationPhotoUpload from "../_illustrations/PhotoUpload.svg";
import Button, { IconButton } from "../Button";
import IconUserInterfaceActionsDelete from "../_icons/UserInterface/Actions/Delete.svg";
import {
  Attachment,
  useCreateAttachment,
  useDeleteAttachment,
} from "@/_models/attachment";
import { isNotNil } from "@/_utils/filter";
import { useState } from "react";
import { InputError } from "../_utils/InputWrapper";
import Stack from "../Stack";

const { block, element } = createBEMClasses("attachment-upload");

const AttachmentUpload = ({
  attachments = [],
  onChangeAttachments,
  max,
  invalid,
}: {
  attachments?: Attachment[];
  onChangeAttachments?: (attachments: Attachment[]) => void;
  max: number;
  invalid?: boolean;
}) => {
  const { mutateAsync: createAttachment } = useCreateAttachment();
  const { mutateAsync: deleteAttachment } = useDeleteAttachment();

  const [error, setError] = useState("");

  const handleUpload = async (files: File[]) => {
    setError("");

    const filesToUpload = files.slice(
      0,
      Math.max(max - attachments.length, 0),
    );

    const newAttachments = (
      await Promise.all(
        filesToUpload.map(async (file) => {
          try {
            return await createAttachment({ file });
          } catch (e) {
            console.error("Error uploading", file.name, ":", e);
            return undefined;
          }
        }),
      )
    ).filter(isNotNil);

    if (newAttachments.length < filesToUpload.length) {
      setError("Não foi possível carregar um ou mais ficheiros.");
    }

    onChangeAttachments?.([...attachments, ...newAttachments]);
  };

  const handleDelete = async (attachment: Attachment) => {
    onChangeAttachments?.(
      attachments.filter(({ id }) => id !== attachment.id),
    );

    try {
      await deleteAttachment(attachment.id);
    } catch (e) {
      console.error("Error deleting attachment", attachment.id, ":", e);
    }
  };

  return (
    <Stack gap="0.5rem">
      <div className={block({ grid: true })}>
        {attachments.map((attachment) => (
          <div key={attachment.id} className={element("item")}>
            <span className={element("item__name")} title={attachment.filename}>
              {attachment.filename}
            </span>
            <IconButton
              className={element("item__delete")}
              ariaLabel={`Eliminar ${attachment.filename}`}
              icon={<IconUserInterfaceActionsDelete />}
              onClick={() => handleDelete(attachment)}
            />
          </div>
        ))}
        {attachments.length < max && (
          <AttachmentUploadZone
            emptyState={attachments.length === 0}
            onUpload={handleUpload}
            max={max}
            invalid={invalid || !!error}
          />
        )}
      </div>
      {!!error && <InputError error={error} />}
    </Stack>
  );
};

const AttachmentUploadZone = ({
  emptyState,
  onUpload,
  max,
  invalid,
}: {
  emptyState: boolean;
  onUpload?: (files: File[]) => Promise<void>;
  max: number;
  invalid?: boolean;
}) => {
  const handleDropEvent = async (e: DropEvent) => {
    const files = await Promise.all(
      e.items
        .filter((item) => item.kind === "file")
        .map(async (item) => await item.getFile()),
    );

    if (files.length) {
      onUpload?.(files);
    }
  };

  const handleSelectEvent = (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);

    if (files.length) {
      onUpload?.(files);
    }
  };

  return (
    <DropZone
      aria-label="Carregamento de anexos"
      className={element("upload", { error: invalid })}
      onDrop={(e) => {
        handleDropEvent(e);
      }}
      getDropOperation={() => "copy"}
    >
      <FileTrigger onSelect={handleSelectEvent} allowsMultiple>
        {emptyState && (
          <>
            <div className={element("upload__icon")}>
              <IllustrationPhotoUpload />
            </div>
            <span className={element("upload__drag")}>
              Arraste os seus ficheiros para aqui
              <br />
              ou
            </span>
          </>
        )}

        <Button
          type="secondary"
          label={emptyState ? "Procurar ficheiros" : "Adicionar mais"}
        />

        {emptyState && (
          <span className={element("upload__limit")}>
            Escolha até {max} ficheiros
          </span>
        )}
      </FileTrigger>
    </DropZone>
  );
};

export default AttachmentUpload;
