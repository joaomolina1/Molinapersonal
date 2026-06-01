"use client";

import IconUserInterfaceNavigationArrowLeft from "@/_design_system/_icons/UserInterface/Navigation/ArrowLeft.svg";
import Button from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import CalendarLinks from "./_components";

export default function HostCalendarLink() {
  return (
    <Stack gap="2rem" alignItems="stretch">
      <Button
        type="link"
        leftIcon={<IconUserInterfaceNavigationArrowLeft />}
        label="Voltar a Calendário"
        href="/host/calendar"
        style={{ paddingInline: 0, alignSelf: "flex-start" }}
      />
      <TextBlock
        title="Sincronizar calendários"
        body="Sincronize o seu calendário da RINU com as plataformas que utiliza habitualmente. Esta sincronização, onde quer que o seu espaço esteja registado, ajuda a ver todas as suas reservas e disponibilidade em todos os websites num só lugar e a prevenir as reservas duplicadas."
      />
      <CalendarLinks />
    </Stack>
  );
}
