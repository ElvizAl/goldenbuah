"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/shared/lib/prisma";
import { getUser } from "@/modules/auth/auth-session";

// Info rekening/QRIS toko — baca dari env atau hardcode
const BANK_ACCOUNTS = [
  {
    bankName: "BCA",
    accountNumber: process.env.PAYMENT_BCA_NUMBER ?? "1234567890",
    accountName: process.env.PAYMENT_BCA_NAME ?? "Golden Buah",
  },
  {
    bankName: "BRI",
    accountNumber: process.env.PAYMENT_BRI_NUMBER ?? "0987654321",
    accountName: process.env.PAYMENT_BRI_NAME ?? "Golden Buah",
  },
  {
    bankName: "Mandiri",
    accountNumber: process.env.PAYMENT_MANDIRI_NUMBER ?? "1122334455",
    accountName: process.env.PAYMENT_MANDIRI_NAME ?? "Golden Buah",
  },
];

const QRIS_IMAGE_URL = process.env.NEXT_PUBLIC_QRIS_IMAGE_URL ?? null;

export async function getPaymentInfo() {
  return {
    bankAccounts: BANK_ACCOUNTS,
    qrisImageUrl: QRIS_IMAGE_URL,
  };
}

// ─── Submit Pembayaran (User upload bukti) ────────────────────────────────
export async function submitPaymentAction(formData: FormData) {
  const user = await getUser();
  if (!user) return { success: false, message: "Anda belum login." };

  const orderId = formData.get("orderId") as string;
  const method = formData.get("method") as string;
  const proofImageUrl = formData.get("proofImageUrl") as string;
  const bankName = (formData.get("bankName") as string) || null;
  const note = (formData.get("note") as string) || null;

  if (!orderId) return { success: false, message: "Order ID tidak valid." };
  if (!method || !["BANK_TRANSFER", "QRIS"].includes(method)) {
    return { success: false, message: "Metode pembayaran tidak valid." };
  }
  if (!proofImageUrl) {
    return { success: false, message: "Bukti pembayaran wajib diupload." };
  }

  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
      include: { payment: true },
    });

    if (!order) return { success: false, message: "Pesanan tidak ditemukan." };

    if (!["PENDING"].includes(order.status)) {
      return {
        success: false,
        message: "Pesanan tidak dalam status yang bisa dibayar.",
      };
    }

    if (order.payment) {
      // Jika sudah ada payment, update bukti saja
      await prisma.payment.update({
        where: { id: order.payment.id },
        data: {
          method: method as "BANK_TRANSFER" | "QRIS",
          proofImageUrl,
          bankName,
          note,
          status: "WAITING_CONFIRMATION",
          paidAt: new Date(),
        },
      });
    } else {
      // Buat payment baru
      await prisma.payment.create({
        data: {
          orderId,
          amount: order.total,
          method: method as "BANK_TRANSFER" | "QRIS",
          proofImageUrl,
          bankName,
          note,
          status: "WAITING_CONFIRMATION",
          paidAt: new Date(),
        },
      });
    }

    // Update status order ke WAITING_CONFIRMATION
    await prisma.order.update({
      where: { id: orderId },
      data: { status: "WAITING_CONFIRMATION" },
    });

    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/orders");
    revalidatePath("/admin/dashboard/orders");

    return {
      success: true,
      message: "Bukti pembayaran berhasil dikirim. Menunggu konfirmasi admin.",
    };
  } catch (error) {
    console.error("Submit payment error:", error);
    return { success: false, message: "Gagal mengirim bukti pembayaran." };
  }
}

// ─── Admin: Get All Payments ──────────────────────────────────────────────
export async function adminGetAllPayments(params?: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, message: "Tidak diizinkan.", data: [], pagination: null };
  }

  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;
  const skip = (page - 1) * limit;

  const where = params?.status ? { status: params.status as never } : {};

  try {
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          order: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.payment.count({ where }),
    ]);

    const serialized = payments.map((p) => ({
      ...p,
      amount: Number(p.amount),
      order: {
        ...p.order,
        subtotal: Number(p.order.subtotal),
        shipping: Number(p.order.shipping),
        total: Number(p.order.total),
      },
    }));

    return {
      success: true,
      message: "Pembayaran berhasil dimuat.",
      data: serialized,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Admin get payments error:", error);
    return { success: false, message: "Gagal memuat pembayaran.", data: [], pagination: null };
  }
}

// ─── Admin: Konfirmasi Pembayaran ─────────────────────────────────────────
export async function adminConfirmPaymentAction(
  paymentId: string,
  action: "CONFIRM" | "REJECT",
  rejectedReason?: string
) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, message: "Tidak diizinkan." };
  }

  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) return { success: false, message: "Pembayaran tidak ditemukan." };

    if (payment.status !== "WAITING_CONFIRMATION") {
      return { success: false, message: "Pembayaran tidak dalam status menunggu konfirmasi." };
    }

    if (action === "CONFIRM") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: "PAID",
            confirmedAt: new Date(),
            confirmedBy: user.id,
          },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { status: "PAID" },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: paymentId },
          data: {
            status: "REJECTED",
            rejectedReason: rejectedReason ?? "Bukti pembayaran tidak valid.",
          },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { status: "PENDING" },
        }),
      ]);
    }

    revalidatePath(`/orders/${payment.orderId}`);
    revalidatePath("/admin/dashboard/orders");
    revalidatePath(`/admin/dashboard/orders/${payment.orderId}`);
    revalidatePath("/admin/dashboard/payments");

    return {
      success: true,
      message: action === "CONFIRM" ? "Pembayaran dikonfirmasi." : "Pembayaran ditolak.",
    };
  } catch (error) {
    console.error("Admin confirm payment error:", error);
    return { success: false, message: "Gagal mengkonfirmasi pembayaran." };
  }
}
