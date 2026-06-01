import Stack from "@/_design_system/Stack";
import { createBEMClasses } from "@/_utils/classname";
import { ReactNode } from "react";

const { block, element } = createBEMClasses("host-value-with-label");

const ValueWithLabel = ({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) => {
  return (
    <Stack gap="0.125rem" className={block()}>
      <p className={element("label")}>{label}</p>
      <div className={element("value")}>{value}</div>
    </Stack>
  );
};

export default ValueWithLabel;
