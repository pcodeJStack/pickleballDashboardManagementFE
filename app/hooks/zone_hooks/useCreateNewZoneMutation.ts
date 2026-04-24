import { CreateZonePayload, ZoneService } from "@/app/services/zone.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useCreateNewZoneMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateZonePayload) => ZoneService.createZone(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllZones"] });
      toast.success("Tạo khu vực thành công");
    },
    onError: (error: any) => {
      const rawMessage = error?.response?.data?.message?.message;
      const message =
        typeof rawMessage === "string" ? rawMessage : "Tạo khu vực thất bại";
      toast.error(message);
    },
  });
};
