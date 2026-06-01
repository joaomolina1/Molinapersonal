"use client";

import { CSSProperties, ReactNode } from "react";
import { createBEMClasses } from "@/_utils/classname";
import Stack from "../Stack";
import InputNumber from "../InputNumber";

export type InputCapacityProps = {
  text: string;
  microcopy?: string;
  icon?: ReactNode;
  value?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  info?: string;

  className?: string;
  style?: CSSProperties;
};

const { block, element } = createBEMClasses("input-capacity");

const InputCapacity = ({
  text,
  microcopy,
  icon,
  value,
  onChange,
  disabled,
  readOnly,
  error,
  info,
  className,
  style,
}: InputCapacityProps) => {
  return (
    <label className={block(undefined, className)} style={style}>
      {icon}
      <div className={element("content")}>
        <Stack gap="0.5rem">
          {!!text && (
            <p className={element("text")}>
              {text}
              {readOnly && <> · {value} pessoas</>}
            </p>
          )}
          {!!microcopy && <p className={element("microcopy")}>{microcopy}</p>}
        </Stack>
        {!readOnly && (
          <InputNumber
            label={text}
            showLabel={false}
            value={value}
            onChange={(value) => onChange?.(value ?? 0)}
            disabled={disabled}
            error={error}
            info={info}
            style={{ maxWidth: "9rem" }}
            allowNegative={false}
            decimalScale={0}
            placeholder="0"
          />
        )}
      </div>
    </label>
  );
};

export default InputCapacity;
