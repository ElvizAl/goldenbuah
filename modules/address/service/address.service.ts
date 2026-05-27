"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import prisma from "@/shared/lib/prisma";
import { getUser } from "@/modules/auth/auth-session";
import { addressSchema } from "@/modules/address/schema/address.schema";

export async function getMyAddresses() {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      message: "Anda belum login.",
      data: [],
    };
  }

  try {
    const addresses = await prisma.address.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [
        {
          isDefault: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });

    return {
      success: true,
      message: "Alamat berhasil dimuat.",
      data: addresses,
    };
  } catch (error) {
    console.error("Get addresses error:", error);

    return {
      success: false,
      message: "Gagal memuat alamat.",
      data: [],
    };
  }
}

export async function createAddressAction(formData: FormData) {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      message: "Anda belum login.",
    };
  }

  const rawData = {
    label: formData.get("label"),
    recipientName: formData.get("recipientName"),
    phone: formData.get("phone"),
    fullAddress: formData.get("fullAddress"),

    provinceId: formData.get("provinceId"),
    provinceName: formData.get("provinceName"),

    cityId: formData.get("cityId"),
    cityName: formData.get("cityName"),

    districtId: formData.get("districtId"),
    districtName: formData.get("districtName"),

    subdistrictId: formData.get("subdistrictId") || null,
    subdistrictName: formData.get("subdistrictName") || null,

    postalCode: formData.get("postalCode") || null,
    isDefault: formData.get("isDefault") === "true",
  };

  const validated = addressSchema.safeParse(rawData);

  if (!validated.success) {
    const flattenedErrors = z.flattenError(validated.error);

    return {
      success: false,
      message: "Validasi gagal.",
      errors: flattenedErrors.fieldErrors,
    };
  }

  const data = validated.data;

  try {
    await prisma.$transaction(async (tx) => {
      const addressCount = await tx.address.count({
        where: {
          userId: user.id,
        },
      });

      const shouldBeDefault = addressCount === 0 || data.isDefault === true;

      if (shouldBeDefault) {
        await tx.address.updateMany({
          where: {
            userId: user.id,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        });
      }

      await tx.address.create({
        data: {
          userId: user.id,

          label: data.label,
          recipientName: data.recipientName,
          phone: data.phone,
          fullAddress: data.fullAddress,

          provinceId: data.provinceId,
          provinceName: data.provinceName,

          cityId: data.cityId,
          cityName: data.cityName,

          districtId: data.districtId,
          districtName: data.districtName,

          subdistrictId: data.subdistrictId,
          subdistrictName: data.subdistrictName,

          postalCode: data.postalCode,
          isDefault: shouldBeDefault,
        },
      });
    });

    revalidatePath("/profile/address");

    return {
      success: true,
      message: "Alamat berhasil ditambahkan.",
    };
  } catch (error) {
    console.error("Create address error:", error);

    return {
      success: false,
      message: "Gagal menambahkan alamat.",
    };
  }
}

export async function updateAddressAction(addressId: string, formData: FormData) {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      message: "Anda belum login.",
    };
  }

  if (!addressId) {
    return {
      success: false,
      message: "Alamat tidak ditemukan.",
    };
  }

  const rawData = {
    label: formData.get("label"),
    recipientName: formData.get("recipientName"),
    phone: formData.get("phone"),
    fullAddress: formData.get("fullAddress"),

    provinceId: formData.get("provinceId"),
    provinceName: formData.get("provinceName"),

    cityId: formData.get("cityId"),
    cityName: formData.get("cityName"),

    districtId: formData.get("districtId"),
    districtName: formData.get("districtName"),

    subdistrictId: formData.get("subdistrictId") || null,
    subdistrictName: formData.get("subdistrictName") || null,

    postalCode: formData.get("postalCode") || null,
    isDefault: formData.get("isDefault") === "true",
  };

  const validated = addressSchema.safeParse(rawData);

  if (!validated.success) {
    const flattenedErrors = z.flattenError(validated.error);

    return {
      success: false,
      message: "Validasi gagal.",
      errors: flattenedErrors.fieldErrors,
    };
  }

  const data = validated.data;

  try {
    const existingAddress = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: user.id,
      },
    });

    if (!existingAddress) {
      return {
        success: false,
        message: "Alamat tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: {
            userId: user.id,
            isDefault: true,
            NOT: {
              id: addressId,
            },
          },
          data: {
            isDefault: false,
          },
        });
      }

      await tx.address.update({
        where: {
          id: addressId,
        },
        data: {
          label: data.label,
          recipientName: data.recipientName,
          phone: data.phone,
          fullAddress: data.fullAddress,

          provinceId: data.provinceId,
          provinceName: data.provinceName,

          cityId: data.cityId,
          cityName: data.cityName,

          districtId: data.districtId,
          districtName: data.districtName,

          subdistrictId: data.subdistrictId,
          subdistrictName: data.subdistrictName,

          postalCode: data.postalCode,
          isDefault: data.isDefault ?? false,
        },
      });
    });

    revalidatePath("/profile/address");

    return {
      success: true,
      message: "Alamat berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Update address error:", error);

    return {
      success: false,
      message: "Gagal memperbarui alamat.",
    };
  }
}

export async function deleteAddressAction(addressId: string) {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      message: "Anda belum login.",
    };
  }

  if (!addressId) {
    return {
      success: false,
      message: "Alamat tidak ditemukan.",
    };
  }

  try {
    const address = await prisma.address.findFirst({
      where: {
        id: addressId,
        userId: user.id,
      },
    });

    if (!address) {
      return {
        success: false,
        message: "Alamat tidak ditemukan.",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.address.delete({
        where: {
          id: addressId,
        },
      });

      if (address.isDefault) {
        const nextAddress = await tx.address.findFirst({
          where: {
            userId: user.id,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        if (nextAddress) {
          await tx.address.update({
            where: {
              id: nextAddress.id,
            },
            data: {
              isDefault: true,
            },
          });
        }
      }
    });

    revalidatePath("/profile/address");

    return {
      success: true,
      message: "Alamat berhasil dihapus.",
    };
  } catch (error) {
    console.error("Delete address error:", error);

    return {
      success: false,
      message: "Gagal menghapus alamat.",
    };
  }
}