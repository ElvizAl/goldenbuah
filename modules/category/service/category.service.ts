"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import prisma from "@/shared/lib/prisma";
import { categorySchema } from "@/modules/category/schema/category.schema";

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return {
      success: true,
      message: "Kategori berhasil dimuat.",
      data: categories,
    };
  } catch (error) {
    console.error("Get categories error:", error);

    return {
      success: false,
      message: "Gagal memuat kategori.",
      data: [],
    };
  }
}

export async function createCategoryAction(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    imageUrl: formData.get("imageUrl") || null,
  };

  const validated = categorySchema.safeParse(rawData);

  if (!validated.success) {
    const flattenedErrors = z.flattenError(validated.error);

    return {
      success: false,
      message: "Validasi gagal.",
      errors: flattenedErrors.fieldErrors,
    };
  }

  try {
    await prisma.category.create({
      data: {
        name: validated.data.name,
        slug: validated.data.slug,
        imageUrl: validated.data.imageUrl,
      },
    });

    revalidatePath("/admin/dashboard/categories");
    revalidatePath("/admin/dashboard/products");

    return {
      success: true,
      message: "Kategori berhasil ditambahkan.",
    };
  } catch (error) {
    console.error("Create category error:", error);

    return {
      success: false,
      message: "Nama atau slug kategori sudah digunakan.",
    };
  }
}

export async function updateCategoryAction(
  categoryId: string,
  formData: FormData
) {
  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    imageUrl: formData.get("imageUrl") || null,
  };

  const validated = categorySchema.safeParse(rawData);

  if (!validated.success) {
    const flattenedErrors = z.flattenError(validated.error);

    return {
      success: false,
      message: "Validasi gagal.",
      errors: flattenedErrors.fieldErrors,
    };
  }

  try {
    await prisma.category.update({
      where: {
        id: categoryId,
      },
      data: {
        name: validated.data.name,
        slug: validated.data.slug,
        imageUrl: validated.data.imageUrl,
      },
    });

    revalidatePath("/admin/dashboard/categories");
    revalidatePath("/admin/dashboard/products");

    return {
      success: true,
      message: "Kategori berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Update category error:", error);

    return {
      success: false,
      message: "Gagal memperbarui kategori.",
    };
  }
}

export async function deleteCategoryAction(categoryId: string) {
  try {
    const productCount = await prisma.product.count({
      where: {
        categoryId,
      },
    });

    if (productCount > 0) {
      return {
        success: false,
        message: "Kategori tidak bisa dihapus karena masih memiliki produk.",
      };
    }

    await prisma.category.delete({
      where: {
        id: categoryId,
      },
    });

    revalidatePath("/admin/dashboard/categories");
    revalidatePath("/admin/dashboard/products");

    return {
      success: true,
      message: "Kategori berhasil dihapus.",
    };
  } catch (error) {
    console.error("Delete category error:", error);

    return {
      success: false,
      message: "Gagal menghapus kategori.",
    };
  }
}