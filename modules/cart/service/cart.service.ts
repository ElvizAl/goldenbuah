"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

import prisma from "@/shared/lib/prisma";
import { getUser } from "@/modules/auth/auth-session";
import { addToCartSchema, updateCartItemSchema } from "@/modules/cart/schema/cart.schema";

// ─── Helper: pastikan cart user sudah ada ──────────────────────────────────
async function ensureCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
    });
  }

  return cart;
}

// ─── Get Cart ──────────────────────────────────────────────────────────────
export async function getMyCart() {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      message: "Anda belum login.",
      data: null,
    };
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!cart) {
      return {
        success: true,
        message: "Keranjang kosong.",
        data: { id: "", userId: user.id, items: [], createdAt: new Date(), updatedAt: new Date() },
      };
    }

    // Serialize Decimal
    const serialized = {
      ...cart,
      items: cart.items.map((item) => ({
        ...item,
        product: {
          ...item.product,
          price: Number(item.product.price),
        },
      })),
    };

    return {
      success: true,
      message: "Keranjang berhasil dimuat.",
      data: serialized,
    };
  } catch (error) {
    console.error("Get cart error:", error);

    return {
      success: false,
      message: "Gagal memuat keranjang.",
      data: null,
    };
  }
}

// ─── Add to Cart ──────────────────────────────────────────────────────────
export async function addToCartAction(formData: FormData) {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      message: "Anda belum login.",
    };
  }

  const rawData = {
    productId: formData.get("productId"),
    quantity: formData.get("quantity") ?? 1,
  };

  const validated = addToCartSchema.safeParse(rawData);

  if (!validated.success) {
    const flattenedErrors = z.flattenError(validated.error);

    return {
      success: false,
      message: "Validasi gagal.",
      errors: flattenedErrors.fieldErrors,
    };
  }

  const { productId, quantity } = validated.data;

  try {
    // Cek produk ada & stok cukup
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.isActive) {
      return {
        success: false,
        message: "Produk tidak ditemukan atau tidak tersedia.",
      };
    }

    await prisma.$transaction(async (tx) => {
      const cart = await ensureCart(user.id);

      const existingItem = await tx.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId } },
      });

      if (existingItem) {
        const newQty = existingItem.quantity + quantity;

        if (newQty > product.stock) {
          throw new Error(`Stok tidak cukup. Stok tersedia: ${product.stock}`);
        }

        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQty },
        });
      } else {
        if (quantity > product.stock) {
          throw new Error(`Stok tidak cukup. Stok tersedia: ${product.stock}`);
        }

        await tx.cartItem.create({
          data: { cartId: cart.id, productId, quantity },
        });
      }
    });

    revalidatePath("/cart");

    return {
      success: true,
      message: `${product.name} berhasil ditambahkan ke keranjang.`,
    };
  } catch (error) {
    console.error("Add to cart error:", error);

    const message =
      error instanceof Error ? error.message : "Gagal menambahkan ke keranjang.";

    return {
      success: false,
      message,
    };
  }
}

// ─── Update Cart Item Quantity ────────────────────────────────────────────
export async function updateCartItemAction(cartItemId: string, formData: FormData) {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      message: "Anda belum login.",
    };
  }

  const rawData = {
    quantity: formData.get("quantity"),
  };

  const validated = updateCartItemSchema.safeParse(rawData);

  if (!validated.success) {
    const flattenedErrors = z.flattenError(validated.error);

    return {
      success: false,
      message: "Validasi gagal.",
      errors: flattenedErrors.fieldErrors,
    };
  }

  const { quantity } = validated.data;

  try {
    // Verifikasi item milik user
    const item = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: { userId: user.id },
      },
      include: { product: true },
    });

    if (!item) {
      return {
        success: false,
        message: "Item keranjang tidak ditemukan.",
      };
    }

    if (quantity > item.product.stock) {
      return {
        success: false,
        message: `Stok tidak cukup. Stok tersedia: ${item.product.stock}`,
      };
    }

    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    revalidatePath("/cart");

    return {
      success: true,
      message: "Jumlah berhasil diperbarui.",
    };
  } catch (error) {
    console.error("Update cart item error:", error);

    return {
      success: false,
      message: "Gagal memperbarui jumlah.",
    };
  }
}

// ─── Remove Cart Item ─────────────────────────────────────────────────────
export async function removeCartItemAction(cartItemId: string) {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      message: "Anda belum login.",
    };
  }

  try {
    const item = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        cart: { userId: user.id },
      },
    });

    if (!item) {
      return {
        success: false,
        message: "Item tidak ditemukan.",
      };
    }

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    revalidatePath("/cart");

    return {
      success: true,
      message: "Item berhasil dihapus dari keranjang.",
    };
  } catch (error) {
    console.error("Remove cart item error:", error);

    return {
      success: false,
      message: "Gagal menghapus item.",
    };
  }
}

// ─── Clear Cart ───────────────────────────────────────────────────────────
export async function clearCartAction() {
  const user = await getUser();

  if (!user) {
    return {
      success: false,
      message: "Anda belum login.",
    };
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      return {
        success: true,
        message: "Keranjang sudah kosong.",
      };
    }

    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    revalidatePath("/cart");

    return {
      success: true,
      message: "Keranjang berhasil dikosongkan.",
    };
  } catch (error) {
    console.error("Clear cart error:", error);

    return {
      success: false,
      message: "Gagal mengosongkan keranjang.",
    };
  }
}

// ─── Get Cart Item Count ──────────────────────────────────────────────────
export async function getCartItemCount() {
  const user = await getUser();

  if (!user) {
    return 0;
  }

  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { _count: { select: { items: true } } },
    });

    return cart?._count.items ?? 0;
  } catch {
    return 0;
  }
}
