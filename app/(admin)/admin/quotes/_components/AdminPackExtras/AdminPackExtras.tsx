"use client";

import { useMemo } from "react";
import InputCheckbox from "@/_design_system/InputCheckbox";
import InputNumber from "@/_design_system/InputNumber";
import Stack from "@/_design_system/Stack";
import { AdminPackPreviewExtra } from "@/_models/quote";
import { formatMoney } from "@/_utils/number";
import {
  computeExtraPrice,
  manualInitialExtraSelection,
  reconcileManualExtraSelection,
  usesExtraHours,
  usesExtraPax,
} from "@lib/extras/quantities";
import { createBEMClasses } from "@/_utils/classname";

const { block, element } = createBEMClasses("admin-pack-extras");

export type AdminExtraParams = Record<
  string,
  { hours?: number; pax?: number }
>;

const AdminPackExtras = ({
  extras,
  extraIDs,
  extraParams,
  onChange,
  eventHours,
  eventPax,
}: {
  extras: AdminPackPreviewExtra[];
  extraIDs: string[];
  extraParams: AdminExtraParams;
  onChange: (ids: string[], params: AdminExtraParams) => void;
  eventHours: number;
  eventPax: number;
}) => {
  const selectedSet = useMemo(() => new Set(extraIDs), [extraIDs]);

  if (!extras.length) return null;

  const toggleExtra = (extra: AdminPackPreviewExtra, checked: boolean) => {
    if (checked) {
      const initial = manualInitialExtraSelection(extra, eventHours, eventPax);
      const nextIds = [...extraIDs.filter((id) => id !== extra.id), extra.id];
      onChange(nextIds, {
        ...extraParams,
        [extra.id]: {
          hours: initial.hours ?? undefined,
          pax: initial.pax ?? undefined,
        },
      });
      return;
    }
    const nextIds = extraIDs.filter((id) => id !== extra.id);
    const { [extra.id]: _, ...rest } = extraParams;
    onChange(nextIds, rest);
  };

  const updateParam = (
    extra: AdminPackPreviewExtra,
    field: "hours" | "pax",
    value: number | undefined,
  ) => {
    const current = extraParams[extra.id] ?? {};
    const next = reconcileManualExtraSelection(extra, {
      id: extra.id,
      ...current,
      [field]: value ?? null,
    });
    const nextHours = next.hours ?? undefined;
    const nextPax = next.pax ?? undefined;
    if (
      (current.hours ?? undefined) === nextHours &&
      (current.pax ?? undefined) === nextPax
    ) {
      return;
    }
    onChange(extraIDs, {
      ...extraParams,
      [extra.id]: {
        hours: nextHours,
        pax: nextPax,
      },
    });
  };

  return (
    <div className={block()}>
      <strong>Extras do pack</strong>
      <Stack gap="0.5rem" className={element("list")}>
        {extras.map((extra) => {
          const isSelected =
            extra.mandatory || selectedSet.has(extra.id);
          const params = extraParams[extra.id];
          const price = isSelected
            ? computeExtraPrice(
                extra,
                params?.hours ?? null,
                params?.pax ?? null,
              )
            : null;

          return (
            <div
              key={extra.id}
              className={element("item", {
                selected: isSelected,
              })}
            >
              <Stack row gap="0.5rem" alignItems="flex-start">
                <InputCheckbox
                  checked={isSelected}
                  onChange={(checked) => toggleExtra(extra, checked)}
                  disabled={extra.mandatory}
                  label={extra.description}
                  ariaLabel={extra.description}
                />
                {isSelected && price != null && (
                  <span className={element("price")}>
                    {formatMoney(price)}
                  </span>
                )}
              </Stack>
              {isSelected &&
                (usesExtraHours(extra) || usesExtraPax(extra)) && (
                  <Stack row gap="0.75rem" className={element("fields")}>
                    {usesExtraHours(extra) && (
                      <InputNumber
                        label="Horas"
                        value={params?.hours}
                        onChange={(v) => updateParam(extra, "hours", v)}
                        measure="horas"
                        allowNegative={false}
                        decimalScale={0}
                      />
                    )}
                    {usesExtraPax(extra) && (
                      <InputNumber
                        label="Pessoas"
                        value={params?.pax}
                        onChange={(v) => updateParam(extra, "pax", v)}
                        measure="pessoas"
                        allowNegative={false}
                        decimalScale={0}
                      />
                    )}
                  </Stack>
                )}
            </div>
          );
        })}
      </Stack>
    </div>
  );
};

export default AdminPackExtras;
