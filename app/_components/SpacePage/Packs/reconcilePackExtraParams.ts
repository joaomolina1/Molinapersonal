import { Extra } from "@/(onboarding)/onboarding/_components/Step4/Extras/utils";
import { PackSearchHook } from "./PackSearch";
import { reconcileExtraSelection } from "@lib/extras/quantities";

export function reconcilePackExtraParams(
  packSearch: Pick<
    PackSearchHook,
    "extras" | "setExtraParams" | "start" | "end" | "numPeopleDebounced"
  >,
  allExtras: Extra[],
) {
  if (
    !packSearch.start ||
    !packSearch.end ||
    !packSearch.numPeopleDebounced
  ) {
    return;
  }

  const eventHours = packSearch.end.number - packSearch.start.number;
  const eventPax = packSearch.numPeopleDebounced;
  const selectedIds = new Set(
    allExtras
      .filter(
        (extra) =>
          extra.mandatory || packSearch.extras.includes(extra.id),
      )
      .map((extra) => extra.id),
  );

  packSearch.setExtraParams((prev) => {
    const nextParams = { ...prev };
    let changed = false;

    for (const extra of allExtras) {
      const isSelected = selectedIds.has(extra.id);

      if (!isSelected) {
        if (nextParams[extra.id]) {
          delete nextParams[extra.id];
          changed = true;
        }
        continue;
      }

      const current = nextParams[extra.id];
      const reconciled = reconcileExtraSelection(
        extra,
        current
          ? { id: extra.id, hours: current.hours, pax: current.pax }
          : undefined,
        eventHours,
        eventPax,
      );

      const nextHours = reconciled.hours ?? undefined;
      const nextPax = reconciled.pax ?? undefined;

      if (current?.hours !== nextHours || current?.pax !== nextPax) {
        nextParams[extra.id] = {
          hours: nextHours,
          pax: nextPax,
        };
        changed = true;
      }
    }

    return changed ? nextParams : prev;
  });
}
