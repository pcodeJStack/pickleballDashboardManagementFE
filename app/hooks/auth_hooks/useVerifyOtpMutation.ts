import { authService } from "@/app/services/auth.service";
import { ErrorResponse, VerifyOtpPayload, VerifyOtpResponse } from "@/app/types/auth.type";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

export const useVerifyOtpMutation = () => {
  const router = useRouter();
  return useMutation<VerifyOtpResponse, AxiosError<ErrorResponse>, VerifyOtpPayload>({
    mutationKey: ["verify-otp"],
    mutationFn: (payload) => authService.verifyOtp(payload),   
    onSuccess: (data) => {
      toast.success(data.message || "Xác thực OTP thành công. Vui lòng đăng nhập.");
      router.push("/customerLogin");
      },
    });
};
