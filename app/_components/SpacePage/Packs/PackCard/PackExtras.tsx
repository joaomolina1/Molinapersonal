"use client";

import { useMemo } from "react";
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

  const toggleExtra = (extra: Extra, checked: boolean) => {
    if (checked) {
      const initial = initialExtraSelection(extra, eventHours, eventPax);
      packSearch.setExtras([
        ...packSearch.extras.filter((id) => id !== extra.id),
        extra.id,
      ]);
      packSearch.setExtraParams((prev) => ({
        ...prev,
        [extra.id]: {
          hours: initial.hours ?? undefined,
          pax: initial.pax ?? undefined,
        },
      }));
      return;
    }

    packSearch.setExtras(packSearch.extras.filter((id) => id !== extra.id));
    packSearch.setExtraParams((prev) => {
      const { [extra.id]: _, ...rest } = prev;
      return rest;
    });
  };

  const updateExtraParam = (
    extra: Extra,
    field: "hours" | "pax",
    value: number | undefined,
  ) => {
    packSearch.setExtraParams((prev) => {
      const current = prev[extra.id] ?? {};
      const next = reconcileExtraSelection(
        extra,
        { id: extra.id, ...current, [field]: value ?? null },
        eventHours,
        eventPax,
      );

      return {
        ...prev,
        [extra.id]: {
          hours: next.hours ?? undefined,
          pax: next.pax ?? undefined,
        },
      };
    });
  };

  const getExtraPrice = (extra: Extra, isSelected: boolean) => {
    if (!canConfigure) return null;

    const params = packSearch.extraParams[extra.id];
    const preview = isSelected
      ? { hours: params?.hours ?? null, pax: params?.pax ?? null }
      : initialExtraSelection(extra, eventHours, eventPax);

    return computeExtraPrice(extra, preview.hours ?? null, preview.pax ?? null);
  };

  return (
    <div className={element("extras")}>
      <hr className={element("extras__separator")} />
      <Stack row alignItems="center" gap="0.25rem">
        <p className={element("extras__title")}>Serviços adicionais</p>
        <Tooltip
          content="Selecione os serviços adicionais que pretende incluir na reserva."
          visibleOnTouchDevice
          openOnlyOnClick
        >
          <IconButton
            showTooltip={false}
            ariaLabel="Mais informação sobre serviços adicionais"
            icon={<IconUserInterfaceMiscellaneousTooltip />}
          />
        </Tooltip>
      </Stack>
      <div className={element("extras__list")}>
        {extras.map((extra) => {
          const isSelected =
            extra.mandatory || packSearch.extras.includes(extra.id);
          const params = packSearch.extraParams[extra.id];
          const hours = params?.hours ?? null;
          const pax = params?.pax ?? null;
          const price = getExtraPrice(extra, isSelected);
          const showFields =
            isSelected &&
            canConfigure &&
            (usesExtraHours(extra) || usesExtraPax(extra));

          return (
            <div
              key={extra.id}
              className={element("extras__item", { selected: isSelected })}
            >
              <div className={element("extras__item-header")}>
                <InputCheckbox
                  checked={isSelected}
                  onChange={(checked) => toggleExtra(extra, checked)}
                  disabled={extra.mandatory}
                  ariaLabel={extra.description}
                  className={element("extras__item-checkbox")}
                />
                <div className={element("extras__item-main")}>
                  <div className={element("extras__item-title")}>
                    <span className={element("extras__item-name")}>
                      {extra.description}
                    </span>
                    {!!extra.tooltip && (
                      <Tooltip
                        content={extra.tooltip}
                        visibleOnTouchDevice
                        openOnlyOnClick
                      >
                        <IconButton
                          showTooltip={false}
                          ariaLabel="Mais informação sobre o extra"
                          icon={<IconUserInterfaceMiscellaneousTooltip />}
                        />
                      </Tooltip>
                    )}
                  </div>
                  {price != null && (
                    <span className={element("extras__item-price")}>
                      +{formatMoney(price)}
                    </span>
                  )}
                </div>
              </div>

              {showFields && (
                <>
                  <hr className={element("extras__item-divider")} />
                  <div className={element("extras__item-fields")}>
                    {usesExtraHours(extra) && (
                      <div className={element("extras__item-field")}>
                        <Stack gap="0.25rem">
                          <Stack
                            row
                            alignItems="center"
                            justifyContent="space-between"
                          >
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
                      </div>
                    )}
                    {usesExtraPax(extra) && (
                      <div className={element("extras__item-field")}>
                        <Stack gap="0.25rem">
                          <Stack
                            row
                            alignItems="center"
                            justifyContent="space-between"
                          >
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
                            onChange={(value) =>
                              updateExtraParam(extra, "pax", value)
                            }
                            measure="pessoas"
                            allowNegative={false}
                            decimalScale={0}
                          />
                        </Stack>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PackExtras;
