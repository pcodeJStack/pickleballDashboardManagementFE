import { useQuery } from "@tanstack/react-query";

import { BookingService } from "@/app/services/booking.service";

export const useGetMyBookingsQuery = (page: number, size = 10, enabled = true) =>
  useQuery({
    queryKey: ["my-bookings", page, size],
    queryFn: () => BookingService.getMyBookings(page, size),
    enabled,
    staleTime: 1000 * 30,
  });
