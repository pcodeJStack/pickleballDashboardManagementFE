import { CourtService } from "@/app/services/court.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useDeleteCourtMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => CourtService.deleteCourt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllCourts"] });
      toast.success("Xóa sân thành công");
    },
    onError: (error: any) => {
      const rawMessage = error?.response?.data?.message;
      const message =
        typeof rawMessage === "string" ? rawMessage : "Xóa sân thất bại";
      toast.error(message);
    },
  });
};
