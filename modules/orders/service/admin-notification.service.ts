"use server";

import prisma from "@/shared/lib/prisma";

export async function getPendingOrderCount() {
  try {
    const count = await prisma.order.count({
      where: { status: "PENDING" },
    });
    return { success: true, count };
  } catch {
    return { success: false, count: 0 };
  }
}
