import {
  CreateTimeSlotPayload,
  TimeSlotService,
} from "@/app/services/timeslot.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useCreateNewTimeSlotMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTimeSlotPayload) =>
      TimeSlotService.createTimeSlot(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllTimeSlots"] });
      toast.success("Tạo khung giờ thành công");
    },
    onError: (error: any) => {
      const rawMessage =
        error?.response?.data?.message?.message || error?.response?.data?.message;
      const message =
        typeof rawMessage === "string" ? rawMessage : "Tạo khung giờ thất bại";
      toast.error(message);
    },
  });
};
