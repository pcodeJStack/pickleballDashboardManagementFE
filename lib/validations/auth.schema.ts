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
