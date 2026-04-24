import { ZoneService } from "@/app/services/zone.service";
import { useInfiniteQuery } from "@tanstack/react-query";

type ZoneInfiniteFilter = {
  size: number;
  name?: string;
  branchId?: string;
  enabled?: boolean;
};

export const useGetAllZonesInfiniteQuery = (filter: ZoneInfiniteFilter) => {
  return useInfiniteQuery({
    queryKey: ["getAllZonesInfinite", filter],
    enabled: filter.enabled ?? true,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      ZoneService.getAllZones({
        page: pageParam,
        size: filter.size,
        name: filter.name,
        branchId: filter.branchId,
      }),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
  });
};
