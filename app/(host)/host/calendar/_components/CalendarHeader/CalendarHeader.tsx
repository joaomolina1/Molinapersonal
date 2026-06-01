"use client";

import InputSelect from "@/_design_system/InputSelect";
import Stack from "@/_design_system/Stack";
import { createBEMClasses } from "@/_utils/classname";
import { CalendarList } from "../useCalendarList";
import InputWeek from "@/_design_system/InputWeek";

const { block, element } = createBEMClasses("host-calendar-header");

const CalendarHeader = ({ calendarList }: { calendarList: CalendarList }) => {
  return (
    <div className={block()}>
      <div className={element("filters")}>
        <InputSelect
          value={calendarList.venue}
          onChange={calendarList.setVenue}
          label="Local ou empresa"
          options={calendarList.venueOptions}
        />
        <InputSelect
          value={calendarList.space}
          onChange={calendarList.setSpace}
          label="Espaço ou serviço"
          options={calendarList.spaceOptions}
        />
        <InputWeek
          value={calendarList.baseDate}
          onChange={calendarList.setBaseDate}
          weekSpan={calendarList.weekSpan.length}
          label="Data início - Data fim"
        />
      </div>
      <div className={element("legend")}>
        <CalendarLegend status="booked" />
        <CalendarLegend status="free" />
        <CalendarLegend status="blocked" />
      </div>
    </div>
  );
};

const CalendarLegend = ({
  status,
}: {
  status: "free" | "blocked" | "booked";
}) => {
  return (
    <Stack row gap="0.5rem" alignItems="center">
      <div className={element("legend__color", { status })} />
      <p>{STATUS_LABELS[status]}</p>
    </Stack>
  );
};

const STATUS_LABELS = {
  free: "Disponível",
  blocked: "Indisponível",
  booked: "Parcialmente reservado",
};

export default CalendarHeader;
