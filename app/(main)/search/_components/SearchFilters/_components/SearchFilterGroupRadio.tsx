import Chip from "@/_design_system/Chip";
import Stack from "@/_design_system/Stack";
import { createBEMClasses } from "@/_utils/classname";

import { ReactNode } from "react";

const { block } = createBEMClasses("search-filter-group");

const SearchFilterGroupRadio = <T extends string>({
  label,
  selected = [],
  onChange,
  filters,
}: {
  label: string;
  selected: T[];
  onChange: (selected: T[]) => void;
  filters: readonly {
    id: T;
    icon: ReactNode;
    label: string;
  }[];
}) => {
  const handleFilterClick = (id: T) => {
    if (selected.includes(id)) {
      onChange(selected.filter((selectedId) => selectedId !== id));
    } else {
      onChange([
        ...selected.filter(
          (selectedId) => !filters.find((filter) => filter.id === selectedId),
        ),
        id,
      ]);
    }
  };

  return (
    <Stack gap="1rem" className={block()}>
      <h6>{label}</h6>
      <Stack row gap="0.5rem" flexWrap="wrap">
        {filters.map((filter) => (
          <Chip
            key={filter.id}
            leftIcon={filter.icon}
            label={filter.label}
            checked={selected.includes(filter.id)}
            onChange={() => handleFilterClick(filter.id)}
          />
        ))}
      </Stack>
    </Stack>
  );
};

export default SearchFilterGroupRadio;
