import * as z from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Nama minimal 3 karakter")
      .max(100, "Nama maksimal 100 karakter"),

    email: z
      .email("Format email tidak valid")
      .trim()
      .toLowerCase(),

    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, "Password harus memiliki minimal 1 huruf besar")
      .regex(/[a-z]/, "Password harus memiliki minimal 1 huruf kecil")
      .regex(/[0-9]/, "Password harus memiliki minimal 1 angka"),

    confirmPassword: z
      .string()
      .min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z
    .email("Format email tidak valid")
    .trim()
    .toLowerCase(),

  password: z
    .string()
    .min(1, "Password wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const verifyEmailSchema = z.object({
  email: z.email("Format email tidak valid").trim().toLowerCase(),
  otp: z
    .string()
    .trim()
    .min(4, "Kode OTP minimal 4 digit")
    .max(10, "Kode OTP tidak valid"),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const forgotPasswordSchema = z.object({
  email: z.email("Format email tidak valid").trim().toLowerCase(),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const verifyForgotPasswordOtpSchema = z.object({
  email: z.email("Format email tidak valid").trim().toLowerCase(),
  otp: z
    .string()
    .trim()
    .min(4, "Kode OTP minimal 4 digit")
    .max(10, "Kode OTP tidak valid"),
});

export type VerifyForgotPasswordOtpInput = z.infer<
  typeof verifyForgotPasswordOtpSchema
>;

export const resetPasswordSchema = z
  .object({
    email: z.email("Format email tidak valid").trim().toLowerCase(),
    otp: z
      .string()
      .trim()
      .min(4, "Kode OTP minimal 4 digit")
      .max(10, "Kode OTP tidak valid"),
    password: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, "Password harus memiliki minimal 1 huruf besar")
      .regex(/[a-z]/, "Password harus memiliki minimal 1 huruf kecil")
      .regex(/[0-9]/, "Password harus memiliki minimal 1 angka"),
    confirmPassword: z
      .string()
      .min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
