"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cancelOrderAction } from "@/modules/orders/service/order.service";

interface CancelOrderButtonProps {
  orderId: string;
}

export function CancelOrderButton({ orderId }: CancelOrderButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Yakin ingin membatalkan pesanan ini?")) return;

    setLoading(true);
    const result = await cancelOrderAction(orderId);
    setLoading(false);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <button
      onClick={handleCancel}
      disabled={loading}
      className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
    >
      {loading ? "Membatalkan..." : "Batalkan Pesanan"}
    </button>
  );
}
