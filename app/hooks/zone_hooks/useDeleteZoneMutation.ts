import { ZoneService } from "@/app/services/zone.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useDeleteZoneMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ZoneService.deleteZone(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllZones"] });
      toast.success("Xóa khu vực thành công");
    },
    onError: (error: any) => {
      const rawMessage = error?.response?.data?.message;
      const message =
        typeof rawMessage === "string" ? rawMessage : "Xóa khu vực thất bại";
      toast.error(message);
    },
  });
};
