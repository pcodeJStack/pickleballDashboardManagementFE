import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

import { authService } from "@/app/services/auth.service";
import { ErrorResponse, LogoutResponse } from "@/app/types/auth.type";

export const useLogoutMutation = () =>
  useMutation<LogoutResponse, AxiosError<ErrorResponse>>({
    mutationKey: ["logout"],
    mutationFn: () => authService.logout(),
    onSuccess: (data) => {
      toast.success(data.message || "Đăng xuất thành công.");
    },
  });
