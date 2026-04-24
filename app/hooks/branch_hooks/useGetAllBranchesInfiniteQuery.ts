import { BranchService } from "@/app/services/branch.service";
import { useInfiniteQuery } from "@tanstack/react-query";

type BranchFilterBase = {
  size: number;
  name?: string;
  address?: string;
  phone?: string;
  enabled?: boolean;
};

export const useGetAllBranchesInfiniteQuery = (filter: BranchFilterBase) => {
  return useInfiniteQuery({
    queryKey: ["getAllBranchesInfinite", filter],
    enabled: filter.enabled ?? true,
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      BranchService.getAllBranches(
        pageParam,
        filter.size,
        filter.name,
        filter.address,
        filter.phone,
      ),
    getNextPageParam: (lastPage) => {
      const nextPage = lastPage.page + 1;
      return nextPage < lastPage.totalPages ? nextPage : undefined;
    },
  });
};
