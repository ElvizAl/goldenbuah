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
      href={`/orders/${order.id}`}
      className="block rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {order.fulfillmentType === "DELIVERY" ? (
            <Truck className="h-4 w-4" />
          ) : (
            <Store className="h-4 w-4" />
          )}
          <span className="font-mono font-medium text-gray-800">
            {order.orderCode}
          </span>
        </div>
        <OrderStatusBadge status={order.status as never} />
      </div>

      {/* Item Preview */}
      <div className="mt-3 flex items-center gap-3">
        {firstItem?.productImageUrl ? (
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-50">
            <Image
              src={firstItem.productImageUrl}
              alt={firstItem.productName}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border bg-gray-100">
            <Package className="h-6 w-6 text-gray-400" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900">
            {firstItem?.productName}
          </p>
          <p className="text-xs text-gray-500">
            {firstItem?.quantity} barang
            {extraCount > 0 && ` + ${extraCount} produk lainnya`}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between border-t pt-3">
        <span className="text-xs text-gray-400">
          {format(new Date(order.createdAt), "d MMM yyyy, HH:mm", {
            locale: id,
          })}
        </span>
        <span className="text-sm font-semibold text-gray-900">
          Rp {order.total.toLocaleString("id-ID")}
        </span>
      </div>
    </Link>
  );
}
