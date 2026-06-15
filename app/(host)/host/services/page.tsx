"use client";

import Button from "@/_design_system/Button";
import Stack from "@/_design_system/Stack";
import TextBlock from "@/_design_system/TextBlock";
import { createBEMClasses } from "@/_utils/classname";
import Venues from "../_components/Venues";
import { useDashboardList } from "../_components/useDashboardList";

const { block, element } = createBEMClasses("host-management");

export default function HostServices() {
  const dashboardList = useDashboardList();

  return (
    <div className={block()}>
      <div className={element("header")}>
        <TextBlock
          title="Gestão de serviços"
          body="Faça a gestão das suas empresas de serviços e packs"
        />
        <Button
          label="Adicionar nova empresa"
          type="secondary"
          href="/onboarding"
        />
      </div>
      <Stack gap="1.5rem" style={{ overflowX: "auto" }}>
        <Venues dashboardList={dashboardList} journey="services" />
      </Stack>
    </div>
  );
}
