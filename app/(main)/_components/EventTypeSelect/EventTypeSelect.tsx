"use client";

/* eslint-disable @typescript-eslint/ban-ts-comment */

import { EventTypeOptions } from "@/(main)/search/_utils/attributes";
import { SpaceEventType } from "@/_constants/space/eventTypes";
import IconUserInterfaceNavigationArrowDown from "@/_design_system/_icons/UserInterface/Navigation/ArrowDown.svg";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { useScrollIntoView } from "@/_utils/scrollIntoView";
import { ReactNode, Ref, useId, useState } from "react";
import ReactSelect, {
  ControlProps,
  components,
  MenuListProps,
  InputProps,
  SelectInstance,
} from "react-select";
import SimpleBar from "simplebar-react";

const { block, element } = createBEMClasses("event-type-select");

type Tab = "popular" | "all";

const POPULAR_OPTIONS = [
  "baptism",
  "wedding",
  "film-setting",
  "conference",
  "corporate-event",
  "birthday",
  "children-birthday",
  "meeting",
  "photo-session",
  "babyshower",
] satisfies SpaceEventType[];

export type EventTypeOption = {
  value: SpaceEventType;
  label: string;
};

const Control = ({ children, ...props }: ControlProps<EventTypeOption>) => {
  const { label } = props.selectProps as unknown as {
    label?: ReactNode;
  };

  return (
    <components.Control {...props}>
      <div className={element("label-value")}>
        {!!label && <span className={element("label")}>{label}</span>}
        {children}
      </div>
      <IconUserInterfaceNavigationArrowDown style={{ fontSize: "1.25rem" }} />
    </components.Control>
  );
};

const MenuList = ({ children, ...props }: MenuListProps<EventTypeOption>) => {
  const { tab, setTab, popularLength, allLength, inputValue } =
    props.selectProps as unknown as {
      tab: Tab;
      setTab: (tab: Tab) => void;
      popularLength: number;
      allLength: number;
      inputValue: string;
    };

  return (
    <components.MenuList {...props}>
      {!inputValue && (
        <div className={element("tabs")}>
          <button
            className={element("tab", { selected: tab === "popular" })}
            onClick={() => setTab("popular")}
          >
            Populares ({popularLength})
          </button>
          <button
            className={element("tab", { selected: tab === "all" })}
            onClick={() => setTab("all")}
          >
            Todos ({allLength})
          </button>
        </div>
      )}
      <SimpleBar
        style={{ maxHeight: inputValue ? 248 : 178 }}
        scrollableNodeProps={{ className: element("options-scroll") }}
      >
        {children}
      </SimpleBar>
    </components.MenuList>
  );
};

const Input = (props: InputProps<EventTypeOption>) => {
  return <components.Input {...props} aria-activedescendant={undefined} />;
};

const EventTypeSelect = ({
  eventTypeOptions,
  eventType,
  setEventType,
  label,
  placeholder,
  invalid,
  ref: refProp,
}: {
  eventTypeOptions: EventTypeOptions;
  eventType: SpaceEventType | null;
  setEventType: (eventType: SpaceEventType | null) => void;
  label?: ReactNode;
  placeholder?: ReactNode;
  invalid?: boolean;
  ref?: Ref<SelectInstance<EventTypeOption>>;
}) => {
  const id = useId();
  const [tab, setTab] = useState<Tab>("popular");
  const [inputValue, setInputValue] = useState("");

  const isMobile = useMediaQuery("large");
  const [ref, scrollIntoView] = useScrollIntoView<HTMLDivElement>();

  const allOptions = eventTypeOptions.map((option) => ({
    value: option.id,
    label: option.text,
  }));

  const popularOptions = allOptions.filter((option) =>
    POPULAR_OPTIONS.find((id) => id === option.value),
  );

  const selectedOption = allOptions.find(
    (option) => option.value === eventType,
  );

  const options = tab === "all" || !!inputValue ? allOptions : popularOptions;

  return (
    <div ref={ref} style={{ scrollMarginTop: "1rem" }}>
      <ReactSelect<EventTypeOption>
        unstyled
        options={options}
        inputValue={inputValue}
        onInputChange={(newValue) => setInputValue(newValue)}
        value={selectedOption}
        onChange={(newOption, action) => {
          if (action.action === "select-option") {
            setEventType(newOption?.value ?? null);

            if (
              !!newOption &&
              !popularOptions.find((option) => newOption.value === option.value)
            ) {
              setTab("all");
            }
          }
        }}
        instanceId={id}
        openMenuOnFocus={!isMobile}
        onFocus={() => {
          if (isMobile) {
            setTimeout(() => scrollIntoView(), 200);
          }
        }}
        menuPlacement="bottom"
        menuPosition="absolute"
        captureMenuScroll={false}
        placeholder={placeholder ?? null}
        classNamePrefix={block()}
        classNames={{
          container: (state) =>
            block({
              focused: state.isFocused,
              "with-value": state.hasValue,
              invalid,
            }),
        }}
        components={{
          Control,
          MenuList,
          Input,
        }}
        noOptionsMessage={({ inputValue }) =>
          `Sem resultados para "${inputValue}"`
        }
        styles={{
          control: () => ({}),
          indicatorsContainer: () => ({ display: "none" }),
          valueContainer: () => ({}),
          option: () => ({}),
          menu: (base) => ({
            ...base,
            width: "15rem",
            top: "calc(100% + 4px)",
            zIndex: 10,
          }),
          menuList: () => ({}),
        }}
        ref={refProp}
        tabSelectsValue={false}
        // @ts-ignore
        label={label}
        tab={tab}
        setTab={setTab}
        popularLength={popularOptions.length}
        allLength={allOptions.length}
      />
    </div>
  );
};

export default EventTypeSelect;
