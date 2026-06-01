"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

import prisma from "@/shared/lib/prisma";
import { getUser } from "@/modules/auth/auth-session";
import { createOrderSchema, updateOrderStatusSchema } from "@/modules/orders/schema/order.schema";

// ─── Helper ───────────────────────────────────────────────────────────────
function generateOrderCode() {
  return `GF-${nanoid(8).toUpperCase()}`;
}

// ─── Create Order dari Cart ───────────────────────────────────────────────
export async function createOrderAction(formData: FormData) {
  const user = await getUser();
  if (!user) return { success: false, message: "Anda belum login." };

  const rawData = {
    fulfillmentType: formData.get("fulfillmentType"),
    addressId: formData.get("addressId") || null,
    courierCode: formData.get("courierCode") || null,
    courierName: formData.get("courierName") || null,
    courierService: formData.get("courierService") || null,
    courierEtd: formData.get("courierEtd") || null,
    shipping: formData.get("shipping") || 0,
    recipientName: formData.get("recipientName"),
    phone: formData.get("phone"),
    note: formData.get("note") || null,
  };

  const validated = createOrderSchema.safeParse(rawData);
  if (!validated.success) {
    const errors = Object.fromEntries(
      Object.entries(validated.error.flatten().fieldErrors).map(([k, v]) => [k, v?.[0]])
    );
    return { success: false, message: "Validasi gagal.", errors };
  }

  const data = validated.data;

  try {
    // Ambil cart beserta item
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return { success: false, message: "Keranjang kosong." };
    }

    // Ambil snapshot alamat kalau DELIVERY
    let addressSnapshot: {
      fullAddress?: string | null;
      provinceName?: string | null;
      cityName?: string | null;
      districtName?: string | null;
      subdistrictName?: string | null;
      postalCode?: string | null;
    } = {};

    if (data.fulfillmentType === "DELIVERY") {
      if (!data.addressId) {
        return { success: false, message: "Pilih alamat pengiriman terlebih dahulu." };
      }

      const address = await prisma.address.findFirst({
        where: { id: data.addressId, userId: user.id },
      });

      if (!address) {
        return { success: false, message: "Alamat tidak ditemukan." };
      }

      addressSnapshot = {
        fullAddress: address.fullAddress,
        provinceName: address.provinceName,
        cityName: address.cityName,
        districtName: address.districtName,
        subdistrictName: address.subdistrictName,
        postalCode: address.postalCode,
      };
    }

    // Hitung subtotal
    const subtotal = cart.items.reduce(
      (acc, item) => acc + Number(item.product.price) * item.quantity,
      0
    );
    const shipping = data.shipping ?? 0;
    const total = subtotal + shipping;

    // Hitung total berat
    const totalWeight = cart.items.reduce(
      (acc, item) => acc + item.product.weight * item.quantity,
      0
    );

    let orderId = "";

    await prisma.$transaction(async (tx) => {
      // Validasi stok untuk semua item
      for (const item of cart.items) {
        if (item.quantity > item.product.stock) {
          throw new Error(
            `Stok ${item.product.name} tidak cukup. Tersedia: ${item.product.stock}`
          );
        }
      }

      // Buat order
      const order = await tx.order.create({
        data: {
          userId: user.id,
          orderCode: generateOrderCode(),
          status: "PENDING",
          fulfillmentType: data.fulfillmentType,

          addressId: data.addressId ?? null,

          subtotal,
          shipping,
          total,

          courierCode: data.courierCode,
          courierName: data.courierName,
          courierService: data.courierService,
          courierEtd: data.courierEtd,
          totalWeight,

          recipientName: data.recipientName,
          phone: data.phone,

          ...addressSnapshot,

          note: data.note,

          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productSlug: item.product.slug,
              productImageUrl: item.product.imageUrl,
              price: Number(item.product.price),
              quantity: item.quantity,
              subtotal: Number(item.product.price) * item.quantity,
            })),
          },
        },
      });

      orderId = order.id;

      // Kurangi stok produk
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Kosongkan cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    });

    revalidatePath("/orders");
    revalidatePath("/cart");

    return {
      success: true,
      message: "Pesanan berhasil dibuat.",
      data: { orderId },
    };
  } catch (error) {
    console.error("Create order error:", error);
    const message = error instanceof Error ? error.message : "Gagal membuat pesanan.";
    return { success: false, message };
  }
}

// ─── Get My Orders (User) ─────────────────────────────────────────────────
export async function getMyOrders() {
  const user = await getUser();
  if (!user) return { success: false, message: "Anda belum login.", data: [] };

  try {
    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const serialized = orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping),
      total: Number(o.total),
      items: o.items.map((i) => ({
        ...i,
        price: Number(i.price),
        subtotal: Number(i.subtotal),
      })),
      payment: o.payment
        ? { ...o.payment, amount: Number(o.payment.amount) }
        : null,
    }));

    return { success: true, message: "Order berhasil dimuat.", data: serialized };
  } catch (error) {
    console.error("Get my orders error:", error);
    return { success: false, message: "Gagal memuat order.", data: [] };
  }
}

// ─── Get Order Detail (User) ──────────────────────────────────────────────
export async function getOrderDetail(orderId: string) {
  const user = await getUser();
  if (!user) return { success: false, message: "Anda belum login.", data: null };

  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
      include: {
        items: { include: { product: true } },
        payment: true,
        address: true,
      },
    });

    if (!order) return { success: false, message: "Order tidak ditemukan.", data: null };

    const serialized = {
      ...order,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      total: Number(order.total),
      items: order.items.map((i) => ({
        ...i,
        price: Number(i.price),
        subtotal: Number(i.subtotal),
        product: { ...i.product, price: Number(i.product.price) },
      })),
      payment: order.payment
        ? { ...order.payment, amount: Number(order.payment.amount) }
        : null,
    };

    return { success: true, message: "Order berhasil dimuat.", data: serialized };
  } catch (error) {
    console.error("Get order detail error:", error);
    return { success: false, message: "Gagal memuat order.", data: null };
  }
}

// ─── Cancel Order (User) ──────────────────────────────────────────────────
export async function cancelOrderAction(orderId: string) {
  const user = await getUser();
  if (!user) return { success: false, message: "Anda belum login." };

  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: user.id },
      include: { items: true },
    });

    if (!order) return { success: false, message: "Order tidak ditemukan." };

    if (!["PENDING", "WAITING_CONFIRMATION"].includes(order.status)) {
      return { success: false, message: "Order tidak dapat dibatalkan pada status ini." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      // Kembalikan stok
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    });

    revalidatePath("/orders");
    revalidatePath(`/orders/${orderId}`);

    return { success: true, message: "Pesanan berhasil dibatalkan." };
  } catch (error) {
    console.error("Cancel order error:", error);
    return { success: false, message: "Gagal membatalkan pesanan." };
  }
}

// ─── Admin: Get All Orders ────────────────────────────────────────────────
export async function adminGetAllOrders(params?: {
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
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: true,
          payment: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    const serialized = orders.map((o) => ({
      ...o,
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping),
      total: Number(o.total),
      items: o.items.map((i) => ({
        ...i,
        price: Number(i.price),
        subtotal: Number(i.subtotal),
      })),
      payment: o.payment
        ? { ...o.payment, amount: Number(o.payment.amount) }
        : null,
    }));

    return {
      success: true,
      message: "Orders berhasil dimuat.",
      data: serialized,
      pagination: {
        total,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  } catch (error) {
    console.error("Admin get orders error:", error);
    return { success: false, message: "Gagal memuat orders.", data: [], pagination: null };
  }
}

// ─── Admin: Update Order Status ───────────────────────────────────────────
export async function adminUpdateOrderStatusAction(
  orderId: string,
  formData: FormData
) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, message: "Tidak diizinkan." };
  }

  const rawData = {
    status: formData.get("status"),
    note: formData.get("note") || null,
  };

  const validated = updateOrderStatusSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, message: "Status tidak valid." };
  }

  const { status, note } = validated.data;

  try {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return { success: false, message: "Order tidak ditemukan." };

    const updateData: Record<string, unknown> = { status };

    if (note) updateData.note = note;

    // Set timestamp khusus pickup
    if (status === "READY_FOR_PICKUP" && order.fulfillmentType === "PICKUP") {
      updateData.pickupReadyAt = new Date();
    }
    if (status === "COMPLETED" && order.fulfillmentType === "PICKUP") {
      updateData.pickedUpAt = new Date();
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    revalidatePath("/admin/dashboard/orders");
    revalidatePath(`/admin/dashboard/orders/${orderId}`);
    revalidatePath(`/orders/${orderId}`);

    return { success: true, message: `Status order diperbarui ke ${status}.` };
  } catch (error) {
    console.error("Admin update order status error:", error);
    return { success: false, message: "Gagal memperbarui status order." };
  }
}

// ─── Admin: Get Order Detail ──────────────────────────────────────────────
export async function adminGetOrderDetail(orderId: string) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") {
    return { success: false, message: "Tidak diizinkan.", data: null };
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true } },
        payment: true,
        address: true,
      },
    });

    if (!order) return { success: false, message: "Order tidak ditemukan.", data: null };

    const serialized = {
      ...order,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      total: Number(order.total),
      items: order.items.map((i) => ({
        ...i,
        price: Number(i.price),
        subtotal: Number(i.subtotal),
        product: { ...i.product, price: Number(i.product.price) },
      })),
      payment: order.payment
        ? { ...order.payment, amount: Number(order.payment.amount) }
        : null,
    };

    return { success: true, message: "Order berhasil dimuat.", data: serialized };
  } catch (error) {
    console.error("Admin get order detail error:", error);
    return { success: false, message: "Gagal memuat order.", data: null };
  }
}
