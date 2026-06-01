"use client";

import { createBEMClasses } from "@/_utils/classname";
import { UsersList } from "../useUsersList";
import InputText from "@/_design_system/InputText";
import IconUserInterfaceActionsSearch from "@/_design_system/_icons/UserInterface/Actions/Search.svg";

const { block } = createBEMClasses("admin-users-header");

const UsersHeader = ({ usersList }: { usersList: UsersList }) => {
  const { query, setQuery } = usersList;

  return (
    <div className={block()}>
      <InputText
        value={query ?? ""}
        onChange={(value) => setQuery(value)}
        label="Pesquisa"
        leftIcon={<IconUserInterfaceActionsSearch />}
      />
    </div>
  );
};

export default UsersHeader;
