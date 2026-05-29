"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import prisma from "@/shared/lib/prisma";
import { productSchema } from "@/modules/product/schema/product.schema";

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
      },
    });

    return {
      success: true,
      message: "Produk berhasil dimuat.",
      data: products,
    };
  } catch (error) {
    console.error("Get products error:", error);

    return {
      success: false,
      message: "Gagal memuat produk.",
      data: [],
    };
  }
}

export async function createProductAction(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    categoryId: formData.get("categoryId"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    imageUrl: formData.get("imageUrl") || null,
    description: formData.get("description") || null,
  };

  const validated = productSchema.safeParse(rawData);

  if (!validated.success) {
    const flattenedErrors = z.flattenError(validated.error);

    return {
      success: false,
      message: "Validasi gagal.",
      errors: flattenedErrors.fieldErrors,
    };
  }

  try {
    await prisma.product.create({
      data: {
        name: validated.data.name,
        slug: validated.data.slug,
        categoryId: validated.data.categoryId,
        price: validated.data.price,
        stock: validated.data.stock,
        imageUrl: validated.data.imageUrl,
        description: validated.data.description,
      },
    });

    revalidatePath("/admin/dashboard/products");

    return {
      success: true,
      message: "Produk berhasil ditambahkan.",
    };
  } catch (error) {
    console.error("Create product error:", error);

    return {
      success: false,
      message: "Slug produk sudah digunakan atau produk gagal ditambahkan.",
    };
  }
}

export async function updateProductAction(
  productId: string,
  formData: FormData
) {
  const rawData = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    categoryId: formData.get("categoryId"),
    price: formData.get("price"),
    stock: formData.get("stock"),
    imageUrl: formData.get("imageUrl") || null,
    description: formData.get("description") || null,
  };

  const validated = productSchema.safeParse(rawData);

  if (!validated.success) {
    const flattenedErrors = z.flattenError(validated.error);

    return {
      success: false,
      message: "Validasi gagal.",
      errors: flattenedErrors.fieldErrors,
    };
  }

  try {
    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        name: validated.data.name,
        slug: validated.data.slug,
        categoryId: validated.data.categoryId,
        price: validated.data.price,
        stock: validated.data.stock,
        imageUrl: validated.data.imageUrl,
        description: validated.data.description,
      },
    });

    revalidatePath("/admin/dashboard/products");

    return {
      success: true,
      message: "Produk berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Update product error:", error);

    return {
      success: false,
      message: "Gagal memperbarui produk.",
    };
  }
}

export async function deleteProductAction(productId: string) {
  try {
    await prisma.product.delete({
      where: {
        id: productId,
      },
    });

    revalidatePath("/admin/dashboard/products");

    return {
      success: true,
      message: "Produk berhasil dihapus.",
    };
  } catch (error) {
    console.error("Delete product error:", error);

    return {
      success: false,
      message: "Gagal menghapus produk.",
    };
  }
}