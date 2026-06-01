"use client";

import Stack from "@/_design_system/Stack";
import { useUsersList } from "./_components/useUsersList";
import TextBlock from "@/_design_system/TextBlock";
import UsersHeader from "./_components/UsersHeader";
import UsersTable from "./_components/UsersTable";

export default function Users() {
  const usersList = useUsersList();

  return (
    <Stack gap="1rem">
      <TextBlock title="Utilizadores" />
      <UsersHeader usersList={usersList} />
      <UsersTable usersList={usersList} />
    </Stack>
  );
}
