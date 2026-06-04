import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Package, Truck, Store } from "lucide-react";

import { OrderStatusBadge } from "./order-status-badge";

interface OrderItem {
  id: string;
  productName: string;
  productImageUrl?: string | null;
  quantity: number;
  price: number;
  subtotal: number;
}

interface OrderCardProps {
  order: {
    id: string;
    orderCode: string;
    status: string;
    fulfillmentType: string;
    total: number;
    createdAt: Date | string;
    items: OrderItem[];
  };
}

export function OrderCard({ order }: OrderCardProps) {
  const firstItem = order.items[0];
  const extraCount = order.items.length - 1;

  return (
    <Link
      href={`/profile/orders/${order.id}`}
      className="block rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm transition hover:shadow-md"
    >
      {/* Header */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-neutral-50 px-3 py-1 text-xs font-bold text-neutral-600">
            {order.fulfillmentType === "DELIVERY" ? (
              <Truck className="h-3.5 w-3.5" />
            ) : (
              <Store className="h-3.5 w-3.5" />
            )}
            {order.fulfillmentType === "DELIVERY" ? "Pengiriman" : "Ambil di Toko"}
          </span>
          <span className="font-mono text-xs font-semibold text-neutral-500">
            {order.orderCode}
          </span>
        </div>
        <OrderStatusBadge status={order.status as never} />
      </div>

      {/* Item Preview */}
      <div className="flex items-center gap-3">
        {firstItem?.productImageUrl ? (
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-neutral-50">
            <Image
              src={firstItem.productImageUrl}
              alt={firstItem.productName}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-neutral-100 bg-neutral-50">
            <Package className="h-6 w-6 text-neutral-300" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-neutral-800">
            {firstItem?.productName}
          </p>
          <p className="mt-0.5 text-xs text-neutral-400">
            {firstItem?.quantity} barang
            {extraCount > 0 && ` + ${extraCount} produk lainnya`}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3">
        <span className="text-xs text-neutral-400">
          {format(new Date(order.createdAt), "d MMM yyyy, HH:mm", {
            locale: id,
          })}
        </span>
        <span className="text-sm font-bold text-neutral-800">
          Rp {order.total.toLocaleString("id-ID")}
        </span>
      </div>
    </Link>
  );
}
