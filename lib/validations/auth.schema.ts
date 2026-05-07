import z from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email.")
    .email("Email không hợp lệ."),

  password: z
    .string()
    .min(6, "Mật khẩu tối thiểu 6 ký tự.")
    .regex(/[A-Z]/, "Phải có ít nhất 1 chữ in hoa.")
    .regex(/[0-9]/, "Phải có ít nhất 1 số.")
    .regex(/[^A-Za-z0-9]/, "Phải có ít nhất 1 ký tự đặc biệt."),
});

export const customerRegisterSchema = z
  .object({
    fullName: z
      .string()
      .min(2, "Họ tên tối thiểu 2 ký tự.")
      .max(100, "Họ tên không vượt quá 100 ký tự."),
    phone: z
      .string()
      .regex(/^[0-9]{10,11}$/, "Số điện thoại phải gồm 10-11 chữ số."),
    email: z
      .string()
      .min(1, "Vui lòng nhập email.")
      .email("Email không hợp lệ."),
    password: z
      .string()
      .min(6, "Mật khẩu tối thiểu 6 ký tự.")
      .regex(/[A-Z]/, "Phải có ít nhất 1 chữ in hoa.")
      .regex(/[0-9]/, "Phải có ít nhất 1 số.")
      .regex(/[^A-Za-z0-9]/, "Phải có ít nhất 1 ký tự đặc biệt.")
  });

export const verifyOtpSchema = z.object({
  email: z
    .string()
    .min(1, "Vui lòng nhập email.")
    .email("Email không hợp lệ."),
  otpInput: z
    .string()
    .min(6, "OTP gồm 6 ký tự.")
    .max(6, "OTP gồm 6 ký tự.")
    .regex(/^[0-9]{6}$/, "OTP chỉ gồm 6 chữ số."),
});
