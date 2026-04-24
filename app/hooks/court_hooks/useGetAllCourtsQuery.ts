import { CourtService, GetAllCourtsFilter } from "@/app/services/court.service";
import { useQuery } from "@tanstack/react-query";

export const useGetAllCourtsQuery = (filter: GetAllCourtsFilter) => {
  return useQuery({
    queryKey: ["getAllCourts", filter],
    queryFn: () => CourtService.getAllCourts(filter),
    enabled: Boolean(filter.branchId),
  });
};
