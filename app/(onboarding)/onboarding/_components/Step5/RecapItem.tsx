import Button from "@/_design_system/Button";
import PhotoComponent from "@/_design_system/Photo";
import TextBlock from "@/_design_system/TextBlock";
import IconUserInterfaceActionsEdit from "@/_design_system/_icons/UserInterface/Actions/Edit.svg";
import { Photo } from "@/_models/photo";
import { createBEMClasses } from "@/_utils/classname";
import { PropsWithChildren, ReactNode } from "react";

const { block, element } = createBEMClasses("onboarding-recap__item");

const RecapItem = ({
  label,
  editHref,
  showEditButton,
  children,
}: PropsWithChildren<{
  label: string;
  editHref?: string;
  showEditButton?: boolean;
}>) => {
  return (
    <div className={block()}>
      <TextBlock label={label} />
      {!!editHref && showEditButton && (
        <Button
          type="link"
          leftIcon={<IconUserInterfaceActionsEdit />}
          label="Editar"
          href={editHref}
          className={element("edit")}
        />
      )}
      {!!children && <div className={element("content")}>{children}</div>}
    </div>
  );
};

export const RecapItemText = ({ text }: { text: ReactNode }) => {
  return <p className={element("text")}>{text}</p>;
};

export const RecapItemValue = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  return (
    <div>
      <p className={element("label")}>{label}</p>
      <p className={element("value")}>{value}</p>
    </div>
  );
};

export const RecapItemPhotos = ({ photos }: { photos: Photo[] }) => {
  return (
    <div className={element("photos")}>
      {photos.map((photo, index) => (
        <div key={index} className={element("photos__photo")}>
          <PhotoComponent src={photo.medium} alt="" />
        </div>
      ))}
    </div>
  );
};

export default RecapItem;
