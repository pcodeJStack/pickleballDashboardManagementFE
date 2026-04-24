import { BranchService } from "@/app/services/branch.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useDeleteBranchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => BranchService.deleteBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllBranches"] });
      // queryClient.invalidateQueries({ queryKey: ["getAllBranchesInfinite"] });
      toast.success("Xóa chi nhánh thành công");
    },
    onError: (error: any) => {
      const rawMessage = error?.response?.data?.message;
      const message =
        typeof rawMessage === "string" ? rawMessage : "Xóa chi nhánh thất bại";
      toast.error(message);
    },
  });
};
