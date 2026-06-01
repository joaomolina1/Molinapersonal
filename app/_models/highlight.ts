import {
  HIGHLIGHT_MODES,
  HIGHLIGHT_STATUSES,
  HighlightMode,
  HighlightStatus,
} from "@/_constants/highlights";
import { useFetch } from "@/_services/api";
import { CalendarDate, parseDate, today } from "@internationalized/date";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export class Highlight {
  constructor(data: any) {
    Object.assign(this, data);

    this.from = parseDate(data.from as string);
    this.to = parseDate(data.to as string);
  }

  id!: string;
  createdAt!: string;
  updatedAt!: string;

  spaceID!: string;
  from!: CalendarDate;
  to!: CalendarDate;
  mode!: HighlightMode;
  priority!: number;
  recommended!: boolean;

  get status() {
    const isActive =
      this.from.compare(today("Europe/Lisbon")) <= 0 &&
      this.to.compare(today("Europe/Lisbon")) >= 0;

    return (isActive ? "active" : "inactive") satisfies HighlightStatus;
  }

  get statusWording() {
    return HIGHLIGHT_STATUSES.find((status) => status.id === this.status);
  }

  get modeWording() {
    return HIGHLIGHT_MODES.find((mode) => mode.id === this.mode);
  }

  get fromDate() {
    return this.from.toDate("Europe/Lisbon");
  }

  get toDate() {
    return this.to.toDate("Europe/Lisbon");
  }
}

export const useHighlights = () => {
  const fetchApi = useFetch();

  return useQuery<Highlight[]>({
    queryKey: ["highlights"],
    queryFn: () =>
      fetchApi("highlights").then((highlights: any[]) =>
        highlights.map((highlight) => new Highlight(highlight)),
      ),
  });
};

type CreateHighlightBody = Pick<
  Highlight,
  "spaceID" | "priority" | "mode" | "recommended"
> & {
  from: string;
  to: string;
};

export const useCreateHighlight = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<Highlight, unknown, CreateHighlightBody>({
    mutationFn: (body) =>
      fetchApi("highlights", "", { method: "POST", body }).then(
        (highlight) => new Highlight(highlight),
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
    },
  });
};

export const useUpdateHighlight = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<
    unknown,
    unknown,
    { id: string; body: CreateHighlightBody }
  >({
    mutationFn: ({ id, body }) =>
      fetchApi("highlights", id, { method: "PUT", body }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["highlights"] });
    },
  });
};
