"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import prisma from "@/shared/lib/prisma";
import { productSchema } from "@/modules/product/schema/product.schema";

export async function getFeaturedProducts(limit: number = 6) {
  try {
    const products = await prisma.product.findMany({
      where: {
        stock: {
          gt: 0,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
      },
      take: limit,
    });

    // Convert Decimal fields to plain numbers for Client Component serialization
    const serializedProducts = products.map((product) => ({
      ...product,
      price: Number(product.price),
    }));

    return {
      success: true,
      message: "Produk unggulan berhasil dimuat.",
      data: serializedProducts,
    };
  } catch (error) {
    console.error("Get featured products error:", error);

    return {
      success: false,
      message: "Gagal memuat produk unggulan.",
      data: [],
    };
  }
}

export async function getProducts(options?: { query?: string; categoryId?: string; page?: number; limit?: number }) {
  try {
    const page = options?.page || 1;
    const limit = options?.limit || 9; // Show 9 items per page (3x3 grid)
    const skip = (page - 1) * limit;

    const whereClause = {
      ...(options?.categoryId ? { categoryId: options.categoryId } : {}),
      ...(options?.query
        ? {
            OR: [
              { name: { contains: options.query, mode: "insensitive" as const } },
              { description: { contains: options.query, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [totalCount, products] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          category: true,
        },
        take: limit,
        skip: skip,
      })
    ]);

    // Convert Decimal fields to plain numbers for Client Component serialization
    const serializedProducts = products.map((product) => ({
      ...product,
      price: Number(product.price),
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return {
      success: true,
      message: "Produk berhasil dimuat.",
      data: serializedProducts,
      pagination: {
        totalItems: totalCount,
        totalPages: totalPages === 0 ? 1 : totalPages,
        currentPage: page,
      }
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
    revalidatePath("/");

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
    revalidatePath("/");

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
    revalidatePath("/");

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