import { useFetch } from "@/_services/api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Status } from "@/_constants/status";
import { Journey } from "./venue";

export class DashboardItem {
  constructor(data: any) {
    Object.assign(this, data);
  }

  id!: string;
  reference!: string;
  venue!: string;
  space!: string;
  pack!: string;
  type!: DashboardItemType;
  commission?: number;
  status!: Status;
  journey!: Journey;
  modifiedAt!: string;
}

type DashboardQuery = {
  q?: string;
  type?: DashboardItemType;
  status?: Status;
  journey?: Journey;
  page?: number;
  page_size?: number;
  sort_by?: "reference" | "type" | "status" | "modified_at";
  ascending?: boolean;
};

export const useDashboardList = (query?: DashboardQuery) => {
  const fetchApi = useFetch();

  return useQuery<DashboardItem[]>({
    queryKey: ["dashboard-list", query],
    queryFn: () =>
      fetchApi("dashboard", undefined, undefined, undefined, query).then(
        (results: any[]) => results.map((item) => new DashboardItem(item)),
      ),
    placeholderData: keepPreviousData,
  });
};

export const DASHBOARD_ITEM_TYPES = [
  {
    id: "venues-venue",
    type: "venue",
    journey: "venues",
    text: "Locais",
    textOne: "Local",
  },
  {
    id: "venues-space",
    type: "space",
    journey: "venues",
    text: "Espaços",
    textOne: "Espaço",
  },
  {
    id: "venues-pack",
    type: "pack",
    journey: "venues",
    text: "Packs de Espaço",
    textOne: "Pack de Espaço",
  },
  {
    id: "services-venue",
    type: "venue",
    journey: "services",
    text: "Empresas",
    textOne: "Empresa",
  },
  {
    id: "services-space",
    type: "space",
    journey: "services",
    text: "Serviços",
    textOne: "Serviço",
  },
  {
    id: "services-pack",
    type: "pack",
    journey: "services",
    text: "Packs de Serviço",
    textOne: "Pack de Serviço",
  },
] as const;

export type DashboardItemTypeId = (typeof DASHBOARD_ITEM_TYPES)[number]["id"];
export type DashboardItemType = (typeof DASHBOARD_ITEM_TYPES)[number]["type"];
