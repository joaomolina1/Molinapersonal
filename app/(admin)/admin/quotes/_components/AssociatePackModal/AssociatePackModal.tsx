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
import { useEffect, useMemo, useState } from "react";
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
}: AssociatePackModalProps) => {
  const [search, setSearch] = useState("");
  const [packIdInput, setPackIdInput] = useState("");
  const [selectedFromList, setSelectedFromList] = useState<string | undefined>();
  const [extraIDs, setExtraIDs] = useState<string[]>([]);
  const [extraParams, setExtraParams] = useState<AdminExtraParams>({});
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

  useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setPackIdInput("");
      setSelectedFromList(undefined);
      setExtraIDs([]);
      setExtraParams({});
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
    if (!activePackId || !isOpen) {
      resetPreview();
      return;
    }
    const t = setTimeout(() => {
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
    resetPreview,
  ]);

  useEffect(() => {
    if (!preview?.pack.extras?.length) return;
    const mandatory = preview.pack.extras
      .filter((e) => e.mandatory)
      .map((e) => e.id);
    setExtraIDs((prev) => {
      const merged = new Set([...prev, ...mandatory]);
      return [...merged];
    });
  }, [preview?.pack.id]);

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

        {activePackId && isPreviewLoading && (
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
            canConfigure={leadContext.canPrice}
          />
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
