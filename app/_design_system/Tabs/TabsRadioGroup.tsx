import { createBEMClasses } from "@/_utils/classname";
import { ReactNode } from "react";

export type TabsRadioGroupProps<T> = {
  ariaLabel: string;
  value?: T;
  onChange: (id: T) => void;
  radioGroupName: string;
  options: readonly {
    id: T;
    icon: ReactNode;
    label: string;
  }[];
  className?: string;
};

const { block, element } = createBEMClasses("tabs-radio-group");

const TabsRadioGroup = <T extends string>({
  ariaLabel,
  value,
  onChange,
  radioGroupName,
  options,
  className,
}: TabsRadioGroupProps<T>) => {
  return (
    <div aria-label={ariaLabel} className={block(undefined, className)}>
      {options.map((option) => (
        <label className={element("option")} key={option.id}>
          <input
            type="radio"
            checked={option.id === value}
            onChange={() => onChange(option.id)}
            name={radioGroupName}
          />
          <div className={element("option__content")}>
            {option.icon}
            <p>{option.label}</p>
          </div>
        </label>
      ))}
    </div>
  );
};

export default TabsRadioGroup;
