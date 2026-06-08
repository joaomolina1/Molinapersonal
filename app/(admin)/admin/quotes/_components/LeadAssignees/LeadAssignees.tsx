"use client";

import { useEffect, useMemo, useState } from "react";
import Stack from "@/_design_system/Stack";
import InputSelect from "@/_design_system/InputSelect";
import Button from "@/_design_system/Button";
import Tag from "@/_design_system/Tag";
import { useAdminAssignees } from "@/_models/adminAssignees";
import { useUpdateContactLead } from "@/_models/contact";
import { useUpdateQuoteLead } from "@/_models/quote";
import { useShowToast } from "@/_design_system/Toast";
import { createBEMClasses } from "@/_utils/classname";
import { IconButton } from "@/_design_system/Button";
import IconUserInterfaceActionsClose from "@/_design_system/_icons/UserInterface/Actions/Close.svg";

const { block, element } = createBEMClasses("lead-assignees");

const LeadAssignees = ({
  leadKind,
  leadId,
  assignedAdminIds,
}: {
  leadKind: "quote" | "contact";
  leadId: string;
  assignedAdminIds: string[];
}) => {
  const { data: admins = [], isPending } = useAdminAssignees();
  const { mutateAsync: updateQuote, isPending: savingQuote } =
    useUpdateQuoteLead();
  const { mutateAsync: updateContact, isPending: savingContact } =
    useUpdateContactLead();
  const showToast = useShowToast();
  const [selectedAdmin, setSelectedAdmin] = useState<string>();
  const [ids, setIds] = useState(assignedAdminIds);

  useEffect(() => {
    setIds(assignedAdminIds);
  }, [assignedAdminIds]);

  const adminById = useMemo(
    () => new Map(admins.map((a) => [a.id, a.name])),
    [admins],
  );

  const options = admins
    .filter((a) => !ids.includes(a.id))
    .map((a) => ({ id: a.id, text: a.name }));

  const persist = async (next: string[]) => {
    setIds(next);
    try {
      if (leadKind === "quote") {
        await updateQuote({ quoteId: leadId, assignedAdminIds: next });
      } else {
        await updateContact({ contactId: leadId, assignedAdminIds: next });
      }
      showToast({ text: "Responsáveis atualizados" });
    } catch {
      setIds(assignedAdminIds);
      showToast({ text: "Não foi possível atualizar responsáveis" });
    }
  };

  const addAdmin = () => {
    if (!selectedAdmin || ids.includes(selectedAdmin)) return;
    void persist([...ids, selectedAdmin]);
    setSelectedAdmin(undefined);
  };

  const removeAdmin = (adminId: string) => {
    void persist(ids.filter((id) => id !== adminId));
  };

  return (
    <Stack gap="0.75rem" alignItems="flex-start" className={block()}>
      <strong>Responsáveis (admins)</strong>
      <Stack row gap="0.5rem" flexWrap="wrap">
        {ids.map((id) => (
          <Stack key={id} row gap="0.25rem" alignItems="center">
            <Tag
              size="small"
              type="info"
              text={adminById.get(id) ?? id.slice(0, 8)}
            />
            <IconButton
              ariaLabel="Remover responsável"
              icon={<IconUserInterfaceActionsClose />}
              type="neutral"
              onClick={() => removeAdmin(id)}
            />
          </Stack>
        ))}
        {!ids.length && (
          <span className={element("empty")}>Nenhum admin associado</span>
        )}
      </Stack>
      <Stack row gap="0.5rem" alignItems="flex-end" style={{ width: "100%" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <InputSelect
            label="Adicionar admin"
            value={selectedAdmin}
            onChange={setSelectedAdmin}
            options={options}
            disabled={isPending || !options.length}
          />
        </div>
        <Button
          type="secondary"
          label="Adicionar"
          onClick={addAdmin}
          disabled={!selectedAdmin || savingQuote || savingContact}
        />
      </Stack>
    </Stack>
  );
};

export default LeadAssignees;
