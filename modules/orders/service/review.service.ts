"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import prisma from "@/shared/lib/prisma";
import { getUser } from "@/modules/auth/auth-session";

// ─── Schema ───────────────────────────────────────────────────────────────────
const createReviewSchema = z.object({
  orderId: z.string().min(1),
  productId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
});

// ─── Create Review ────────────────────────────────────────────────────────────
export async function createReviewAction(formData: FormData) {
  const user = await getUser();
  if (!user) return { success: false, message: "Anda belum login." };

  const raw = {
    orderId: formData.get("orderId"),
    productId: formData.get("productId"),
    rating: formData.get("rating"),
    comment: formData.get("comment") || null,
    imageUrl: formData.get("imageUrl") || null,
  };

  const validated = createReviewSchema.safeParse(raw);
  if (!validated.success) {
    return { success: false, message: "Data tidak valid." };
  }

  const { orderId, productId, rating, comment, imageUrl } = validated.data;

  try {
    // Pastikan order milik user dan sudah COMPLETED
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id, status: "COMPLETED" },
      include: { items: true },
    });

    if (!order) {
      return {
        success: false,
        message: "Pesanan tidak ditemukan atau belum selesai.",
      };
    }

    // Pastikan produk ada di dalam order
    const hasProduct = order.items.some((i) => i.productId === productId);
    if (!hasProduct) {
      return {
        success: false,
        message: "Produk tidak ditemukan dalam pesanan ini.",
      };
    }

    // Cek sudah pernah review belum
    const existing = await prisma.review.findUnique({
      where: { userId_orderId_productId: { userId: user.id, orderId, productId } },
    });

    if (existing) {
      return { success: false, message: "Kamu sudah memberikan ulasan untuk produk ini." };
    }

    await prisma.review.create({
      data: {
        userId: user.id,
        orderId,
        productId,
        rating,
        comment: comment ?? null,
        imageUrl: imageUrl ?? null,
      },
    });

    revalidatePath(`/profile/orders/${orderId}`);
    revalidatePath("/profile/reviews");

    return { success: true, message: "Ulasan berhasil dikirim. Terima kasih!" };
  } catch (error) {
    console.error("Create review error:", error);
    return { success: false, message: "Gagal mengirim ulasan." };
  }
}

// ─── Get My Reviews ───────────────────────────────────────────────────────────
export async function getMyReviews() {
  const user = await getUser();
  if (!user) return { success: false, message: "Anda belum login.", data: [] };

  try {
    const reviews = await prisma.review.findMany({
      where: { userId: user.id },
      include: {
        product: { select: { id: true, name: true, imageUrl: true, slug: true } },
        order: { select: { id: true, orderCode: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, message: "Ulasan berhasil dimuat.", data: reviews };
  } catch (error) {
    console.error("Get my reviews error:", error);
    return { success: false, message: "Gagal memuat ulasan.", data: [] };
  }
}

// ─── Get Reviews by Order ─────────────────────────────────────────────────────
export async function getReviewsByOrder(orderId: string) {
  const user = await getUser();
  if (!user) return { success: false, message: "Anda belum login.", data: [] };

  try {
    const reviews = await prisma.review.findMany({
      where: { orderId, userId: user.id },
    });

    return { success: true, data: reviews };
  } catch (error) {
    console.error("Get reviews by order error:", error);
    return { success: false, data: [] };
  }
}

// ─── Count pending reviews (produk COMPLETED yang belum diulas) ───────────────
export async function getPendingReviewCount() {
  const user = await getUser();
  if (!user) return 0;

  try {
    const orders = await prisma.order.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      select: {
        id: true,
        items: { select: { productId: true } },
      },
    });

    const orderIds = orders.map((o) => o.id);
    if (orderIds.length === 0) return 0;

    const reviewedCount = await prisma.review.count({
      where: { userId: user.id, orderId: { in: orderIds } },
    });

    const totalItems = orders.reduce((sum, o) => sum + o.items.length, 0);
    return Math.max(0, totalItems - reviewedCount);
  } catch {
    return 0;
  }
}

// ─── Get COMPLETED orders with review status (untuk halaman Ulasan Saya) ──────
export async function getCompletedOrdersForReview() {
  const user = await getUser();
  if (!user) return { success: false, message: "Anda belum login.", data: [] };

  try {
    // Query orders dan reviews secara terpisah agar aman jika client belum terupdate
    const orders = await prisma.order.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            productName: true,
            productImageUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const orderIds = orders.map((o) => o.id);

    const reviews = await prisma.review.findMany({
      where: { userId: user.id, orderId: { in: orderIds } },
      select: { orderId: true, productId: true, rating: true, comment: true, imageUrl: true },
    });

    // Gabungkan reviews ke masing-masing order
    const data = orders.map((order) => ({
      ...order,
      reviews: reviews.filter((r) => r.orderId === order.id),
    }));

    return { success: true, data };
  } catch (error) {
    console.error("Get completed orders for review error:", error);
    return { success: false, data: [] };
  }
}
