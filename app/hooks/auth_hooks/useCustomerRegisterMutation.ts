import { useMutation } from "@tanstack/react-query";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { AxiosError } from "axios";
import { authService } from "@/app/services/auth.service";
import {
  CustomerRegisterPayload,
  CustomerRegisterResponse,
  ErrorResponse,
} from "@/app/types/auth.type";

export const useCustomerRegisterMutation = () => {
  // const router = useRouter();

  return useMutation<
    CustomerRegisterResponse,
    AxiosError<ErrorResponse>,
    CustomerRegisterPayload
  >({
    mutationKey: ["customer-register"],
    mutationFn: (payload) => authService.customerRegister(payload),
    onSuccess: (data) => {
      toast.success(data.message || "Đăng ký thành công. Vui lòng đăng nhập.");
    },
  });
};
