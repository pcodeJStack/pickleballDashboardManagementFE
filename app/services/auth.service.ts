import { axiosClient } from "../lib/axiosClient";
import {
  CustomerRegisterPayload,
  LoginPayload,
  ResendOtpPayload,
  VerifyOtpPayload,
} from "../types/auth.type";

export const authService = {
  login: async ({ email, password, deviceId, deviceInfo }: LoginPayload) => {
    const res = await axiosClient.post("/auth/login", { email, password, deviceId, deviceInfo }, {
      withCredentials: true,
    });
    return res.data;
  },
  verifyOtp: async ({ email, otpInput }: VerifyOtpPayload) => {
    const res = await axiosClient.post("/auth/verify-otp", { email, otpInput });
    return res.data;
  },
  resendOtp: async ({ email }: ResendOtpPayload) => {
    const res = await axiosClient.post("/auth/resend-otp", { email });
    return res.data;
  },
  customerRegister: async ({email,password,fullName,phone}: CustomerRegisterPayload) => {
    const res = await axiosClient.post("/auth/customer/register", {
      email,
      password,
      fullName,
      phone,
    });
    return res.data;
  },
};