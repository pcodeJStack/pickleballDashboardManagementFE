import { CourtService } from "@/app/services/court.service";
import { useInfiniteQuery } from "@tanstack/react-query";

type CourtInfiniteFilter = {
  size: number;
  branchId: string;
  zoneId?: string;
  name?: string;
  courtType?: string;
  surfaceType?: string;
  minPrice?: number;
  maxPrice?: number;
  courtStatus?: string;
  enabled?: boolean;
};

export const useGetAllCourtsInfiniteQuery = (filter: CourtInfiniteFilter) => {
  return useInfiniteQuery({
    queryKey: ["getAllCourtsInfinite", filter],
    enabled: filter.enabled ?? true,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      CourtService.getAllCourts({
        page: pageParam,
        size: filter.size,
        branchId: filter.branchId,
        zoneId: filter.zoneId,
        name: filter.name,
        courtType: filter.courtType,
        surfaceType: filter.surfaceType,
        minPrice: filter.minPrice,
        maxPrice: filter.maxPrice,
        courtStatus: filter.courtStatus,
      }),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
  });
};
