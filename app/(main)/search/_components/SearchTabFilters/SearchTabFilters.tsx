import { ScrollableTabsRadioGroup } from "@/_design_system/Tabs";
import { getGASearchEventData, useSearchContext } from "../../useSearchState";
import { TabFilterKey } from "../../_utils/attributes";
import { usePathname } from "next/navigation";
import { sendGAEvent } from "@next/third-parties/google";
import SkeletonLoader from "@/_design_system/SkeletonLoader";

const SearchTabFilters = () => {
  const search = useSearchContext();
  const pathname = usePathname();

  const { tabFilters, tabFilter, setTabFilter } = search;

  const handleTabFilterSearch = (id: TabFilterKey) => {
    setTabFilter(id);
    sendGAEvent("event", "Rinu_CustomClick", {
      Rinu_ScreenName: pathname,
      Rinu_ItemCategory: "Icon_Most_Wanted",
      ...getGASearchEventData(search),
      Rinu_eLabel8: id,
    });
  };

  if (tabFilters.length === 1) {
    return (
      <div style={{ height: "5rem" }}>
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <ScrollableTabsRadioGroup
      ariaLabel="Filtro de categoria"
      radioGroupName="category-filter"
      options={tabFilters}
      value={tabFilter ?? "all"}
      onChange={handleTabFilterSearch}
    />
  );
};
export default SearchTabFilters;
