"use server";

import z from "zod";
import { auth } from "../auth.config";
import { forgotPasswordSchema, loginSchema, registerSchema, verifyEmailSchema, verifyForgotPasswordOtpSchema, resetPasswordSchema } from "@/modules/auth/schema/auth.schema";
import prisma from "@/shared/lib/prisma";

export async function registerAction(
  formData: FormData
) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  }

  const validated = registerSchema.safeParse(rawData)

  if (!validated.success) {
    const flattenedErrors = z.flattenError(validated.error)

    return {
      success: false,
      message: "Validasi gagal",
      errors: flattenedErrors.fieldErrors,
    };
  }

  const { name, email, password } = validated.data

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return {
      success: false,
      message: "Email sudah terdaftar.",
    };
  }

  try {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
      },
    });

    await auth.api.sendVerificationOTP({
      body: {
        email,
        type: "email-verification",
      },
    });

    return {
      success: true,
      message: "Akun berhasil dibuat. Kode OTP sudah dikirim ke email.",
    };

  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      message: "Register gagal. Silakan coba lagi.",
    };
  }
}

export async function loginAction(formData: FormData) {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const validated = loginSchema.safeParse(rawData);

  if (!validated.success) {
    const flattenedErrors = z.flattenError(validated.error);

    return {
      success: false,
      message: "Validasi gagal",
      errors: flattenedErrors.fieldErrors,
    };
  }

  const { email, password } = validated.data;

  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!existingUser) {
    return {
      success: false,
      message: "Email belum terdaftar.",
    };
  }

 if (!existingUser.emailVerified) {
    return {
      success: false,
      message: "Email belum terverifikasi. Silakan verifikasi email Anda.",
    };
  }

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
    });

    return {
      success: true,
      message: "Login berhasil",
    };

  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "Email atau password salah.",
    };
  }
}

export async function verifyEmailOtpAction(
  formData: FormData
) {
  const rawData = {
    email: formData.get("email"),
    otp: formData.get("otp"),
  };

  const validated = verifyEmailSchema.safeParse(rawData);

  if (!validated.success) {
    const flattenedErrors = z.flattenError(validated.error);

    return {
      success: false,
      message: "Validasi gagal",
      errors: flattenedErrors.fieldErrors,
    };
  }

  const { email, otp } = validated.data;

  try {
    await auth.api.checkVerificationOTP({
      body: {
        email,
        otp,
        type: "email-verification",
      },
    });

    return {
      success: true,
      message: "Email berhasil diverifikasi. Silakan login.",
    };
  } catch (error) {
    console.error("Verify email OTP error:", error);

    return {
      success: false,
      message: "Kode OTP salah atau sudah kedaluwarsa.",
    };
  }
}

export async function resendEmailVerificationOtpAction(
  email: string
) {
  if (!email) {
    return {
      success: false,
      message: "Email tidak ditemukan.",
    };
  }

  try {
    await auth.api.sendVerificationOTP({
      body: {
        email,
        type: "email-verification",
      },
    });

    return {
      success: true,
      message: "Kode OTP berhasil dikirim ulang.",
    };
  } catch (error) {
    console.error("Resend email verification OTP error:", error);

    return {
      success: false,
      message: "Gagal mengirim ulang kode OTP.",
    };
  }
}

export async function forgotPasswordAction(
  formData: FormData
) {
  const rawData = {
    email: formData.get("email"),
  };

  const validated = forgotPasswordSchema.safeParse(rawData);

  if (!validated.success) {
    const flattenedErrors = z.flattenError(validated.error);

    return {
      success: false,
      message: "Validasi gagal",
      errors: flattenedErrors.fieldErrors,
    };
  }

  const { email } = validated.data;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingUser) {
    return {
      success: false,
      message: "Email tidak ditemukan.",
    };
  }

  try {
    await auth.api.sendVerificationOTP({
      body: {
        email,
        type: "forget-password",
      },
    });

    return {
      success: true,
      message: "Kode reset password berhasil dikirim ke email.",
    };
  } catch (error) {
    console.error("Forgot password error:", error);

    return {
      success: false,
      message: "Gagal mengirim kode reset password.",
    };
  }
}

export async function verifyForgotPasswordOtpAction(
  formData: FormData
) {
  const rawData = {
    email: formData.get("email"),
    otp: formData.get("otp"),
  };

  const validated = verifyForgotPasswordOtpSchema.safeParse(rawData);

  if (!validated.success) {
    const flattenedErrors = z.flattenError(validated.error);

    return {
      success: false,
      message: "Validasi gagal",
      errors: flattenedErrors.fieldErrors,
    };
  }

  const { email, otp } = validated.data;

  try {
    await auth.api.checkVerificationOTP({
      body: {
        email,
        otp,
        type: "forget-password",
      },
    });

    return {
      success: true,
      message: "Kode OTP valid.",
    };
  } catch (error) {
    console.error("Verify forgot password OTP error:", error);

    return {
      success: false,
      message: "Kode OTP salah atau sudah kedaluwarsa.",
    };
  }
}

export async function resetPasswordWithOtpAction(
  formData: FormData
) {
  const rawData = {
    email: formData.get("email"),
    otp: formData.get("otp"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const validated = resetPasswordSchema.safeParse(rawData);

  if (!validated.success) {
    const flattenedErrors = z.flattenError(validated.error);

    return {
      success: false,
      message: "Validasi gagal",
      errors: flattenedErrors.fieldErrors,
    };
  }

  const { email, otp, password} = validated.data;

  try {
    // 1. Verifikasi OTP sekali lagi sebelum mengizinkan update
    await auth.api.checkVerificationOTP({
      body: {
        email,
        otp,
        type: "forget-password",
      },
    });

    await auth.api.resetPasswordEmailOTP({
      body: {
        email,
        otp,
        password,
      },
    });

    return {
      success: true,
      message: "Kata sandi berhasil diperbarui. Silakan login dengan kata sandi baru Anda.",
    };
  } catch (error) {
    console.error("Reset password with OTP error:", error);

    return {
      success: false,
      message: "Gagal mereset kata sandi. Pastikan kode OTP benar atau belum kedaluwarsa.",
    };
  }
}
