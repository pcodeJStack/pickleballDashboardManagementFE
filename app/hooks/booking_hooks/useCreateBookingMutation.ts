import { BookingService, BookingResponse, CreateBookingPayload } from "@/app/services/booking.service";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
type ErrorResponse = {
  message?: string;
  data?: Record<string, string>;
};
export const useCreateBookingMutation = () => {
  return useMutation<BookingResponse, AxiosError<ErrorResponse>, CreateBookingPayload>({
    mutationKey: ["createBooking"],
    mutationFn: (payload) => BookingService.createBooking(payload),
  });
};
