import { useQuery } from "@tanstack/react-query";
import { AvailableSlotsFilter, BookingService } from "@/app/services/booking.service";

export const useGetAvailableSlotsQuery = (
  filter: AvailableSlotsFilter,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["availableSlots", filter],
    queryFn: () => BookingService.getAvailableSlots(filter),
    enabled: enabled && Boolean(filter.courtId) && Boolean(filter.date),
  });
};
