import { DropZone, FileTrigger } from "react-aria-components";
import type { DropEvent } from "@react-types/shared";

import { createBEMClasses } from "@/_utils/classname";
import IllustrationPhotoUpload from "../_illustrations/PhotoUpload.svg";
import Button from "../Button";
import PhotoComponent from "../Photo";
import IconUserInterfaceActionsCoverPhoto from "../_icons/UserInterface/Actions/CoverPhoto.svg";
import IconUserInterfaceActionsDelete from "../_icons/UserInterface/Actions/Delete.svg";
import IconUserInterfaceActionsMoveLeft from "../_icons/UserInterface/Actions/MoveLeft.svg";
import IconUserInterfaceActionsMoveRight from "../_icons/UserInterface/Actions/MoveRight.svg";
import { Photo, useCreatePhoto } from "@/_models/photo";
import { isNotNil } from "@/_utils/filter";
import { useState } from "react";
import { InputError } from "../_utils/InputWrapper";
import Stack from "../Stack";

const { block, element } = createBEMClasses("photo-upload");

const acceptedFileTypes = ["image/jpeg", "image/png", "image/webp"];

const PhotoUpload = ({
  photos = [],
  onChangePhotos,
  onDelete,
  max,
  minDimensions,
  showFirstAsCover,
  invalid,
}: {
  photos?: Photo[];
  onChangePhotos?: (photos: Photo[]) => void;
  onDelete?: (photo: Photo) => void;
  max: number;
  minDimensions?: {
    width: number;
    height: number;
  };
  showFirstAsCover?: boolean;
  invalid?: boolean;
}) => {
  const { mutateAsync: createPhoto } = useCreatePhoto();

  const [error, setError] = useState("");

  const handleUpload = async (files: File[]) => {
    setError("");

    let filesToUpload = files;

    if (minDimensions) {
      const filesWithDimensions = await Promise.all(
        files.map(async (file) => ({
          file: file,
          dimensions: await getDimensions(file),
        })),
      );

      filesToUpload = filesWithDimensions
        .filter(
          ({ dimensions }) =>
            dimensions.width >= minDimensions.width &&
            dimensions.height >= minDimensions.height,
        )
        .map(({ file }) => file);

      if (filesToUpload.length < files.length) {
        setError(
          files.length - filesToUpload.length === 1
            ? `Uma das images que colocou não tem a dimensão minima exigida (${minDimensions.width}x${minDimensions.height})`
            : `Algumas das images que colocou não têm a dimensão minima exigida (${minDimensions.width}x${minDimensions.height})`,
        );
      }
    }

    filesToUpload = filesToUpload.slice(0, Math.max(max - photos.length, 0));

    const newPhotos = (
      await Promise.all(
        filesToUpload.map(async (file) => {
          try {
            const medium = await createPhoto({ file: file });

            return medium;
          } catch (e) {
            console.error("Error uploading", file.name, ":", e);

            return undefined;
          }
        }),
      )
    ).filter(isNotNil);

    onChangePhotos?.([...photos, ...newPhotos]);
  };

  return (
    <Stack gap="0.5rem">
      <div className={block({ grid: photos.length > 0 })}>
        <PhotoPreviews
          photos={photos}
          onChangePhotos={onChangePhotos}
          onDelete={onDelete}
          showFirstAsCover={showFirstAsCover}
        />
        {photos.length < max && (
          <PhotoUploadZone
            emptyState={photos.length === 0}
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

const getDimensions = (file: File) => {
  return new Promise<{ width: number; height: number }>((resolve) => {
    const img = new Image();
    img.onload = () =>
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = URL.createObjectURL(file);
  });
};

const PhotoPreviews = ({
  photos = [],
  onChangePhotos,
  onDelete,
  showFirstAsCover,
}: {
  photos?: Photo[];
  onChangePhotos?: (photos: Photo[]) => void;
  onDelete?: (photo: Photo) => void;
  showFirstAsCover?: boolean;
}) => {
  const handleCalloutOptionClick = (index: number, id: PhotoCalloutOption) => {
    const currentPhotos = [...photos];

    const fileToHandle = currentPhotos.splice(index, 1)[0];

    let toIndex: number;

    switch (id) {
      case "delete":
        onChangePhotos?.(currentPhotos);
        onDelete?.(fileToHandle);
        return;
      case "move-left":
        toIndex = index - 1;
        break;
      case "move-right":
        toIndex = index + 1;
        break;
      case "use-as-cover-photo":
        toIndex = 0;
        break;
    }

    currentPhotos.splice(toIndex, 0, fileToHandle);

    onChangePhotos?.(currentPhotos);
  };

  return photos.map((photo, index) => (
    <div
      key={photo.id}
      className={element("preview", {
        cover: index === 0 && showFirstAsCover,
      })}
    >
      <PhotoComponent
        src={photo.medium}
        alt=""
        tag={
          index === 0 && showFirstAsCover ? { text: "Foto de capa" } : undefined
        }
        calloutOptions={photoCalloutOptions.filter(({ id }) => {
          const forbidden = [];

          if (index === 0) forbidden.push("use-as-cover-photo", "move-left");
          if (index === photos.length - 1) forbidden.push("move-right");
          if (!showFirstAsCover) forbidden.push("use-as-cover-photo");

          return !forbidden.includes(id);
        })}
        onClickCalloutOption={(id) => handleCalloutOptionClick(index, id)}
      />
    </div>
  ));
};

const PhotoUploadZone = ({
  emptyState,
  onUpload,
  max,
  invalid,
}: {
  emptyState: boolean;
  onUpload?: (photos: File[]) => Promise<void>;
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
      aria-label="Carregamento de fotografias"
      className={element("upload", { error: invalid })}
      onDrop={(e) => {
        handleDropEvent(e);
      }}
      getDropOperation={(types) =>
        acceptedFileTypes.some((type) => types.has(type)) ? "copy" : "cancel"
      }
    >
      <FileTrigger
        onSelect={handleSelectEvent}
        allowsMultiple
        acceptedFileTypes={acceptedFileTypes}
      >
        {emptyState && (
          <>
            <div className={element("upload__icon")}>
              <IllustrationPhotoUpload />
            </div>
            <span className={element("upload__drag")}>
              {max === 1
                ? "Arraste para aqui"
                : "Arraste as suas fotografias para aqui"}
              <br />
              ou
            </span>
          </>
        )}

        <Button
          type="secondary"
          label={emptyState ? "Procurar fotografias" : "Adicionar mais"}
        />

        {emptyState && max > 1 && (
          <span className={element("upload__limit")}>
            Escolha até {max} fotografias
          </span>
        )}
      </FileTrigger>
    </DropZone>
  );
};

const photoCalloutOptions = [
  {
    id: "use-as-cover-photo",
    icon: <IconUserInterfaceActionsCoverPhoto />,
    text: "Usar como foto de capa",
  },
  {
    id: "move-left",
    icon: <IconUserInterfaceActionsMoveLeft />,
    text: "Mover para a esquerda",
  },
  {
    id: "move-right",
    icon: <IconUserInterfaceActionsMoveRight />,
    text: "Mover para a direita",
  },
  {
    id: "delete",
    icon: <IconUserInterfaceActionsDelete />,
    text: "Eliminar",
  },
] as const;

type PhotoCalloutOption = (typeof photoCalloutOptions)[number]["id"];

export default PhotoUpload;
