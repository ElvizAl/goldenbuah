import { cn } from "@/shared/lib/utils";

type OrderStatus =
  | "PENDING"
  | "WAITING_CONFIRMATION"
  | "PAID"
  | "PROCESSING"
  | "READY_FOR_PICKUP"
  | "SHIPPED"
  | "COMPLETED"
  | "CANCELLED";

const statusConfig: Record<
  OrderStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Menunggu",
    className: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  WAITING_CONFIRMATION: {
    label: "Konfirmasi Pembayaran",
    className: "bg-orange-100 text-orange-800 border-orange-200",
  },
  PAID: {
    label: "Dibayar",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  PROCESSING: {
    label: "Diproses",
    className: "bg-purple-100 text-purple-800 border-purple-200",
  },
  READY_FOR_PICKUP: {
    label: "Siap Diambil",
    className: "bg-teal-100 text-teal-800 border-teal-200",
  },
  SHIPPED: {
    label: "Dikirim",
    className: "bg-indigo-100 text-indigo-800 border-indigo-200",
  },
  COMPLETED: {
    label: "Selesai",
    className: "bg-green-100 text-green-800 border-green-200",
  },
  CANCELLED: {
    label: "Dibatalkan",
    className: "bg-red-100 text-red-800 border-red-200",
  },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  className?: string;
}

export function OrderStatusBadge({ status, className }: OrderStatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}

export function getOrderStatusLabel(status: OrderStatus): string {
  return statusConfig[status]?.label ?? status;
}
