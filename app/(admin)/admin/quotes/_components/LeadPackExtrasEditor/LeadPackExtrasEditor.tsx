"use client";

import { useEffect, useMemo, useState } from "react";
import Button from "@/_design_system/Button";
import {
  ContactPackAssociation,
  useUpdateContactPackStatus,
} from "@/_models/contact";
import {
  LeadPackExtraParam,
  QuotePackAssociation,
  useAdminLeadPackPreview,
  useUpdateQuotePackStatus,
} from "@/_models/quote";
import { useShowToast } from "@/_design_system/Toast";
import { createBEMClasses } from "@/_utils/classname";
import AdminPackExtras, {
  AdminExtraParams,
} from "../AdminPackExtras";
import type { AssociatePackLeadContext } from "../AssociatePackModal";

const { block, element } = createBEMClasses("lead-pack-extras-editor");

const paramsFromAssociation = (
  params: LeadPackExtraParam[],
): AdminExtraParams => {
  const record: AdminExtraParams = {};
  for (const p of params) {
    record[p.id] = {
      hours: p.hours ?? undefined,
      pax: p.pax ?? undefined,
    };
  }
  return record;
};

const extraParamsToApi = (params: AdminExtraParams) =>
  Object.entries(params).map(([id, p]) => ({
    id,
    hours: p.hours ?? null,
    pax: p.pax ?? null,
  }));

const LeadPackExtrasEditor = ({
  leadContext,
  association,
}: {
  leadContext: AssociatePackLeadContext;
  association: QuotePackAssociation | ContactPackAssociation;
}) => {
  const showToast = useShowToast();
  const [extraIDs, setExtraIDs] = useState(association.extraIDs);
  const [extraParams, setExtraParams] = useState<AdminExtraParams>(() =>
    paramsFromAssociation(association.extraParams),
  );

  const { mutate: fetchPreview, data: preview } = useAdminLeadPackPreview();
  const { mutateAsync: updateQuotePack, isPending: savingQuote } =
    useUpdateQuotePackStatus();
  const { mutateAsync: updateContactPack, isPending: savingContact } =
    useUpdateContactPackStatus();

  const previewKey = useMemo(
    () =>
      JSON.stringify({
        packID: association.packID,
        ids: [...extraIDs].sort(),
        params: extraParamsToApi(extraParams),
      }),
    [association.packID, extraIDs, extraParams],
  );

  useEffect(() => {
    setExtraIDs(association.extraIDs);
    setExtraParams(paramsFromAssociation(association.extraParams));
  }, [association.id, association.extraIDs, association.extraParams]);

  useEffect(() => {
    fetchPreview({
      packID: association.packID,
      leadType: leadContext.type,
      leadId: leadContext.id,
      extraIDs,
      extraParams: extraParamsToApi(extraParams),
    });
  }, [
    association.packID,
    extraIDs,
    extraParams,
    fetchPreview,
    leadContext.id,
    leadContext.type,
    previewKey,
  ]);

  const handleSave = async () => {
    try {
      if (leadContext.type === "quote") {
        await updateQuotePack({
          quoteId: leadContext.id,
          packId: association.packID,
          extraIDs,
          extraParams: extraParamsToApi(extraParams),
        });
      } else {
        await updateContactPack({
          contactId: leadContext.id,
          packId: association.packID,
          extraIDs,
          extraParams: extraParamsToApi(extraParams),
        });
      }
      showToast({ text: "Extras guardados" });
    } catch {
      showToast({ text: "Não foi possível guardar os extras" });
    }
  };

  const packExtras = preview?.pack.extras ?? [];
  if (!packExtras.length) {
    return (
      <p className={element("empty")}>Este pack não tem extras configuráveis.</p>
    );
  }

  return (
    <div className={block()}>
      <p className={element("hint")}>
        Marque os extras incluídos nesta proposta e defina{" "}
        <strong>horas</strong> ou <strong>pessoas</strong> por extra. Os valores
        do pedido (data, horário, nº de pessoas), quando existem, são usados como
        sugestão inicial.
      </p>
      <AdminPackExtras
        extras={packExtras}
        extraIDs={extraIDs}
        extraParams={extraParams}
        onChange={(ids, params) => {
          setExtraIDs(ids);
          setExtraParams(params);
        }}
        eventHours={leadContext.eventHours}
        eventPax={leadContext.eventPax}
      />
      <Button
        type="secondary"
        label="Guardar extras deste pack"
        onClick={handleSave}
        loading={savingQuote || savingContact}
      />
    </div>
  );
};

export default LeadPackExtrasEditor;
