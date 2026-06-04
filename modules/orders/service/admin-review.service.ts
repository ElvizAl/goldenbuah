"use server";

import prisma from "@/shared/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getAllReviews() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        product: { select: { id: true, name: true, slug: true, imageUrl: true } },
        order: { select: { id: true, orderCode: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: reviews };
  } catch {
    return { success: false, data: [], message: "Gagal memuat data ulasan." };
  }
}

export async function deleteReviewAction(id: string) {
  try {
    await prisma.review.delete({ where: { id } });
    revalidatePath("/admin/dashboard/reviews");
    return { success: true, message: "Ulasan berhasil dihapus." };
  } catch {
    return { success: false, message: "Gagal menghapus ulasan." };
  }
}
