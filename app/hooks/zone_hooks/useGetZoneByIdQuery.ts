import { ZoneService } from "@/app/services/zone.service";
import { useQuery } from "@tanstack/react-query";

export const useGetZoneByIdQuery = (id?: string) => {
  return useQuery({
    queryKey: ["getZoneById", id],
    queryFn: () => ZoneService.getZoneById(id as string),
    enabled: Boolean(id),
  });
};
