"use server"

import prisma from "@/shared/lib/prisma"
import { revalidatePath } from "next/cache"
import { addressSchema } from "@/modules/address/schema/address.schema"
import { z } from "zod"

export async function getAllAddresses() {
  try {
    const addresses = await prisma.address.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return { success: true, data: addresses }
  } catch (error) {
    console.error("Gagal mendapatkan semua alamat:", error)
    return { success: false, message: "Terjadi kesalahan saat mengambil data alamat." }
  }
}

export async function adminDeleteAddress(addressId: string) {
  try {
    await prisma.address.delete({
      where: { id: addressId },
    })
    
    revalidatePath("/admin/dashboard/addresses")
    return { success: true, message: "Alamat pengiriman berhasil dihapus." }
  } catch (error) {
    console.error("Admin delete address error:", error)
    return { success: false, message: "Gagal menghapus alamat pengiriman." }
  }
}

export async function adminUpdateAddress(addressId: string, formData: FormData) {
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
    return { success: false, message: "Validasi gagal." };
  }

  const data = validated.data;

  try {
    const currentAddress = await prisma.address.findUnique({
      where: { id: addressId },
      select: { userId: true }
    })
    
    if (!currentAddress) {
       return { success: false, message: "Alamat tidak ditemukan." }
    }

    await prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: {
            userId: currentAddress.userId,
            isDefault: true,
            NOT: { id: addressId },
          },
          data: { isDefault: false },
        });
      }

      await tx.address.update({
        where: { id: addressId },
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

    revalidatePath("/admin/dashboard/addresses");
    return { success: true, message: "Alamat berhasil diperbarui." };
  } catch (error) {
    console.error("Admin update address error:", error);
    return { success: false, message: "Gagal memperbarui alamat." };
  }
}
