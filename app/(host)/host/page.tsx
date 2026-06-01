"use client";

import Button from "@/_design_system/Button";
import TextBlock from "@/_design_system/TextBlock";
import { createBEMClasses } from "@/_utils/classname";
import Calendar from "./_components/Calendar";
import Stack from "@/_design_system/Stack";
import Venues from "./_components/Venues";
import { useDashboardList } from "./_components/useDashboardList";

const { block, element } = createBEMClasses("host-dashboard");

export default function HostDashboard() {
  const dashboardList = useDashboardList();

  return (
    <div className={block()}>
      <div className={element("header")}>
        <TextBlock title="Dashboard" />
        <Button
          label="Adicionar novo local ou empresa"
          type="secondary"
          href="/onboarding"
        />
      </div>
      <Calendar />
      <Stack gap="1.5rem" style={{ overflowX: "auto" }}>
        <Venues dashboardList={dashboardList} />
      </Stack>
    </div>
  );
}
