import { useMutation } from "@tanstack/react-query";

import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

import { AxiosError } from "axios";
import { authService } from "@/app/services/auth.service";
import { ErrorResponse, LoginPayload, LoginResponse } from "@/app/types/auth.type";
import { useAuthStore } from "@/app/store/auth.store";

export const useLogin = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const router = useRouter();
  return useMutation<LoginResponse, AxiosError<ErrorResponse>, LoginPayload>({
    mutationKey: ["login"],
    mutationFn: (payload: LoginPayload) => authService.login(payload),
    onSuccess: (data) => {
      setAuth({
        fullName: data.userInfo.fullName,
        role: data.userInfo.role,
        refreshToken: data.refreshToken,
        phone: data.userInfo.phone,
      });

     if (data.userInfo.role === "CUSTOMER") {
        router.replace("/home");
      } else if (data.userInfo.role === "ADMIN") {
        router.replace("/dashboard");
      }

      toast.success("Đăng nhập thành công!");
    },  
  });
};
