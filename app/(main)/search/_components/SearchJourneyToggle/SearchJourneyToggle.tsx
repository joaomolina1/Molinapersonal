"use client";

import { TabsRadioGroup } from "@/_design_system/Tabs";
import IconUserInterfaceMiscellaneousVenues from "@/_design_system/_icons/UserInterface/Miscellaneous/Venues.svg";
import IconUserInterfaceMiscellaneousPacks from "@/_design_system/_icons/UserInterface/Miscellaneous/Packs.svg";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname } from "next/navigation";
import { useSearchContext } from "../../useSearchState";

const JOURNEY_OPTIONS = [
  {
    id: "venues" as const,
    label: "Espaços",
    icon: <IconUserInterfaceMiscellaneousVenues />,
  },
  {
    id: "services" as const,
    label: "Serviços",
    icon: <IconUserInterfaceMiscellaneousPacks />,
  },
];

const SearchJourneyToggle = () => {
  const pathname = usePathname();
  const { journey, setJourney } = useSearchContext();

  return (
    <TabsRadioGroup
      ariaLabel="Procurar espaços ou serviços"
      radioGroupName="search-journey"
      options={JOURNEY_OPTIONS}
      value={journey}
      onChange={(newJourney) => {
        setJourney(newJourney);
        sendGAEvent("event", "Rinu_CustomClick", {
          Rinu_ScreenName: pathname,
          Rinu_ItemCategory: "Standard",
          Rinu_ItemType: "search_journey_toggle",
          Rinu_eLabel1: newJourney,
        });
      }}
    />
  );
};

export default SearchJourneyToggle;
