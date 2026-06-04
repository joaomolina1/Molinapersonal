"use client";

import Stack from "@/_design_system/Stack";
import Tag from "@/_design_system/Tag";
import { IconButton } from "@/_design_system/Button";
import IconUserInterfaceActionsDelete from "@/_design_system/_icons/UserInterface/Actions/Delete.svg";
import IconUserInterfaceActionsEdit from "@/_design_system/_icons/UserInterface/Actions/Edit.svg";
import Tooltip from "@/_design_system/Tooltip";
import IconUserInterfaceMiscellaneousTooltip from "@/_design_system/_icons/UserInterface/Miscellaneous/Tooltip.svg";
import { InputError } from "@/_design_system/_utils/InputWrapper";
import { createBEMClasses } from "@/_utils/classname";
import { formatMoney } from "@/_utils/number";
import {
  ExtraDraft,
  getExtraDraftError,
  getExtraPriceTypeLabel,
} from "./utils";

const { element } = createBEMClasses("pack-extras");

const formatExtraPriceLines = (extra: ExtraDraft): string[] => {
  const lines: string[] = [];

  if (extra.type === "fixed" && extra.fixedPrice != null) {
    lines.push(formatMoney(extra.fixedPrice));
  }

  if (
    (extra.type === "per-hour" || extra.type === "per-hour-and-person") &&
    extra.priceHour != null
  ) {
    lines.push(`${formatMoney(extra.priceHour)}/hora`);
  }

  if (
    (extra.type === "per-person" || extra.type === "per-hour-and-person") &&
    extra.pricePax != null
  ) {
    lines.push(`${formatMoney(extra.pricePax)}/pessoa`);
  }

  return lines;
};

const formatExtraQuantityLines = (extra: ExtraDraft): string[] => {
  const lines: string[] = [];

  if (extra.type === "per-hour" || extra.type === "per-hour-and-person") {
    if (extra.defaultHour != null) lines.push(`Hora default: ${extra.defaultHour}h`);
    if (extra.minHour != null || extra.maxHour != null) {
      lines.push(
        `Horas: ${extra.minHour ?? "—"} – ${extra.maxHour ?? "—"}`,
      );
    }
  }

  if (extra.type === "per-person" || extra.type === "per-hour-and-person") {
    if (extra.defaultPax != null) lines.push(`Pax default: ${extra.defaultPax}`);
    if (extra.minPax != null || extra.maxPax != null) {
      lines.push(`Pessoas: ${extra.minPax ?? "—"} – ${extra.maxPax ?? "—"}`);
    }
  }

  return lines;
};

const ExtraCard = ({
  extra,
  onEdit,
  onDelete,
  showError,
}: {
  extra: ExtraDraft;
  onEdit: () => void;
  onDelete: () => void;
  showError?: boolean;
}) => {
  const error = showError ? getExtraDraftError(extra) : undefined;
  const priceLines = formatExtraPriceLines(extra);
  const quantityLines = formatExtraQuantityLines(extra);

  return (
    <div className={element("card")}>
      <Stack row alignItems="flex-start" justifyContent="space-between" gap="1rem">
        <Stack gap="0.5rem" className={element("card-content")}>
          <Stack row alignItems="center" gap="0.25rem">
            <p className={element("card-title")}>
              {extra.description?.trim() || "Sem descrição"}
            </p>
            {!!extra.tooltip && (
              <Tooltip content={extra.tooltip} visibleOnTouchDevice openOnlyOnClick>
                <IconButton
                  showTooltip={false}
                  ariaLabel="Ver tooltip do extra"
                  icon={<IconUserInterfaceMiscellaneousTooltip />}
                />
              </Tooltip>
            )}
          </Stack>
          <Stack row gap="0.5rem" className={element("card-tags")}>
            <Tag size="small" text={getExtraPriceTypeLabel(extra.type)} />
            {extra.mandatory && (
              <Tag size="small" text="Obrigatório" type="info" />
            )}
          </Stack>
          {priceLines.length > 0 && (
            <p className={element("card-detail")}>{priceLines.join(" · ")}</p>
          )}
          {quantityLines.map((line) => (
            <p key={line} className={element("card-detail")}>
              {line}
            </p>
          ))}
        </Stack>
        <Stack row gap="0.25rem" className={element("card-actions")}>
          <IconButton
            icon={<IconUserInterfaceActionsEdit />}
            onClick={onEdit}
            ariaLabel="Editar extra"
          />
          <IconButton
            icon={<IconUserInterfaceActionsDelete />}
            onClick={onDelete}
            ariaLabel="Eliminar extra"
          />
        </Stack>
      </Stack>
      {error && (
        <div className={element("card-error")}>
          <InputError error={error} />
        </div>
      )}
    </div>
  );
};

export default ExtraCard;
