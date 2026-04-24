
import { BranchService, UpdateBranchPayload } from "@/app/services/branch.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useUpdateBranchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBranchPayload) =>
      BranchService.updateBranch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllBranches"] });
      toast.success("Cập nhật chi nhánh thành công");
    },
    onError: (error: any) => {
      
      const rawMessage = error?.response?.data?.message?.message;
      const message = typeof rawMessage === "string" ? rawMessage : "Cập nhật chi nhánh thất bại";
      toast.error(message);
    },

  });
};