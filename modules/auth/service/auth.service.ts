"use server";

import z from "zod";
import { auth } from "../auth.config";
import { loginSchema, registerSchema } from "@/modules/auth/schema/auth.schema";
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

    return {
      success: true,
      message: "Register berhasil",
    };

  } catch (error) {
    console.error("Register error:", error);
    return {
      success: false,
      message: "Internal server error",
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