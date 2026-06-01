import { createBEMClasses } from "@/_utils/classname";

type SkeletonLoaderProps = {
  type?: "default" | "text" | "button";
};

const { block } = createBEMClasses("skeleton-loader");

const SkeletonLoader = ({ type = "default" }: SkeletonLoaderProps) => {
  return <div className={block({ type })}>{type === "text" && <p>_</p>}</div>;
};

export default SkeletonLoader;
