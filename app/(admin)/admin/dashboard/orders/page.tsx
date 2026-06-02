import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import React from "react";

import { getUser } from "@/modules/auth/auth-session";
import { adminGetAllOrders } from "@/modules/orders/service/order.service";
import { OrderStatusBadge } from "@/modules/orders/components/order-status-badge";

import { AppSidebar } from "@/shared/components/app-sidebar";
import { SiteHeader } from "@/shared/components/site-header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

export const dynamic = "force-dynamic";

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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">

              <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                    Daftar Pesanan
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Kelola semua pesanan pelanggan.
                  </p>
                </div>
                {pagination && (
                  <span className="text-sm text-muted-foreground">
                    Total: {pagination.total} pesanan
                  </span>
                )}
              </div>

              {/* Filter Status */}
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((f) => (
                  <Link
                    key={f.value}
                    href={`/admin/dashboard/orders${f.value ? `?status=${f.value}` : ""}`}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      status === f.value
                        ? "border-yellow-400 bg-yellow-400 text-yellow-900"
                        : "border-gray-200 bg-white text-gray-600 hover:border-yellow-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
                    }`}
                  >
                    {f.label}
                  </Link>
                ))}
              </div>

              <Card>
                <CardHeader className="px-6 py-4">
                  <CardTitle className="text-lg">Semua Pesanan</CardTitle>
                  <CardDescription>
                    {status
                      ? `Menampilkan pesanan dengan status "${STATUS_FILTERS.find((f) => f.value === status)?.label}".`
                      : "Menampilkan semua pesanan."}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Kode</TableHead>
                          <TableHead>Pelanggan</TableHead>
                          <TableHead>Metode</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Tanggal</TableHead>
                          <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {orders.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="py-12 text-center text-sm text-muted-foreground"
                            >
                              Tidak ada pesanan ditemukan.
                            </TableCell>
                          </TableRow>
                        ) : (
                          orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-mono font-medium">
                                {order.orderCode}
                              </TableCell>
                              <TableCell>
                                <div className="font-medium">{order.user.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {order.user.email}
                                </div>
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {order.fulfillmentType === "DELIVERY"
                                  ? "Pengiriman"
                                  : "Ambil di Toko"}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                Rp {order.total.toLocaleString("id-ID")}
                              </TableCell>
                              <TableCell>
                                <OrderStatusBadge status={order.status as never} />
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {format(new Date(order.createdAt), "d MMM yyyy", {
                                  locale: localeId,
                                })}
                              </TableCell>
                              <TableCell className="text-right">
                                <Link
                                  href={`/admin/dashboard/orders/${order.id}`}
                                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-yellow-400 hover:text-yellow-700 dark:border-neutral-700 dark:text-neutral-300"
                                >
                                  Detail
                                </Link>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Pagination */}
              {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  {Array.from(
                    { length: pagination.totalPages },
                    (_, i) => i + 1
                  ).map((p) => (
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
                  ))}
                </div>
              )}

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
