
import { BranchService, CreateBranchPayload } from "@/app/services/branch.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useCreateNewBranchMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBranchPayload) =>
      BranchService.createBranch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["getAllBranches"] });
      // queryClient.invalidateQueries({ queryKey: ["getAllBranchesInfinite"] });
      toast.success("Tạo chi nhánh thành công");
    },
    onError: (error: any) => {
      const rawMessage = error?.response?.data?.message?.message;
      const message = typeof rawMessage === "string" ? rawMessage : "Tạo chi nhánh thất bại";
      toast.error(message);
    },

  });
};