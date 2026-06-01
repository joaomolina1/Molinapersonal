"use client";

import Tabs, { TabPanel } from "@/_design_system/Tabs";
import IconUserInterfaceMiscellaneousSecurity from "@/_design_system/_icons/UserInterface/Miscellaneous/Security.svg";
import IconUserInterfaceMiscellaneousUser from "@/_design_system/_icons/UserInterface/Miscellaneous/User.svg";
import { createBEMClasses } from "@/_utils/classname";
import { useState } from "react";
import DataTab from "./_components/DataTab";
import SecurityTab from "./_components/SecurityTab";

const accountTabs = [
  {
    id: "data",
    label: "Dados pessoas",
    icon: <IconUserInterfaceMiscellaneousUser />,
  },
  {
    id: "security",
    label: "Segurança",
    icon: <IconUserInterfaceMiscellaneousSecurity />,
  },
] as const;

type AccountTab = (typeof accountTabs)[number]["id"];

const { block } = createBEMClasses("account-tabs");

export default function Account() {
  const [tab, setTab] = useState<AccountTab>("data");

  return (
    <Tabs tabs={accountTabs} value={tab} onChange={setTab} className={block()}>
      <TabPanel id="data">
        <DataTab />
      </TabPanel>
      <TabPanel id="security">
        <SecurityTab />
      </TabPanel>
    </Tabs>
  );
}
