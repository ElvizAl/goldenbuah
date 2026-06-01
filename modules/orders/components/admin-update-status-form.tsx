"use client";

import { useState } from "react";
import { toast } from "sonner";
import { adminUpdateOrderStatusAction } from "@/modules/orders/service/order.service";

const ORDER_STATUSES = [
  { value: "PENDING", label: "Menunggu" },
  { value: "WAITING_CONFIRMATION", label: "Konfirmasi Pembayaran" },
  { value: "PAID", label: "Dibayar" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "READY_FOR_PICKUP", label: "Siap Diambil" },
  { value: "SHIPPED", label: "Dikirim" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

interface AdminUpdateStatusFormProps {
  orderId: string;
  currentStatus: string;
}

export function AdminUpdateStatusForm({
  orderId,
  currentStatus,
}: AdminUpdateStatusFormProps) {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await adminUpdateOrderStatusAction(orderId, formData);

    setLoading(false);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1">
        <label htmlFor="status" className="text-xs font-medium text-gray-600">
          Update Status
        </label>
        <select
          id="status"
          name="status"
          defaultValue={currentStatus}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="note" className="text-xs font-medium text-gray-600">
          Catatan (opsional)
        </label>
        <input
          id="note"
          name="note"
          type="text"
          placeholder="Catatan untuk pembeli..."
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-yellow-400 px-4 py-2 text-sm font-medium text-yellow-900 transition hover:bg-yellow-500 disabled:opacity-50"
      >
        {loading ? "Menyimpan..." : "Simpan Status"}
      </button>
    </form>
  );
}
