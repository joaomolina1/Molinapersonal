import { PACK_FEATURES } from "@/_constants/pack/features";
import { SPACE_ACCESSIBILITIES } from "@/_constants/space/accessibilities";
import { SPACE_CATEGORIES_FLAT } from "@/_constants/space/categories";
import { SPACE_CATERING } from "@/_constants/space/catering";
import { SPACE_EVENT_TYPES_FLAT } from "@/_constants/space/eventTypes";
import { SPACE_FACILITIES_FLAT } from "@/_constants/space/facilities";
import { SPACE_KINDS } from "@/_constants/space/kinds";
import { SPACE_PRIVACIES } from "@/_constants/space/privacies";
import { SPACE_SOUND } from "@/_constants/space/sound";
import IconUserInterfaceMiscellaneousVenues from "@/_design_system/_icons/UserInterface/Miscellaneous/Venues.svg";
import { SERVICE_TYPES } from "@/_constants/space/serviceTypes";
import { Attribute } from "@/_models/search";

export const allEventTypeOptions = SPACE_EVENT_TYPES_FLAT.map(
  ({ id, label }) => ({
    id,
    text: label,
  }),
).sort((a, b) => a.text.localeCompare(b.text));

export type EventTypeOptions = typeof allEventTypeOptions;

export const getEventTypeOptions = (availableAttributes: Attribute[]) =>
  allEventTypeOptions.filter(({ id }) => availableAttributes.includes(id));

export const allAttributeFilters = [
  {
    label: "Incluído no evento",
    groups: PACK_FEATURES.map((group) => ({
      label: group.label,
      filters: group.chips,
      type: "checkbox" as const,
    })),
  },
  {
    label: "Características do espaço",
    groups: [
      {
        label: "Privacidade",
        filters: SPACE_PRIVACIES,
        type: "radio" as const,
      },
      {
        label: "Cobertura",
        filters: SPACE_KINDS,
        type: "radio" as const,
      },
      {
        label: "Catering & Bebidas",
        filters: SPACE_CATERING,
        type: "checkbox" as const,
      },
      {
        label: "Música",
        filters: SPACE_SOUND,
        type: "checkbox" as const,
      },
      {
        label: "Features do espaço",
        filters: SPACE_FACILITIES_FLAT,
        type: "checkbox" as const,
      },
      {
        label: "Acessibilidade do espaço",
        filters: SPACE_ACCESSIBILITIES,
        type: "checkbox" as const,
      },
    ],
  },
] as const;

export const allAttributeFiltersFlat = allAttributeFilters.flatMap((section) =>
  section.groups.flatMap((group) => group.filters.map((filter) => filter)),
);

export type AttributeFilters = typeof allAttributeFilters;
export type AttributeFilterKey =
  (typeof allAttributeFilters)[number]["groups"][number]["filters"][number]["id"];

export const getAttributeFilters = (availableAttributes: Attribute[]) =>
  allAttributeFilters
    .map((section) => ({
      ...section,
      groups: section.groups
        .map((group) => ({
          ...group,
          filters: group.filters.filter((filter) =>
            availableAttributes.includes(filter.id),
          ),
        }))
        .filter((group) => group.filters.length > 0),
    }))
    .filter((section) => section.groups.length > 0);

const allSpaceCategories = SPACE_CATEGORIES_FLAT.map(({ id, label, icon }) => ({
  id,
  label,
  icon,
}));

export const getAllSpaceCategories = (availableAttributes: Attribute[]) =>
  allSpaceCategories.filter(({ id }) => availableAttributes.includes(id));

export const getMainSpaceCategories = (availableAttributes: Attribute[]) =>
  allSpaceCategories
    .slice(0, 6)
    .filter(({ id }) => availableAttributes.includes(id));

export const getOtherSpaceCategories = (availableAttributes: Attribute[]) =>
  allSpaceCategories
    .slice(6)
    .filter(({ id }) => availableAttributes.includes(id));

export const getTabFilters = (availableAttributes: Attribute[]) => [
  {
    id: "all",
    label: "Todos",
    icon: <IconUserInterfaceMiscellaneousVenues />,
  } as const,
  ...getAllSpaceCategories(availableAttributes),
];

// Service categories (top-level service types) present in the catalogue,
// used as tab filters when searching services instead of spaces.
export const getServiceTabFilters = (availableAttributes: Attribute[]) => [
  {
    id: "all",
    label: "Todos",
    icon: <IconUserInterfaceMiscellaneousVenues />,
  } as const,
  ...SERVICE_TYPES.filter(({ id }) => availableAttributes.includes(id)).map(
    ({ id, label, icon }) => ({ id, label, icon }),
  ),
];

export type TabFilters = ReturnType<typeof getTabFilters>;
export type TabFilterKey =
  | ReturnType<typeof getTabFilters>[number]["id"]
  | ReturnType<typeof getServiceTabFilters>[number]["id"];
