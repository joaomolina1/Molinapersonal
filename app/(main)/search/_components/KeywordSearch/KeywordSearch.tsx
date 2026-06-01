import { createBEMClasses } from "@/_utils/classname";

import { useAttributes } from "@/_models/search";
import { allAttributeFiltersFlat } from "../../_utils/attributes";
import CreatableSelect from "react-select/creatable";
import { components, ControlProps, MultiValueProps } from "react-select";
import IconUserInterfaceActionsSearch from "@/_design_system/_icons/UserInterface/Actions/Search.svg";
import Stack from "@/_design_system/Stack";
import { SPACE_EVENT_TYPES_FLAT } from "@/_constants/space/eventTypes";
import { SPACE_CATEGORIES_FLAT } from "@/_constants/space/categories";
import { useSearchContext } from "../../useSearchState";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";

const { block, element } = createBEMClasses("keyword-search-input");

type Option = { value: string; label: string };

const Control = ({ children, ...props }: ControlProps<Option>) => {
  return (
    <components.Control {...props}>
      <IconUserInterfaceActionsSearch style={{ fontSize: "1.25rem" }} />
      {children}
    </components.Control>
  );
};

const MultiValue = ({ children, ...props }: MultiValueProps<Option>) => {
  return (
    <Stack row flexWrap="nowrap" gap="0.5ch" style={{ minWidth: 0 }}>
      <components.MultiValue {...props}>{children}</components.MultiValue>
      <span>,</span>
    </Stack>
  );
};

export const ALL_KEYWORD_OPTIONS = [
  ...SPACE_EVENT_TYPES_FLAT,
  ...SPACE_CATEGORIES_FLAT,
  ...allAttributeFiltersFlat,
]
  .map(({ id, label }) => ({ value: id, label }))
  .sort((a, b) => a.label.localeCompare(b.label));

const KeywordSearch = () => {
  const { keywords, setKeywords } = useSearchContext();
  const pathname = usePathname();
  const { data: availableAttributes = [] } = useAttributes();

  const options = ALL_KEYWORD_OPTIONS.filter((option) =>
    availableAttributes.includes(option.value),
  );

  return (
    <CreatableSelect
      unstyled
      isMulti
      value={keywords.map(
        (keyword) =>
          ALL_KEYWORD_OPTIONS.find((option) => option.value === keyword) ?? {
            value: keyword,
            label: keyword,
          },
      )}
      onChange={(newValue) => {
        setKeywords(newValue.map(({ value }) => value));
        sendGAEvent("event", "Rinu_CustomClick", {
          Rinu_ScreenName: pathname,
          Rinu_ItemCategory: "keyword_search",
          Rinu_eLabel1: newValue.map(({ label }) => label),
        });
      }}
      options={options}
      className={block()}
      classNamePrefix={block()}
      components={{
        Control,
        MultiValue,
      }}
      styles={{
        control: () => ({}),
        indicatorsContainer: () => ({ display: "none" }),
        multiValueRemove: () => ({ display: "none" }),
        option: () => ({}),
        menu: (base) => ({
          ...base,
          top: "calc(100% + 8px)",
          zIndex: 10,
        }),
      }}
      classNames={{
        control: (state) =>
          element("control", {
            focused: state.isFocused,
          }),
        multiValue: (state) =>
          element("multi-value", {
            focused: state.isFocused,
          }),
      }}
      placeholder="Pesquisar por palavras-chave..."
      formatCreateLabel={(inputValue) => `Pesquisar "${inputValue}"`}
      tabSelectsValue={false}
    />
  );
};

export default KeywordSearch;
