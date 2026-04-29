import { PaymentService } from "@/app/services/payment.service";
import { useQuery } from "@tanstack/react-query";
export const usePollingPaymentStatus = ( orderCode: number | null, enabled = true) => {
  return useQuery({
    queryKey: ["paymentStatus", orderCode],
    queryFn: () => PaymentService.getPaymentStatus(orderCode!),
    enabled: !!orderCode && enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      if (status === "SUCCESS" || status === "PAID") {
        return false;
      }
      return 3000;
    },

    retry: false,
  });
};
