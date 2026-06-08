"use client";

import Modal from "@/_design_system/Modal";
import Stack from "@/_design_system/Stack";
import InputText from "@/_design_system/InputText";
import InputSelect from "@/_design_system/InputSelect";
import Button from "@/_design_system/Button";
import Tag from "@/_design_system/Tag";
import { useDashboardList } from "@/_models/dashboard";
import { useAssociateContactPack } from "@/_models/contact";
import {
  isPackUuid,
  useAdminLeadPackPreview,
  useAssociateQuotePack,
} from "@/_models/quote";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  manualInitialExtraSelection,
  usesExtraHours,
  usesExtraPax,
} from "@lib/extras/quantities";
import { useShowToast } from "@/_design_system/Toast";
import { createBEMClasses } from "@/_utils/classname";
import ValueWithLabel from "@/(host)/_components/ValueWithLabel";
import { formatMoney } from "@/_utils/number";
import AdminPackExtras, {
  AdminExtraParams,
} from "../AdminPackExtras";

const { block, element } = createBEMClasses("associate-pack-modal");

const MAX_PACKS = 5;

export type AssociatePackLeadTarget =
  | { type: "quote"; id: string }
  | { type: "contact"; id: string };

export type AssociatePackLeadContext = AssociatePackLeadTarget & {
  canPrice: boolean;
  eventHours: number;
  eventPax: number;
};

type AssociatePackModalProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  leadContext: AssociatePackLeadContext;
  associatedPackIds: string[];
  currentCount: number;
  stacked?: boolean;
};

const extraParamsToApi = (params: AdminExtraParams) =>
  Object.entries(params).map(([id, p]) => ({
    id,
    hours: p.hours ?? null,
    pax: p.pax ?? null,
  }));

const AssociatePackModal = ({
  isOpen,
  setIsOpen,
  leadContext,
  associatedPackIds,
  currentCount,
  stacked = false,
}: AssociatePackModalProps) => {
  const [search, setSearch] = useState("");
  const [packIdInput, setPackIdInput] = useState("");
  const [selectedFromList, setSelectedFromList] = useState<string | undefined>();
  const [extraIDs, setExtraIDs] = useState<string[]>([]);
  const [extraParams, setExtraParams] = useState<AdminExtraParams>({});
  const extrasInitPackRef = useRef<string | null>(null);
  const lastPreviewFetchKeyRef = useRef("");
  const showToast = useShowToast();

  const trimmedPackId = packIdInput.trim();
  const packIdFromInput = isPackUuid(trimmedPackId) ? trimmedPackId : undefined;
  const activePackId = packIdFromInput ?? selectedFromList;

  const {
    mutate: fetchPreview,
    data: preview,
    isPending: isPreviewLoading,
    reset: resetPreview,
  } = useAdminLeadPackPreview();

  const searchQuery = search.trim();
  const dashboardQ =
    searchQuery && !isPackUuid(searchQuery) ? searchQuery : undefined;

  const { data: dashboardItems = [], isPending: isSearching } = useDashboardList(
    {
      type: "pack",
      q: dashboardQ,
      page_size: 100,
    },
  );

  const { mutateAsync: associateQuotePack, isPending: isAssociatingQuote } =
    useAssociateQuotePack();
  const { mutateAsync: associateContactPack, isPending: isAssociatingContact } =
    useAssociateContactPack();
  const isAssociating = isAssociatingQuote || isAssociatingContact;

  const associated = useMemo(
    () => new Set(associatedPackIds),
    [associatedPackIds],
  );

  const options = useMemo(() => {
    return dashboardItems
      .filter((item) => item.type === "pack" && !associated.has(item.id))
      .map((item) => ({
        id: item.id,
        text: `${item.venue || "—"} · ${item.space || "—"} · ${item.pack || item.reference}`,
      }))
      .sort((a, b) => a.text.localeCompare(b.text, "pt"));
  }, [dashboardItems, associated]);

  const alreadyAssociated =
    !!activePackId && associated.has(activePackId);
  const atLimit = currentCount >= MAX_PACKS;
  const lookup = preview?.lookup;
  const canAssociate =
    !!activePackId &&
    !!lookup &&
    !atLimit &&
    !alreadyAssociated &&
    !lookup.isDeleted;

  const previewExtrasKey = useMemo(
    () =>
      JSON.stringify({
        ids: [...extraIDs].sort(),
        params: extraParamsToApi(extraParams),
      }),
    [extraIDs, extraParams],
  );

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setPackIdInput("");
      setSelectedFromList(undefined);
      setExtraIDs([]);
      setExtraParams({});
      extrasInitPackRef.current = null;
      lastPreviewFetchKeyRef.current = "";
      resetPreview();
    }
  }, [isOpen, resetPreview]);

  useEffect(() => {
    if (packIdFromInput) setSelectedFromList(undefined);
  }, [packIdFromInput]);

  useEffect(() => {
    if (isPackUuid(searchQuery)) {
      setPackIdInput(searchQuery);
      setSearch("");
    }
  }, [searchQuery]);

  useEffect(() => {
    if (!isOpen || !activePackId) {
      extrasInitPackRef.current = null;
      return;
    }
    if (
      extrasInitPackRef.current &&
      extrasInitPackRef.current !== activePackId
    ) {
      extrasInitPackRef.current = null;
      setExtraIDs([]);
      setExtraParams({});
      lastPreviewFetchKeyRef.current = "";
    }
  }, [activePackId, isOpen]);

  useEffect(() => {
    const packId = preview?.pack?.id;
    if (!packId || packId !== activePackId) return;
    if (extrasInitPackRef.current === packId) return;

    const packExtras = preview.pack.extras ?? [];
    const ids = new Set(
      packExtras.filter((e) => e.mandatory).map((e) => e.id),
    );
    const params: AdminExtraParams = {};

    for (const extra of packExtras) {
      if (!ids.has(extra.id)) continue;
      if (usesExtraHours(extra) || usesExtraPax(extra)) {
        const initial = manualInitialExtraSelection(
          extra,
          leadContext.eventHours,
          leadContext.eventPax,
        );
        params[extra.id] = {
          hours: initial.hours ?? undefined,
          pax: initial.pax ?? undefined,
        };
      }
    }

    setExtraIDs([...ids]);
    setExtraParams(params);
    extrasInitPackRef.current = packId;
  }, [
    activePackId,
    leadContext.eventHours,
    leadContext.eventPax,
    preview?.pack?.id,
  ]);

  useEffect(() => {
    if (!activePackId || !isOpen) {
      lastPreviewFetchKeyRef.current = "";
      resetPreview();
      return;
    }

    const fetchKey = `${activePackId}|${leadContext.type}|${leadContext.id}|${previewExtrasKey}`;
    const t = setTimeout(() => {
      if (fetchKey === lastPreviewFetchKeyRef.current) return;
      lastPreviewFetchKeyRef.current = fetchKey;
      fetchPreview({
        packID: activePackId,
        leadType: leadContext.type,
        leadId: leadContext.id,
        extraIDs,
        extraParams: extraParamsToApi(extraParams),
      });
    }, 300);
    return () => clearTimeout(t);
  }, [
    activePackId,
    extraIDs,
    extraParams,
    fetchPreview,
    isOpen,
    leadContext.id,
    leadContext.type,
    previewExtrasKey,
    resetPreview,
  ]);

  const handleSubmit = async () => {
    if (!activePackId || !canAssociate) return;
    const body = {
      packID: activePackId,
      extraIDs,
      extraParams: extraParamsToApi(extraParams),
    };
    try {
      if (leadContext.type === "quote") {
        await associateQuotePack({ quoteId: leadContext.id, ...body });
      } else {
        await associateContactPack({ contactId: leadContext.id, ...body });
      }
      showToast({ text: "Pack associado" });
      setIsOpen(false);
    } catch {
      showToast({ text: "Não foi possível associar o pack" });
    }
  };

  const priceHint =
    preview?.priceReason === "missing_event_context"
      ? "Preço calculado apenas em pedidos de orçamento com data, horário e nº de pessoas."
      : preview?.priceReason === "unavailable"
        ? "Pack indisponível para os dados deste pedido."
        : null;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      width="x-large"
      ariaLabel="Associar pack ao pedido"
      className={block()}
      stacked={stacked}
    >
      <Stack gap="1.5rem">
        <p>
          Packs associados: {currentCount}/{MAX_PACKS}. Configure extras e veja
          o preço estimado com base nos dados do pedido.
        </p>

        <InputText
          label="ID do pack"
          value={packIdInput}
          onChange={setPackIdInput}
          disabled={atLimit}
          placeholder="Cole o UUID do pack"
        />

        <InputText
          label="Pesquisar pack"
          value={search}
          onChange={setSearch}
          disabled={atLimit}
          placeholder="Nome, referência, venue, espaço ou UUID"
        />

        <InputSelect
          label="Resultados da pesquisa"
          value={packIdFromInput ? undefined : selectedFromList}
          onChange={setSelectedFromList}
          options={options}
          disabled={
            atLimit || isSearching || !!packIdFromInput || options.length === 0
          }
        />

        {activePackId && isPreviewLoading && !preview && (
          <p className={element("hint")}>A carregar pack…</p>
        )}
        {alreadyAssociated && (
          <p className={element("hint", { error: true })}>
            Este pack já está associado a este pedido.
          </p>
        )}

        {lookup && (
          <div className={element("preview")}>
            <ValueWithLabel label="Pack" value={lookup.packName || "—"} />
            <ValueWithLabel
              label="Referência"
              value={lookup.packReference || "—"}
            />
            <ValueWithLabel label="Espaço" value={lookup.spaceName || "—"} />
            <ValueWithLabel label="Venue" value={lookup.venueName || "—"} />
            {lookup.isDeleted && (
              <Tag
                size="small"
                type="warning"
                text="Pack eliminado — não pode associar"
              />
            )}
          </div>
        )}

        {preview?.pack.extras && preview.pack.extras.length > 0 && (
          <div className={element("extras")}>
            <p className={element("hint")}>
              Depois de associar, pode alterar horas e pessoas por extra na página
              do pedido em «Configurar extras» em cada pack.
            </p>
          <AdminPackExtras
            extras={preview.pack.extras}
            extraIDs={extraIDs}
            extraParams={extraParams}
            onChange={(ids, params) => {
              setExtraIDs(ids);
              setExtraParams(params);
            }}
            eventHours={leadContext.eventHours}
            eventPax={leadContext.eventPax}
          />
          </div>
        )}

        {priceHint && <p className={element("hint")}>{priceHint}</p>}

        {preview?.price && (
          <p className={element("total")}>
            Preço estimado:{" "}
            <strong>{formatMoney(preview.price.value)}</strong>
            {preview.price.timeOverflow && (
              <span className={element("hint")}> (duração limitada ao máximo do pack)</span>
            )}
          </p>
        )}

        <Stack row gap="1rem" justifyContent="flex-end">
          <Button
            type="secondary"
            label="Cancelar"
            onClick={() => setIsOpen(false)}
          />
          <Button
            type="primary"
            label="Associar"
            onClick={handleSubmit}
            disabled={!canAssociate}
            loading={isAssociating}
          />
        </Stack>
      </Stack>
    </Modal>
  );
};

export default AssociatePackModal;
