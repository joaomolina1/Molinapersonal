import { createBEMClasses } from "@/_utils/classname";

const { block } = createBEMClasses("counter");

const Counter = ({
  value,
  className,
  variant = "default",
}: {
  value: number;
  className?: string;
  variant?: "default" | "inverted";
}) => {
  return (
    <div className={block({ variant }, className)}>
      <span>{value > 99 ? "+99" : value}</span>
    </div>
  );
};

export default Counter;
