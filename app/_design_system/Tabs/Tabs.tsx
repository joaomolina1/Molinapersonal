import { createBEMClasses } from "@/_utils/classname";
import { CSSProperties, PropsWithChildren, ReactNode } from "react";
import {
  Tabs as AriaTabs,
  TabList as AriaTabList,
  Tab as AriaTab,
  TabPanel as AriaTabPanel,
} from "react-aria-components";

export type TabsProps<T> = {
  ariaLabel?: string;
  value: T;
  onChange: (value: T) => void;
  tabs: readonly TabProps<T>[];
  disabledTabs?: T[];
  style?: CSSProperties;
  className?: string;
};

export type TabProps<T> = {
  id: T;
  icon: ReactNode;
  label: string;
};

const { block, element } = createBEMClasses("tabs");

function Tabs<T extends string>({
  ariaLabel,
  value,
  onChange,
  tabs,
  disabledTabs,
  style,
  className,
  children,
}: PropsWithChildren<TabsProps<T>>) {
  return (
    <AriaTabs
      selectedKey={value}
      onSelectionChange={(key) => onChange(key as T)}
      disabledKeys={disabledTabs}
    >
      <AriaTabList
        aria-label={ariaLabel}
        className={block(undefined, className)}
        style={style}
      >
        {tabs.map((tab) => (
          <AriaTab id={tab.id} key={tab.id} className={element("tab")}>
            {tab.icon}
            <p>{tab.label}</p>
          </AriaTab>
        ))}
      </AriaTabList>
      {children}
    </AriaTabs>
  );
}

export function TabPanel<T extends string>({
  id,
  children,
}: PropsWithChildren<{ id: T }>) {
  return (
    <AriaTabPanel id={id} className={element("panel")}>
      {children}
    </AriaTabPanel>
  );
}

export default Tabs;
