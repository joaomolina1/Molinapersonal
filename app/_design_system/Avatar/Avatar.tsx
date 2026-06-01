import { createBEMClasses } from "@/_utils/classname";
import Image from "next/image";

export type AvatarProps = {
  name?: string;
  url?: string;
  size?: "small" | "medium" | "large";
  color?: "white" | "grey";
  imagePosition?: "center" | "top";
};

const { block } = createBEMClasses("avatar");

const Avatar = ({
  name = "",
  url,
  size = "small",
  color = "white",
  imagePosition = "center",
}: AvatarProps) => {
  const names = name.split(" ");
  const first = names.at(0)?.[0];
  const last = names.length > 1 ? names.at(-1)?.[0] : "";

  return (
    <div className={block({ size, color, imagePosition })}>
      {!!url && <Image alt={name} src={url} fill />}
      {!!name && (
        <span>
          {first}
          {last}
        </span>
      )}
    </div>
  );
};

export default Avatar;
