"use client";

import TextBlock from "@/_design_system/TextBlock";
import Stack from "@/_design_system/Stack";
import StatusTable from "./_components/StatusTable";
import StatusHeader from "./_components/StatusHeader";
import { useAdminList } from "./_components/useAdminList";

export default function AdminStatuses() {
  const adminList = useAdminList();

  return (
    <Stack gap="2.5rem">
      <Stack gap="1rem">
        <TextBlock title="Estados" />
        <Stack gap="2.5rem">
          <StatusHeader adminList={adminList} />
          <StatusTable adminList={adminList} />
        </Stack>
      </Stack>
    </Stack>
  );
}
