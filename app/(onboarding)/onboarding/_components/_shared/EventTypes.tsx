import {
  SPACE_EVENT_TYPES,
  SpaceEventType,
} from "@/_constants/space/eventTypes";
import ChipList from "../_shared/ChipList";

const EventTypes = ({
  eventTypes = [],
  setEventTypes,
  error,
  limit = 15,
  subtitle,
}: {
  eventTypes?: SpaceEventType[];
  setEventTypes?: (eventType: SpaceEventType[]) => void;
  error?: string;
  limit?: number;
  subtitle: string;
}) => {
  return (
    <ChipList
      subtitle={subtitle}
      body={`Escolha entre 1 e ${limit} tipos de eventos.`}
      chipLists={SPACE_EVENT_TYPES}
      selected={eventTypes}
      onChange={setEventTypes}
      limit={limit}
      error={error}
    />
  );
};

export default EventTypes;
