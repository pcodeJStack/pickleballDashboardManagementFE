import { CourtService, CreateCourtPayload } from "@/app/services/court.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useCreateNewCourtMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourtPayload) => CourtService.createCourt(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllCourts"] });
      toast.success("Tạo sân thành công");
    },
    onError: (error: any) => {
      const rawMessage = error?.response?.data?.message?.message;
      const message =
        typeof rawMessage === "string" ? rawMessage : "Tạo sân thất bại";
      toast.error(message);
    },
  });
};
