import { axiosClient } from "../lib/axiosClient";
import { LoginPayload } from "../types/auth.type";

export const authService = {
  login: async ({ email, password, deviceId, deviceInfo }: LoginPayload) => {
    const res = await axiosClient.post("/auth/login", { email, password, deviceId, deviceInfo }, {
      withCredentials: true,
    });
    return res.data;
  }
};