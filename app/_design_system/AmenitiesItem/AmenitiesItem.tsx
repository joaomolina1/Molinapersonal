import { ReactNode } from "react";
import Stack from "../Stack";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";

type AmenitiesItemProps = {
  icon?: ReactNode;
  label: ReactNode;
  iconSize?: "small" | "large";
  textSize?: "small" | "large";
  className?: string;
};

const { block } = createBEMClasses("amenities-item");

const AmenitiesItem = ({
  icon,
  label,
  iconSize = "large",
  textSize,
  className,
}: AmenitiesItemProps) => {
  const isMobile = useMediaQuery("large");

  return (
    <Stack
      row
      gap="8px"
      flexWrap="nowrap"
      className={block(
        {
          "icon-size": iconSize,
          "text-size": textSize ?? (isMobile ? "small" : "large"),
        },
        className,
      )}
    >
      {icon}
      <div>{label}</div>
    </Stack>
  );
};

const { block: listBlock } = createBEMClasses("amenities-list");

type AmenitiesListProps = {
  iconSize?: "small" | "large";
  textSize?: "small" | "large";
  items: Exclude<AmenitiesItemProps, "size">[];
};

export const AmenitiesList = ({
  iconSize = "large",
  textSize,
  items,
}: AmenitiesListProps) => {
  return (
    <div className={listBlock()}>
      {items.map((item, index) => (
        <AmenitiesItem
          key={index}
          iconSize={iconSize}
          textSize={textSize}
          label={item.label}
          icon={item.icon}
        />
      ))}
    </div>
  );
};

export default AmenitiesItem;
