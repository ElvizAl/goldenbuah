import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

import { getUser } from "@/modules/auth/auth-session";
import { adminGetAllOrders } from "@/modules/orders/service/order.service";
import { OrderStatusBadge } from "@/modules/orders/components/order-status-badge";

const STATUS_FILTERS = [
  { value: "", label: "Semua" },
  { value: "PENDING", label: "Menunggu" },
  { value: "WAITING_CONFIRMATION", label: "Konfirmasi Pembayaran" },
  { value: "PAID", label: "Dibayar" },
  { value: "PROCESSING", label: "Diproses" },
  { value: "READY_FOR_PICKUP", label: "Siap Diambil" },
  { value: "SHIPPED", label: "Dikirim" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

interface Props {
  searchParams: Promise<{ status?: string; page?: string }>;
}

export default async function AdminOrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await getUser();
  if (!user || user.role !== "ADMIN") redirect("/admin/login");

  const status = params.status ?? "";
  const page = parseInt(params.page ?? "1", 10);

  const { data: orders, pagination } = await adminGetAllOrders({
    status: status || undefined,
    page,
    limit: 20,
  });

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Kelola Pesanan</h1>
        {pagination && (
          <span className="text-sm text-gray-500">
            Total: {pagination.total} pesanan
          </span>
        )}
      </div>

      {/* Filter Status */}
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={`/admin/dashboard/orders${f.value ? `?status=${f.value}` : ""}`}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              status === f.value
                ? "border-yellow-400 bg-yellow-400 text-yellow-900"
                : "border-gray-200 bg-white text-gray-600 hover:border-yellow-300"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Kode</th>
              <th className="px-4 py-3">Pelanggan</th>
              <th className="px-4 py-3">Metode</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Tanggal</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-12 text-center text-sm text-gray-400"
                >
                  Tidak ada pesanan ditemukan.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono font-medium text-gray-800">
                    {order.orderCode}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {order.user.name}
                    </div>
                    <div className="text-xs text-gray-400">{order.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {order.fulfillmentType === "DELIVERY"
                      ? "Pengiriman"
                      : "Ambil di Toko"}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    Rp {order.total.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status as never} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {format(new Date(order.createdAt), "d MMM yyyy", {
                      locale: localeId,
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/dashboard/orders/${order.id}`}
                      className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600 hover:border-yellow-400 hover:text-yellow-700"
                    >
                      Detail
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <Link
                key={p}
                href={`/admin/dashboard/orders?${status ? `status=${status}&` : ""}page=${p}`}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                  p === pagination.currentPage
                    ? "border-yellow-400 bg-yellow-400 text-yellow-900"
                    : "border-gray-200 bg-white text-gray-600 hover:border-yellow-300"
                }`}
              >
                {p}
              </Link>
            )
          )}
        </div>
      )}
    </div>
  );
}
