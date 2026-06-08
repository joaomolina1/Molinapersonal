"use client";

import Stack from "@/_design_system/Stack";
import InputText from "@/_design_system/InputText";
import InputSelect from "@/_design_system/InputSelect";
import { LeadsListParams } from "@/_models/leadsList";
import { createBEMClasses } from "@/_utils/classname";

const { block } = createBEMClasses("leads-board-toolbar");

const ASSIGNED_OPTIONS = [
  { id: "all", text: "Todos os pedidos" },
  { id: "me", text: "Atribuídos a mim" },
] as const;

const LeadsBoardToolbar = ({
  query,
  onQueryChange,
  assigned,
  onAssignedChange,
}: {
  query: string;
  onQueryChange: (value: string) => void;
  assigned: LeadsListParams["assigned"];
  onAssignedChange: (value: LeadsListParams["assigned"]) => void;
}) => {
  return (
    <Stack
      row
      gap="1rem"
      alignItems="flex-end"
      flexWrap="wrap"
      className={block()}
    >
      <div style={{ flex: 1, minWidth: 280 }}>
        <InputText
          label="Pesquisar pedidos"
          value={query}
          onChange={onQueryChange}
          placeholder="Nome, email, telefone, tipo de evento, mensagem…"
        />
      </div>
      <div style={{ minWidth: 220 }}>
        <InputSelect
          label="Visibilidade"
          value={assigned ?? "all"}
          onChange={(v) =>
            onAssignedChange(v === "me" ? "me" : "all")
          }
          options={[...ASSIGNED_OPTIONS]}
        />
      </div>
    </Stack>
  );
};

export default LeadsBoardToolbar;
