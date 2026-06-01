import { useSearchContext } from "../../useSearchState";
import { Button as AriaButton } from "react-aria-components";
import { createBEMClasses } from "@/_utils/classname";
import { useState } from "react";
import Modal from "@/_design_system/Modal";
import { useMediaQuery } from "@/_utils/mediaQuery";
import { HeroSearch } from "@/(main)/_components/HeroBanner/HeroSearch";
import { getDateTimeRangeValueText } from "@/_design_system/InputDateTimeRange";
import Tooltip from "@/_design_system/Tooltip";
import { formatInt } from "@/_utils/number";
import IconUserInterfaceActionsSearch from "@/_design_system/_icons/UserInterface/Actions/Search.svg";

const { block: triggerBlock, element: triggerElement } = createBEMClasses(
  "hero-search-mobile-trigger",
);
const { block: modalBlock } = createBEMClasses("hero-search-mobile-modal");

const HeroSearchMobile = ({
  showDateStartEndTooltip,
}: {
  showDateStartEndTooltip?: boolean;
}) => {
  const isMobile = useMediaQuery("large");
  const search = useSearchContext();

  const [isOpen, setIsOpen] = useState(false);

  if (!isMobile) {
    return null;
  }

  return (
    <>
      {showDateStartEndTooltip ? (
        <Tooltip
          content="Clique aqui para escolher a data e hora do seu evento"
          visible
          visibleOnTouchDevice
          style={{ zIndex: 0 }}
          placement="bottom"
        >
          <HeroSearchMobileTrigger setIsOpen={setIsOpen} />
        </Tooltip>
      ) : (
        <HeroSearchMobileTrigger setIsOpen={setIsOpen} />
      )}
      <Modal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        ariaLabel="Pesquisa"
        className={modalBlock()}
        width="medium"
        mobileHeight="almost-fullscreen"
        mobileIgnoreKeyboard
      >
        <HeroSearch
          mode="modal"
          onSearchDone={() => setIsOpen(false)}
          initialSearchState={search}
        />
      </Modal>
    </>
  );
};

const HeroSearchMobileTrigger = ({
  setIsOpen,
}: {
  setIsOpen: (isOpen: boolean) => void;
}) => {
  const search = useSearchContext();

  const eventTypeText =
    search.eventTypeOptions.find(({ id }) => id === search.eventType)?.text ??
    "O que está a planear?";
  const cityText = search.city ?? "Onde?";
  const dateStartEndText =
    getDateTimeRangeValueText({
      date: search.date,
      start: search.start,
      end: search.end,
    }) ?? "Qualquer altura";
  const numPeopleText = search.numPeopleDebounced
    ? `${formatInt(search.numPeopleDebounced)} ${
        search.numPeopleDebounced === 1 ? "pessoa" : "pessoas"
      }`
    : undefined;

  return (
    <AriaButton className={triggerBlock()} onPress={() => setIsOpen(true)}>
      <div className={triggerElement("content")}>
        <p className={triggerElement("event-city")}>
          {eventTypeText} · {cityText}
        </p>
        <p className={triggerElement("date-start-end-num-people")}>
          {dateStartEndText}
          {!!numPeopleText && <> · {numPeopleText}</>}
        </p>
      </div>
      <div className={triggerElement("icon")}>
        <IconUserInterfaceActionsSearch />
      </div>
    </AriaButton>
  );
};

export default HeroSearchMobile;
