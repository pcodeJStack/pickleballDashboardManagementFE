import { BranchService } from "@/app/services/branch.service";
import { useQuery } from "@tanstack/react-query";
type BranchFilter = {
  page: number;
  size: number;
  name?: string;
  address?: string;
  phone?: string;
};
export const useGetAllBranchesQuery = (filter: BranchFilter) => {
  return useQuery({
    queryKey: ["getAllBranches", filter],
    queryFn: () => BranchService.getAllBranches(filter.page, filter.size, filter.name, filter.address, filter.phone),
  });
}
