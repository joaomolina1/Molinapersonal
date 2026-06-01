"use client";

import { createBEMClasses } from "@/_utils/classname";
import { HighlightsList } from "../useHighlightsList";
import InputText from "@/_design_system/InputText";
import IconUserInterfaceActionsSearch from "@/_design_system/_icons/UserInterface/Actions/Search.svg";
import InputSelect from "@/_design_system/InputSelect";

const { block } = createBEMClasses("admin-highlights-header");

const HighlightsHeader = ({
  highlightsList,
}: {
  highlightsList: HighlightsList;
}) => {
  return (
    <div className={block()}>
      <InputText
        value={highlightsList.query}
        onChange={highlightsList.setQuery}
        label="Pesquisa"
        leftIcon={<IconUserInterfaceActionsSearch />}
      />
      <InputSelect
        value={highlightsList.venue}
        onChange={highlightsList.setVenue}
        label="Local"
        options={highlightsList.venueOptions}
      />
      <InputSelect
        value={highlightsList.space}
        onChange={highlightsList.setSpace}
        label="Espaço"
        options={highlightsList.spaceOptions}
      />
      <InputSelect
        value={highlightsList.mode}
        onChange={highlightsList.setMode}
        label="Zona"
        options={highlightsList.modeOptions}
      />
      <InputSelect
        value={highlightsList.status}
        onChange={highlightsList.setStatus}
        label="Estado"
        options={highlightsList.statusOptions}
      />
    </div>
  );
};

export default HighlightsHeader;
