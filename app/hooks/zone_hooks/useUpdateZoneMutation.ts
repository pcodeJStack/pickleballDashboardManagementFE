import { UpdateZonePayload, ZoneService } from "@/app/services/zone.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useUpdateZoneMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateZonePayload) => ZoneService.updateZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllZones"] });
      toast.success("Cập nhật khu vực thành công");
    },
    onError: (error: any) => {
      const rawMessage = error?.response?.data?.message;
      const message =
        typeof rawMessage === "string"
          ? rawMessage
          : "Cập nhật khu vực thất bại";
      toast.error(message);
    },
  });
};
