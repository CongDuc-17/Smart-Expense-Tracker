import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().min(1, "Vui lòng nhập họ và tên"),
    email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordEmailSchema = z.object({
  email: z.string().min(1, "Vui lòng nhập email").email("Email không hợp lệ"),
});

export type ForgotPasswordEmailFormData = z.infer<typeof forgotPasswordEmailSchema>;

export const resetPasswordSchema = z
  .object({
    otp: z.string().length(6, "OTP phải có đúng 6 ký tự"),
    newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
