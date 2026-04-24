import { GetAllZonesFilter, ZoneService } from "@/app/services/zone.service";
import { useQuery } from "@tanstack/react-query";

export const useGetAllZonesQuery = (
  filter: GetAllZonesFilter,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["getAllZones", filter],
    queryFn: () => ZoneService.getAllZones(filter),
    enabled,
  });
};
