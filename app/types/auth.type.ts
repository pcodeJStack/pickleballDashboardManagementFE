
export interface ErrorResponse {
  message: string
}
export interface ErrorResponse {
  message: string
}

// Verify OTP
export interface VerifyOtpPayload {
  email: string;
  otpInput: string;
}
export interface VerifyOtpResponse {
  message: string;
}

// Resend OTP
export interface ResendOtpPayload {
  email: string;
}
export interface ResendOtpResponse {
  message: string;
}

// LOGIN
export interface UserInfo {
    email: string;
    fullName: string;
    id: string;
    phone: string;
    role: "CUSTOMER" | "ADMIN";
}
export interface LoginPayload {
  email: string;
  password: string;
  deviceId: string;
  deviceInfo: string;
}
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  sessionId: string;
  message: string;
  userInfo: UserInfo;
}

export interface CustomerRegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone: string;
}

export interface CustomerRegisterResponse {
  code?: number;
  message: string;
  data?: Record<string, string>;
}