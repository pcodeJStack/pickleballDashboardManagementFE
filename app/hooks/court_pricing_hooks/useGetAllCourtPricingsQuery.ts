import {
  CourtPricingService,
  GetAllCourtPricingsFilter,
} from "@/app/services/court-pricing.service";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const useGetAllCourtPricingsQuery = (
  filter: GetAllCourtPricingsFilter,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["getAllCourtPricings", filter],
    queryFn: () => CourtPricingService.getAllCourtPricings(filter),
    enabled,
    placeholderData: keepPreviousData,
  });
};
