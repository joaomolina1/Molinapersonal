import { useFetch } from "@/_services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export class Payment {
  constructor(data: any) {
    Object.assign(this, data);
  }

  id!: string;

  bookingID!: string;
  status!: PaymentStatus;
}

type PaymentStatus = "paid" | "pending" | "cancelled";

export const usePayment = (id?: string) => {
  const fetchApi = useFetch();

  return useQuery<Payment>({
    queryKey: ["payments", id],
    queryFn: () =>
      fetchApi("payments", id).then((payment: any) => new Payment(payment)),
    enabled: !!id,
  });
};

export const useCancelPayment = () => {
  const fetchApi = useFetch();
  const queryClient = useQueryClient();

  return useMutation<void, unknown, { id: string }>({
    mutationFn: ({ id }) =>
      fetchApi("payments", `${id}/cancel`, { method: "PUT" }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
};
