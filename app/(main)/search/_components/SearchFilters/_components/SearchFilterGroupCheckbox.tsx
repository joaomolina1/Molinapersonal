import Button from "@/_design_system/Button";
import InputCheckbox from "@/_design_system/InputCheckbox";
import Stack from "@/_design_system/Stack";
import IconUserInterfaceNavigationArrowDown from "@/_design_system/_icons/UserInterface/Navigation/ArrowDown.svg";
import IconUserInterfaceNavigationArrowUp from "@/_design_system/_icons/UserInterface/Navigation/ArrowUp.svg";
import { createBEMClasses } from "@/_utils/classname";
import { useMediaQuery } from "@/_utils/mediaQuery";

import { ReactNode, useState } from "react";

const { block, element } = createBEMClasses("search-filter-group");

const SearchFilterGroupCheckbox = <T extends string>({
  label,
  selected = [],
  onChange,
  filters,
  onToggleExpand,
}: {
  label: string;
  selected: T[];
  onChange: (selected: T[]) => void;
  filters: readonly {
    id: T;
    icon: ReactNode;
    label: string;
  }[];
  onToggleExpand?: (expanded: boolean, groupLabel: string) => void;
}) => {
  const isMobile = useMediaQuery("large");
  const [expanded, setExpanded] = useState(false);

  const FILTER_CUTOFF = isMobile ? 4 : 6;

  const displayedFilters = expanded ? filters : filters.slice(0, FILTER_CUTOFF);

  const handleFilterClick = (id: T, checked: boolean) => {
    if (!checked) {
      onChange?.(selected.filter((item) => item !== id));
    } else if (checked && !selected.includes(id)) {
      onChange?.([...selected, id]);
    }
  };

  const handleToggleExpand = () => {
    setExpanded(!expanded);
    onToggleExpand?.(!expanded, label);
  };

  return (
    <Stack gap="1rem" className={block()}>
      <h6>{label}</h6>
      <div className={element("items")}>
        {displayedFilters.map((filter) => (
          <Stack
            key={filter.id}
            row
            justifyContent="space-between"
            alignItems="center"
          >
            <InputCheckbox
              className={element("checkbox")}
              label={
                <Stack row gap="0.5rem" alignItems="center">
                  {filter.icon}
                  {filter.label}
                </Stack>
              }
              checked={selected.includes(filter.id)}
              onChange={(checked) => handleFilterClick(filter.id, checked)}
              position="right"
            />
          </Stack>
        ))}
      </div>
      {filters.length > FILTER_CUTOFF && (
        <Button
          type="link"
          label={expanded ? "Mostrar menos" : "Mostrar mais"}
          leftIcon={
            expanded ? (
              <IconUserInterfaceNavigationArrowUp />
            ) : (
              <IconUserInterfaceNavigationArrowDown />
            )
          }
          className={element("show-more")}
          onClick={handleToggleExpand}
        />
      )}
    </Stack>
  );
};

export default SearchFilterGroupCheckbox;
