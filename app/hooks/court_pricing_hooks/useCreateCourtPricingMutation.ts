import {
  CourtPricingService,
  CreateCourtPricingPayload,
} from "@/app/services/court-pricing.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useCreateCourtPricingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourtPricingPayload) =>
      CourtPricingService.createCourtPricing(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllCourtPricings"] });
      toast.success("Thiết lập giá sân thành công");
    },
    onError: (error: any) => {
      const rawMessage =
        error?.response?.data?.message?.message || error?.response?.data?.message;
      const message =
        typeof rawMessage === "string"
          ? rawMessage
          : "Thiết lập giá sân thất bại";
      toast.error(message);
    },
  });
};
