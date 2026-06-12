import { BOOKING_KINDS, BookingKind } from "@/_constants/booking/kinds";
import { BOOKING_STATUSES, BookingStatus } from "@/_constants/booking/status";
import { PACK_CAPACITIES, PackCapacity } from "@/_constants/pack/capacities";
import { useFetch } from "@/_services/api";
import { TimeDuration } from "@/_utils/number";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDate, parseDate } from "@internationalized/date";

export type BookingServicePack = {
  packID: string;
  spaceID: string | null;
  packName: string;
  spaceName: string;
  amount: number;
  extraIDs: string[];
  extraParams: { id: string; hours?: number | null; pax?: number | null }[];
};

export class Booking {
  constructor(data: any) {
    Object.assign(this, data);

    this.start = data.start
      ? TimeDuration.fromString(data.start as string)
      : null;
    this.end = data.end ? TimeDuration.fromString(data.end as string) : null;
    this.date = parseDate(data.date as string);
    this.extraIDs = Array.isArray(data.extraIDs) ? data.extraIDs : [];
    this.extraParams = Array.isArray(data.extraParams) ? data.extraParams : [];
  }

  id!: string;

  spaceID!: string;
  packID!: string; // null

  userID!: string;
  source!: string | null; // ID of the import ical

  createdAt!: string;
  updatedAt!: string;

  start!: TimeDuration | null;
  end!: TimeDuration | null;
  date!: CalendarDate;

  kind!: BookingKind;
  numPeople!: number;
  layout!: PackCapacity["layout"];
  notes!: string;
  status!: BookingStatus;

  billingCountry!: string;
  billingName!: string;
  billingVAT!: string;
  billingAddress!: string;
  billingPostCode!: string;
  billingCity!: string;

  contactName!: string;
  contactPhoneExtension!: number;
  contactPhoneNumber!: number;
  contactEmail!: string;

  freeCancellationUntil!: string; // ISO Date

  totalAmount!: number;
  upfrontAmount!: number;
  upfrontPercentage!: number;
  commission!: number | null;
  extraIDs!: string[];
  extraParams!: { id: string; hours?: number | null; pax?: number | null }[];
  servicePacks?: BookingServicePack[];

  get shortId() {
    return this.id.slice(0, 8).toUpperCase();
  }

  get duration() {
    if (!this.end || !this.start) {
      return null;
    }

    return this.end.number - this.start.number;
  }

  get statusWording() {
    return BOOKING_STATUSES.find((status) => status.id === this.status)!;
  }

  get kindWording() {
    return BOOKING_KINDS.find((kind) => kind.id === this.kind)!;
  }

  get layoutWording() {
    return this.layout
      ? PACK_CAPACITIES.find((capacity) => capacity.id === this.layout)!
      : undefined;
  }

  get hasBillingData() {
    return (
      !!this.billingVAT ||
      !!this.billingName ||
      !!this.billingAddress ||
      !!this.billingPostCode ||
      !!this.billingCity ||
      !!this.billingCountry
    );
  }

  get contactPhone() {
    return this.contactPhoneExtension && this.contactPhoneNumber
      ? `+${this.contactPhoneExtension} ${this.contactPhoneNumber}`
      : null;
  }

  get dates() {
    if (!this.date || !this.start || !this.end) {
      return [];
    }

    const dates: {
      date: CalendarDate;
      start: TimeDuration;
      end: TimeDuration;
    }[] = [];

    let date =
      this.start.number < 6 ? this.date.subtract({ days: 1 }) : this.date;
    let start =
      this.start.number < 6
        ? TimeDuration.fromNumber(this.start.number + 24)
        : this.start;
    let endNumber =
      this.start.number < 6 ? this.end.number + 24 : this.end.number;
    let end =
      endNumber > 29.5
        ? TimeDuration.fromNumber(29.5)
        : TimeDuration.fromNumber(endNumber);

    let timeLeft = this.end.number - this.start.number;

    while (timeLeft > 0) {
      dates.push({
        date,
        start,
        end,
      });

      timeLeft = timeLeft - (end.number - start.number + 0.5);

      if (timeLeft > 0) {
        date = date.add({ days: 1 });
        start = TimeDuration.fromNumber(6);
        endNumber = 6 + timeLeft;
        end =
          endNumber > 29.5
            ? TimeDuration.fromNumber(29.5)
            : TimeDuration.fromNumber(endNumber);
      }
    }

    return dates;
  }
}

export const doBookingsOverlap = (booking1: Booking, booking2: Booking) => {
  return (
    booking1.date.compare(booking2.date) === 0 &&
    !!booking1.start &&
    !!booking2.start &&
    !!booking1.end &&
    !!booking2.end &&
    booking1.end.number >= booking2.start.number &&
    booking1.start.number <= booking2.end.number
  );
};

type CreateBookingBody = Pick<
  Booking,
  "spaceID" | "packID" | "layout" | "numPeople" | "kind"
> & {
  date: string; // ISO Date
  start: string; // TimeDuration string
  end: string; // TimeDuration string
  extras?: string[];
  extraParams?: { id: string; hours?: number | null; pax?: number | null }[];
  servicePacks?: {
    packID: string;
    extras?: string[];
    extraParams?: { id: string; hours?: number | null; pax?: number | null }[];
  }[];
};

export const useCreateBooking = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<string, unknown, CreateBookingBody>({
    mutationFn: (body) =>
      fetchApi(
        "bookings",
        "",
        { method: "POST", body },
        { contentType: "json", tokenAuthenticated: true, cookieAuthenticated: true },
      ).then((booking: { id: string }) => booking.id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

type CreateHostBookingBody = Pick<Booking, "spaceID" | "kind" | "status"> & {
  date: string; // ISO Date
  start: string; // TimeDuration string
  end: string; // TimeDuration string
} & Partial<
    Pick<
      Booking,
      | "notes"
      | "contactName"
      | "contactEmail"
      | "contactPhoneExtension"
      | "contactPhoneNumber"
      | "numPeople"
      | "totalAmount"
    >
  >;

export const useCreateHostBooking = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<string, unknown, CreateHostBookingBody>({
    mutationFn: (body) =>
      fetchApi("bookings", "", { method: "POST", body }).then(
        (booking: { id: string }) => booking.id,
      ),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

type UpdateBookingBody = Partial<Pick<Booking, "notes" | "status">>;

export const useUpdateBooking = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<Booking, unknown, { id: string; body: UpdateBookingBody }>(
    {
      mutationFn: ({ id, body }) =>
        fetchApi("bookings", id, { method: "PATCH", body }).then(
          (booking: any) => new Booking(booking),
        ),
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["bookings"] });
      },
    },
  );
};

export const useBooking = ({
  id,
  refetchIfInProgress,
}: {
  id?: string;
  refetchIfInProgress?: boolean;
}) => {
  const fetchApi = useFetch();

  return useQuery<Booking>({
    queryKey: ["bookings", id],
    queryFn: () =>
      fetchApi("bookings", id).then((booking: any) => new Booking(booking)),
    enabled: !!id,
    refetchInterval: (query) =>
      query.state.data?.status === "inProgress" && refetchIfInProgress
        ? 2000
        : false,
  });
};

type ListBookingsQuery = {
  space_id?: string[];
  date_from?: string;
  date_to?: string;
};

export const useBookings = (
  query?: ListBookingsQuery,
  options?: { enabled: boolean },
) => {
  const fetchApi = useFetch();

  return useQuery<Booking[]>({
    queryKey: ["bookings", query],
    queryFn: () =>
      fetchApi("bookings", undefined, undefined, undefined, query).then(
        (bookings: any[]) => bookings.map((booking) => new Booking(booking)),
      ),
    enabled: options?.enabled,
  });
};

type CheckoutBookingBody = Partial<
  Pick<
    Booking,
    | "contactName"
    | "contactEmail"
    | "contactPhoneExtension"
    | "contactPhoneNumber"
    | "billingCountry"
    | "billingName"
    | "billingVAT"
    | "billingAddress"
    | "billingCity"
    | "billingPostCode"
  >
>;

export const useCheckoutBooking = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<
    { paymentID: string; clientSecret: string },
    unknown,
    { id: string; body: CheckoutBookingBody }
  >({
    mutationFn: ({ id, body }) =>
      fetchApi("bookings", `${id}/checkout`, { method: "POST", body }),
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["bookings", id] });
    },
  });
};

export const useCancelBooking = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<void, unknown, { id: string }>({
    mutationFn: ({ id }) =>
      fetchApi("bookings", `${id}/cancel`, { method: "POST", keepalive: true }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

export const useUpdateBookingStatus = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<unknown, unknown, { id: string; status: BookingStatus }>({
    mutationFn: ({ id, status }) =>
      fetchApi("bookings", `${id}/status`, { method: "PUT", body: { status } }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};

export const usePublicBookings = (query: ListBookingsQuery) => {
  const fetchApi = useFetch();

  return useQuery<
    {
      start: TimeDuration | null;
      end: TimeDuration | null;
      date: CalendarDate;
    }[]
  >({
    queryKey: ["bookings", query],
    queryFn: () =>
      fetchApi("bookings", "events", undefined, undefined, query).then(
        (events: any[]) =>
          events.map((event) => ({
            date: parseDate(event.date as string),
            start: TimeDuration.fromString(event.start as string),
            end: TimeDuration.fromString(event.end as string),
          })),
      ),
  });
};
