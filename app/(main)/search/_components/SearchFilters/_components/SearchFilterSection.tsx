import Stack from "@/_design_system/Stack";
import { createBEMClasses } from "@/_utils/classname";
import { ReactNode, useRef } from "react";
import SearchFilterGroupCheckbox from "./SearchFilterGroupCheckbox";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import {
  getGASearchEventData,
  useSearchContext,
} from "@/(main)/search/useSearchState";
import SearchFilterGroupRadio from "./SearchFilterGroupRadio";

const { block } = createBEMClasses("search-filter-section");

const SearchFilterSection = <T extends string>({
  label,
  selected = [],
  onChange,
  groups,
}: {
  label: string;
  selected: T[];
  onChange: (selected: T[]) => void;
  groups: readonly {
    label: string;
    type: "checkbox" | "radio";
    filters: readonly {
      id: T;
      icon: ReactNode;
      label: string;
    }[];
  }[];
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const search = useSearchContext();
  const pathname = usePathname();

  const handleExpandFilters = (expanded: boolean, groupLabel: string) => {
    const filteredGroups = groups.filter((group) =>
      group.filters.some((filter) => selected.includes(filter.id)),
    );
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: expanded ? "Mostrar mais" : "Mostrar menos",
      Rinu_ItemType: groupLabel,
      ...getGASearchEventData(search),
      Rinu_eLabel7: selected.join(",") || null,
      Rinu_eLabel9:
        filteredGroups.map((group) => group.label).join(",") || null,
    });
  };

  const handleFiltersChange = (selected: T[]) => {
    onChange?.(selected);

    const filteredGroups = groups.filter((group) =>
      group.filters.some((filter) => selected.includes(filter.id)),
    );

    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "filters",
      ...getGASearchEventData(search),
      Rinu_eLabel7: selected.join(",") || null,
      Rinu_eLabel9:
        filteredGroups.map((group) => group.label).join(",") || null,
    });
  };

  return (
    <Stack gap="1rem" className={block()} ref={ref}>
      <Stack gap="0.5rem">
        <h5>{label}</h5>
        <Stack gap="1rem">
          {groups.map((group) =>
            group.type === "checkbox" ? (
              <SearchFilterGroupCheckbox
                key={group.label}
                label={group.label}
                filters={group.filters}
                selected={selected}
                onChange={handleFiltersChange}
                onToggleExpand={handleExpandFilters}
              />
            ) : (
              <SearchFilterGroupRadio
                key={group.label}
                label={group.label}
                filters={group.filters}
                selected={selected}
                onChange={handleFiltersChange}
              />
            ),
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default SearchFilterSection;
