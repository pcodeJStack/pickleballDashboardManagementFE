import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { AxiosError } from "axios";

import { authService } from "@/app/services/auth.service";
import {
  ErrorResponse,
  ResendOtpPayload,
  ResendOtpResponse,
} from "@/app/types/auth.type";

export const useResendOtpMutation = () =>
  useMutation<ResendOtpResponse, AxiosError<ErrorResponse>, ResendOtpPayload>({
    mutationKey: ["resend-otp"],
    mutationFn: (payload) => authService.resendOtp(payload),
    onSuccess: (data) => {
      toast.success(data.message || "Đã gửi lại OTP. Vui lòng kiểm tra email.");
    },
  });
