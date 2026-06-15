"use client";

import Button from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { createBEMClasses } from "@/_utils/classname";
import Venues from "../_components/Venues";
import { useDashboardList } from "../_components/useDashboardList";

const { block, element } = createBEMClasses("host-management");

export default function HostSpaces() {
  const dashboardList = useDashboardList();

  return (
    <div className={block()}>
      <div className={element("header")}>
        <TextBlock
          title="Gestão de espaços"
          body="Faça a gestão dos seus locais, espaços e packs"
        />
        <Button
          label="Adicionar novo local"
          type="secondary"
          href="/onboarding"
        />
      </div>
      <Stack gap="1.5rem" style={{ overflowX: "auto" }}>
        <Venues dashboardList={dashboardList} journey="venues" />
      </Stack>
    </div>
  );
}
