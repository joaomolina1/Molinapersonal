"use client";

import InputSelect from "@/_design_system/InputSelect";
import InputText from "@/_design_system/InputText";
import IconUserInterfaceActionsSearch from "@/_design_system/_icons/UserInterface/Actions/Search.svg";
import { createBEMClasses } from "@/_utils/classname";
import { AdminList } from "../useAdminList";

const { block } = createBEMClasses("admin-status-header");

const StatusHeader = ({ adminList }: { adminList: AdminList }) => {
  const {
    query,
    setQuery,
    type,
    setType,
    typeOptions,
    status,
    setStatus,
    statusOptions,
  } = adminList;

  return (
    <div className={block()}>
      <InputText
        value={query ?? ""}
        onChange={(value) => setQuery(value)}
        label="Pesquisa"
        leftIcon={<IconUserInterfaceActionsSearch />}
      />
      <InputSelect
        value={type}
        onChange={setType}
        label="Tipo"
        options={typeOptions}
      />
      <InputSelect
        value={status}
        onChange={setStatus}
        label="Estado"
        options={statusOptions}
      />
    </div>
  );
};

export default StatusHeader;
