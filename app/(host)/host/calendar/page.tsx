"use client";

import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import Calendar from "./_components/Calendar";
import CalendarHeader from "./_components/CalendarHeader";
import { useCalendarList } from "./_components/useCalendarList";
import EmptyState from "@/_components/EmptyState";

export default function HostCalendar() {
  const calendarList = useCalendarList();

  return (
    <Stack gap="1rem">
      <TextBlock title="Calendário" />
      <Stack gap="2.5rem">
        {calendarList.venue.length > 0 ? (
          <>
            <CalendarHeader calendarList={calendarList} />
            <Calendar calendarList={calendarList} />
          </>
        ) : (
          <NoActiveVenues />
        )}
      </Stack>
    </Stack>
  );
}

const NoActiveVenues = () => (
  <EmptyState
    text={{
      subtitle:
        "Para visualizar o calendário de reservas, deverá ter pelo menos um local com um espaço ativo",
      body: "Verifique se já criou um local e espaço, se tem espaços em rascunhos ou aguarde pela aprovação da nossa equipa",
    }}
    action={{
      label: "Ir para Dashboard",
      type: "secondary",
      href: "/host",
    }}
    withBorder
  />
);
