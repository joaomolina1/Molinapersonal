import Stack from "@/_design_system/Stack";
import InputNumber from "@/_design_system/InputNumber";
import InputText from "@/_design_system/InputText";
import ExtraFieldTooltip, {
  EXTRA_DEFAULT_HOUR_TOOLTIP,
  EXTRA_DEFAULT_PAX_TOOLTIP,
} from "@/_components/ExtraFieldTooltip/ExtraFieldTooltip";
import { ExtraDraft } from "./utils";
import { createBEMClasses } from "@/_utils/classname";

const { element } = createBEMClasses("pack-extras-table");

const LabelWithTooltip = ({
  label,
  tooltip,
}: {
  label: string;
  tooltip: string;
}) => (
  <Stack row alignItems="center" gap="0.25rem">
    <span>{label}</span>
    <ExtraFieldTooltip content={tooltip} />
  </Stack>
);

export const ExtraTooltipCell = ({
  extra,
  setExtra,
}: {
  extra: ExtraDraft;
  setExtra: (extra: ExtraDraft) => void;
}) => (
  <InputText
    label="Tooltip"
    placeholder="Texto do tooltip"
    showLabel={false}
    value={extra.tooltip ?? ""}
    onChange={(value) => setExtra({ ...extra, tooltip: value || null })}
    className={element("tooltip")}
  />
);

export const ExtraQuantityCells = ({
  extra,
  setExtra,
  variant,
}: {
  extra: ExtraDraft;
  setExtra: (extra: ExtraDraft) => void;
  variant: "desktop" | "mobile";
}) => {
  const showHours =
    extra.type === "per-hour" || extra.type === "per-hour-and-person";
  const showPax =
    extra.type === "per-person" || extra.type === "per-hour-and-person";

  if (!showHours && !showPax) {
    return variant === "desktop" ? (
      <td colSpan={6}>
        <div className={element("disabled")}>-</div>
      </td>
    ) : null;
  }

  const hourFields = showHours ? (
    <>
      <div className={element("quantity-field")}>
        <LabelWithTooltip label="Hora default" tooltip={EXTRA_DEFAULT_HOUR_TOOLTIP} />
        <InputNumber
          label="Hora default"
          showLabel={false}
          value={extra.defaultHour ?? undefined}
          onChange={(value) => setExtra({ ...extra, defaultHour: value ?? null })}
          measure="h"
          allowNegative={false}
          decimalScale={1}
        />
      </div>
      <div className={element("quantity-field")}>
        <span>Hora min</span>
        <InputNumber
          label="Hora min"
          showLabel={false}
          value={extra.minHour ?? undefined}
          onChange={(value) => setExtra({ ...extra, minHour: value ?? null })}
          measure="h"
          allowNegative={false}
          decimalScale={1}
        />
      </div>
      <div className={element("quantity-field")}>
        <span>Hora max</span>
        <InputNumber
          label="Hora max"
          showLabel={false}
          value={extra.maxHour ?? undefined}
          onChange={(value) => setExtra({ ...extra, maxHour: value ?? null })}
          measure="h"
          allowNegative={false}
          decimalScale={1}
        />
      </div>
    </>
  ) : null;

  const paxFields = showPax ? (
    <>
      <div className={element("quantity-field")}>
        <LabelWithTooltip label="Pax default" tooltip={EXTRA_DEFAULT_PAX_TOOLTIP} />
        <InputNumber
          label="Pax default"
          showLabel={false}
          value={extra.defaultPax ?? undefined}
          onChange={(value) => setExtra({ ...extra, defaultPax: value ?? null })}
          measure="p"
          allowNegative={false}
          decimalScale={0}
        />
      </div>
      <div className={element("quantity-field")}>
        <span>Pax min</span>
        <InputNumber
          label="Pax min"
          showLabel={false}
          value={extra.minPax ?? undefined}
          onChange={(value) => setExtra({ ...extra, minPax: value ?? null })}
          measure="p"
          allowNegative={false}
          decimalScale={0}
        />
      </div>
      <div className={element("quantity-field")}>
        <span>Pax max</span>
        <InputNumber
          label="Pax max"
          showLabel={false}
          value={extra.maxPax ?? undefined}
          onChange={(value) => setExtra({ ...extra, maxPax: value ?? null })}
          measure="p"
          allowNegative={false}
          decimalScale={0}
        />
      </div>
    </>
  ) : null;

  if (variant === "desktop") {
    return (
      <>
        {showHours && (
          <>
            <td>
              <div className={element("quantity-field")}>
                <LabelWithTooltip
                  label="Hora default"
                  tooltip={EXTRA_DEFAULT_HOUR_TOOLTIP}
                />
                <InputNumber
                  label="Hora default"
                  showLabel={false}
                  value={extra.defaultHour ?? undefined}
                  onChange={(value) =>
                    setExtra({ ...extra, defaultHour: value ?? null })
                  }
                  measure="h"
                  allowNegative={false}
                  decimalScale={1}
                />
              </div>
            </td>
            <td>
              <InputNumber
                label="Hora min"
                showLabel={false}
                value={extra.minHour ?? undefined}
                onChange={(value) => setExtra({ ...extra, minHour: value ?? null })}
                measure="h"
                allowNegative={false}
                decimalScale={1}
              />
            </td>
            <td>
              <InputNumber
                label="Hora max"
                showLabel={false}
                value={extra.maxHour ?? undefined}
                onChange={(value) => setExtra({ ...extra, maxHour: value ?? null })}
                measure="h"
                allowNegative={false}
                decimalScale={1}
              />
            </td>
          </>
        )}
        {!showHours && (
          <>
            <td>
              <div className={element("disabled")}>-</div>
            </td>
            <td>
              <div className={element("disabled")}>-</div>
            </td>
            <td>
              <div className={element("disabled")}>-</div>
            </td>
          </>
        )}
        {showPax && (
          <>
            <td>
              <div className={element("quantity-field")}>
                <LabelWithTooltip
                  label="Pax default"
                  tooltip={EXTRA_DEFAULT_PAX_TOOLTIP}
                />
                <InputNumber
                  label="Pax default"
                  showLabel={false}
                  value={extra.defaultPax ?? undefined}
                  onChange={(value) =>
                    setExtra({ ...extra, defaultPax: value ?? null })
                  }
                  measure="p"
                  allowNegative={false}
                  decimalScale={0}
                />
              </div>
            </td>
            <td>
              <InputNumber
                label="Pax min"
                showLabel={false}
                value={extra.minPax ?? undefined}
                onChange={(value) => setExtra({ ...extra, minPax: value ?? null })}
                measure="p"
                allowNegative={false}
                decimalScale={0}
              />
            </td>
            <td>
              <InputNumber
                label="Pax max"
                showLabel={false}
                value={extra.maxPax ?? undefined}
                onChange={(value) => setExtra({ ...extra, maxPax: value ?? null })}
                measure="p"
                allowNegative={false}
                decimalScale={0}
              />
            </td>
          </>
        )}
        {!showPax && (
          <>
            <td>
              <div className={element("disabled")}>-</div>
            </td>
            <td>
              <div className={element("disabled")}>-</div>
            </td>
            <td>
              <div className={element("disabled")}>-</div>
            </td>
          </>
        )}
      </>
    );
  }

  return (
    <Stack gap="0.75rem" className={element("mobile-quantity")}>
      {hourFields}
      {paxFields}
    </Stack>
  );
};
