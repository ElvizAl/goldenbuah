"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import prisma from "@/shared/lib/prisma";
import { getUser } from "@/modules/auth/auth-session";
import { profileSchema } from "@/modules/profile/schema/profile.schema";

export async function getMyProfile() {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      message: "Anda belum login.",
      data: null,
    };
  }

  try {
    const profile = await prisma.profile.findUnique({
      where: {
        userId: user.id,
      },
    });

    return {
      success: true,
      message: "Profil berhasil dimuat.",
      data: profile,
    };
  } catch (error) {
    console.error("Get profile error:", error);

    return {
      success: false,
      message: "Gagal memuat profil.",
      data: null,
    };
  }
}

export async function createMyProfileAction(formData: FormData) {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      message: "Anda belum login.",
    };
  }

  const rawData = {
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    gender: formData.get("gender"),
    birthDate: formData.get("birthDate"),
  };

  const validated = profileSchema.safeParse(rawData);

  if (!validated.success) {
    const flattenedErrors = z.flattenError(validated.error);

    return {
      success: false,
      message: "Validasi gagal.",
      errors: flattenedErrors.fieldErrors,
    };
  }

  const { fullName, phone, gender, birthDate } = validated.data;

  try {
    const existingProfile = await prisma.profile.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (existingProfile) {
      return {
        success: false,
        message: "Profil sudah pernah dibuat.",
      };
    }

    await prisma.profile.create({
      data: {
        userId: user.id,
        fullName,
        phone,
        gender,
        birthDate: new Date(birthDate),
      },
    });

    revalidatePath("/profile");

    return {
      success: true,
      message: "Profil berhasil dibuat.",
    };
  } catch (error) {
    console.error("Create profile error:", error);

    return {
      success: false,
      message: "Gagal membuat profil.",
    };
  }
}

export async function updateMyProfileAction(formData: FormData) {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      message: "Anda belum login.",
    };
  }

  const rawData = {
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    gender: formData.get("gender"),
    birthDate: formData.get("birthDate"),
  };

  const validated = profileSchema.safeParse(rawData);

  if (!validated.success) {
    const flattenedErrors = z.flattenError(validated.error);

    return {
      success: false,
      message: "Validasi gagal.",
      errors: flattenedErrors.fieldErrors,
    };
  }

  const { fullName, phone, gender, birthDate } = validated.data;

  try {
    await prisma.profile.update({
      where: {
        userId: user.id,
      },
      data: {
        fullName,
        phone,
        gender,
        birthDate: new Date(birthDate),
      },
    });

    revalidatePath("/profile");

    return {
      success: true,
      message: "Profil berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Update profile error:", error);

    return {
      success: false,
      message: "Gagal memperbarui profil.",
    };
  }
}