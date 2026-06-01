import Stack from "@/_design_system/Stack";
import { createBEMClasses } from "@/_utils/classname";
import InputText from "@/_design_system/InputText";
import IconUserInterfaceActionsSearch from "@/_design_system/_icons/UserInterface/Actions/Search.svg";
import { useState } from "react";
import SearchFilterSection from "./SearchFilterSection";
import { useSearchContext } from "@/(main)/search/useSearchState";
import { useMediaQuery } from "@/_utils/mediaQuery";

const { block, element } = createBEMClasses("search-filters-list");

const SearchFiltersList = () => {
  const [query, setQuery] = useState("");
  const search = useSearchContext();
  const isMobile = useMediaQuery("large");

  const { attributes, setAttributes, attributeFilters } = search;

  const displayedFilters = query
    ? attributeFilters
        .map((section) => ({
          ...section,
          groups: section.groups
            .map((group) => ({
              ...group,
              filters: group.filters.filter(
                (filter) =>
                  filter.label.toLowerCase().includes(query.toLowerCase()) ||
                  group.label.toLowerCase().includes(query.toLowerCase()) ||
                  section.label.toLowerCase().includes(query.toLowerCase()),
              ),
            }))
            .filter((group) => group.filters.length > 0),
        }))
        .filter((section) => section.groups.length > 0)
    : attributeFilters;

  return (
    <Stack gap={isMobile ? "1rem" : "1.5rem"} className={block()}>
      <InputText
        label="Pesquisar"
        leftIcon={<IconUserInterfaceActionsSearch />}
        className={element("input")}
        value={query}
        onChange={setQuery}
      />
      {displayedFilters.map((section) => (
        <SearchFilterSection
          key={section.label}
          label={section.label}
          groups={section.groups}
          selected={attributes}
          onChange={setAttributes}
        />
      ))}
    </Stack>
  );
};

export default SearchFiltersList;
