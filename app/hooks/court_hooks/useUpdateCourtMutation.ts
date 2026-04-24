import { CourtService, UpdateCourtPayload } from "@/app/services/court.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useUpdateCourtMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCourtPayload) => CourtService.updateCourt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllCourts"] });
      toast.success("Cập nhật sân thành công");
    },
    onError: (error: any) => {
      const rawMessage = error?.response?.data?.message?.message;
      const message =
        typeof rawMessage === "string" ? rawMessage : "Cập nhật sân thất bại";
      toast.error(message);
    },
  });
};
