"use client";

import { useEffect, useMemo } from "react";
import InputCheckbox from "@/_design_system/InputCheckbox";
import InputNumber from "@/_design_system/InputNumber";
import Stack from "@/_design_system/Stack";
import { IconButton } from "@/_design_system/Button";
import Tooltip from "@/_design_system/Tooltip";
import IconUserInterfaceMiscellaneousTooltip from "@/_design_system/_icons/UserInterface/Miscellaneous/Tooltip.svg";
import { Extra } from "@/(onboarding)/onboarding/_components/Step4/Extras/utils";
import { PackSearchHook } from "../PackSearch";
import { createBEMClasses } from "@/_utils/classname";
import { formatMoney } from "@/_utils/number";
import {
  computeExtraPrice,
  initialExtraSelection,
  reconcileExtraSelection,
  usesExtraHours,
  usesExtraPax,
} from "@lib/extras/quantities";

const { element } = createBEMClasses("client-pack-card");

const PackExtras = ({
  extras,
  packSearch,
}: {
  extras: Extra[];
  packSearch: PackSearchHook;
}) => {
  const eventHours = useMemo(() => {
    if (!packSearch.start || !packSearch.end) return 0;
    return packSearch.end.number - packSearch.start.number;
  }, [packSearch.end, packSearch.start]);

  const eventPax = packSearch.numPeopleDebounced ?? 0;

  const canConfigure =
    !!packSearch.date &&
    !!packSearch.start &&
    !!packSearch.end &&
    !!packSearch.numPeopleDebounced;

  useEffect(() => {
    if (!canConfigure) return;

    const nextParams = { ...packSearch.extraParams };
    let changed = false;

    for (const extra of extras) {
      const isSelected =
        extra.mandatory || packSearch.extras.includes(extra.id);
      if (!isSelected) continue;

      const current = nextParams[extra.id];
      const reconciled = reconcileExtraSelection(
        extra,
        current
          ? { id: extra.id, hours: current.hours, pax: current.pax }
          : undefined,
        eventHours,
        eventPax,
      );

      if (
        current?.hours !== reconciled.hours ||
        current?.pax !== reconciled.pax
      ) {
        nextParams[extra.id] = {
          hours: reconciled.hours ?? undefined,
          pax: reconciled.pax ?? undefined,
        };
        changed = true;
      }
    }

    if (changed) {
      packSearch.setExtraParams(nextParams);
    }
  }, [
    canConfigure,
    eventHours,
    eventPax,
    extras,
    packSearch.extras,
    packSearch.extraParams,
    packSearch.setExtraParams,
  ]);

  const toggleExtra = (extra: Extra, checked: boolean) => {
    const without = packSearch.extras.filter((id) => id !== extra.id);
    if (checked) {
      const initial = initialExtraSelection(extra, eventHours, eventPax);
      packSearch.setExtras([...without, extra.id]);
      packSearch.setExtraParams({
        ...packSearch.extraParams,
        [extra.id]: {
          hours: initial.hours ?? undefined,
          pax: initial.pax ?? undefined,
        },
      });
      return;
    }

    packSearch.setExtras(without);
    const { [extra.id]: _, ...rest } = packSearch.extraParams;
    packSearch.setExtraParams(rest);
  };

  const updateExtraParam = (
    extra: Extra,
    field: "hours" | "pax",
    value: number | undefined,
  ) => {
    const current = packSearch.extraParams[extra.id] ?? { id: extra.id };
    const next = reconcileExtraSelection(
      extra,
      { ...current, id: extra.id, [field]: value ?? null },
      eventHours,
      eventPax,
    );

    packSearch.setExtraParams({
      ...packSearch.extraParams,
      [extra.id]: {
        hours: next.hours ?? undefined,
        pax: next.pax ?? undefined,
      },
    });
  };

  return (
    <div className={element("extras")}>
      <Stack row alignItems="center" gap="0.25rem">
        <p className={element("extras__title")}>Serviços adicionais</p>
      </Stack>
      <Stack gap="0.75rem">
        {extras.map((extra) => {
          const isSelected =
            extra.mandatory || packSearch.extras.includes(extra.id);
          const params = packSearch.extraParams[extra.id];
          const hours = params?.hours ?? null;
          const pax = params?.pax ?? null;
          const price = canConfigure
            ? computeExtraPrice(extra, hours, pax)
            : null;

          return (
            <div
              key={extra.id}
              className={element("extras__item", { selected: isSelected })}
            >
              <Stack row alignItems="center" justifyContent="space-between">
                <Stack row alignItems="center" gap="0.25rem">
                  <InputCheckbox
                    checked={isSelected}
                    onChange={(checked) => toggleExtra(extra, checked)}
                    disabled={extra.mandatory}
                    label={extra.description}
                  />
                  {!!extra.tooltip && (
                    <Tooltip content={extra.tooltip} visibleOnTouchDevice openOnlyOnClick>
                      <IconButton
                        showTooltip={false}
                        ariaLabel="Mais informação sobre o extra"
                        icon={<IconUserInterfaceMiscellaneousTooltip />}
                      />
                    </Tooltip>
                  )}
                </Stack>
                {price != null && (
                  <span className={element("extras__item-price")}>
                    +{formatMoney(price)}
                  </span>
                )}
              </Stack>

              {isSelected && canConfigure && (
                <Stack gap="0.75rem" className={element("extras__item-fields")}>
                  {usesExtraHours(extra) && (
                    <Stack gap="0.25rem">
                      <Stack row alignItems="center" justifyContent="space-between">
                        <span className={element("extras__field-label")}>
                          Duração pretendida
                        </span>
                        {extra.priceHour != null && (
                          <span className={element("extras__field-hint")}>
                            {formatMoney(extra.priceHour)}/hora
                          </span>
                        )}
                      </Stack>
                      <InputNumber
                        label="Duração pretendida"
                        showLabel={false}
                        value={hours ?? undefined}
                        onChange={(value) =>
                          updateExtraParam(extra, "hours", value)
                        }
                        measure="h"
                        allowNegative={false}
                        decimalScale={1}
                      />
                    </Stack>
                  )}
                  {usesExtraPax(extra) && (
                    <Stack gap="0.25rem">
                      <Stack row alignItems="center" justifyContent="space-between">
                        <span className={element("extras__field-label")}>
                          Pessoas
                        </span>
                        {extra.pricePax != null && (
                          <span className={element("extras__field-hint")}>
                            {formatMoney(extra.pricePax)}/pessoa
                          </span>
                        )}
                      </Stack>
                      <InputNumber
                        label="Pessoas"
                        showLabel={false}
                        value={pax ?? undefined}
                        onChange={(value) => updateExtraParam(extra, "pax", value)}
                        measure="pessoas"
                        allowNegative={false}
                        decimalScale={0}
                      />
                    </Stack>
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

export default PackExtras;
