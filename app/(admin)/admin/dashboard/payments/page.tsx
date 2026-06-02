import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { CreditCard, QrCode } from "lucide-react";
import React from "react";

import { getUser } from "@/modules/auth/auth-session";
import { adminGetAllPayments } from "@/modules/orders/service/payment.service";
import { AdminPaymentConfirm } from "@/modules/orders/components/admin-payment-confirm";

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
import { Badge } from "@/shared/components/ui/badge";

export const dynamic = "force-dynamic";

const STATUS_FILTERS = [
  { value: "", label: "Semua" },
  { value: "WAITING_CONFIRMATION", label: "Menunggu Konfirmasi" },
  { value: "PAID", label: "Dikonfirmasi" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "PENDING", label: "Belum Bayar" },
  { value: "CANCELLED", label: "Dibatalkan" },
];

const PAYMENT_STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className: string }
> = {
  WAITING_CONFIRMATION: {
    label: "Menunggu Konfirmasi",
    variant: "outline",
    className: "text-yellow-700 bg-yellow-50 border-yellow-200",
  },
  PAID: {
    label: "Dikonfirmasi",
    variant: "outline",
    className: "text-green-700 bg-green-50 border-green-200",
  },
  REJECTED: {
    label: "Ditolak",
    variant: "outline",
    className: "text-red-700 bg-red-50 border-red-200",
  },
  PENDING: {
    label: "Belum Bayar",
    variant: "outline",
    className: "text-gray-600 bg-gray-50 border-gray-200",
  },
  CANCELLED: {
    label: "Dibatalkan",
    variant: "outline",
    className: "text-gray-600 bg-gray-50 border-gray-200",
  },
};

interface Props {
  searchParams: Promise<{ status?: string; page?: string; selected?: string }>;
}

export default async function AdminPaymentsPage({ searchParams }: Props) {
  const params = await searchParams;
  const user = await getUser();
  if (!user || user.role !== "ADMIN") redirect("/admin/login");

  const status = params.status ?? "";
  const page = parseInt(params.page ?? "1", 10);
  const selectedId = params.selected ?? "";

  const { data: payments, pagination } = await adminGetAllPayments({
    status: status || undefined,
    page,
    limit: 20,
  });

  const selectedPayment = selectedId
    ? payments.find((p) => p.id === selectedId) ?? null
    : null;

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
                    Kelola Pembayaran
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Konfirmasi dan kelola semua pembayaran pelanggan.
                  </p>
                </div>
                {pagination && (
                  <span className="text-sm text-muted-foreground">
                    Total: {pagination.total} pembayaran
                  </span>
                )}
              </div>

              {/* Filter Status */}
              <div className="flex flex-wrap gap-2">
                {STATUS_FILTERS.map((f) => (
                  <Link
                    key={f.value}
                    href={`/admin/dashboard/payments${f.value ? `?status=${f.value}` : ""}`}
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

              <div className="grid gap-6 lg:grid-cols-3">
                {/* ─── Table ─── */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="px-6 py-4">
                      <CardTitle className="text-lg">Semua Pembayaran</CardTitle>
                      <CardDescription>
                        {status
                          ? `Menampilkan pembayaran dengan status "${STATUS_FILTERS.find((f) => f.value === status)?.label}".`
                          : "Menampilkan semua pembayaran."}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Pelanggan</TableHead>
                              <TableHead>Pesanan</TableHead>
                              <TableHead>Metode</TableHead>
                              <TableHead className="text-right">Jumlah</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Tanggal</TableHead>
                              <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {payments.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={7}
                                  className="py-12 text-center text-sm text-muted-foreground"
                                >
                                  Tidak ada pembayaran ditemukan.
                                </TableCell>
                              </TableRow>
                            ) : (
                              payments.map((payment) => {
                                const cfg = PAYMENT_STATUS_CONFIG[payment.status];
                                const isSelected = payment.id === selectedId;
                                return (
                                  <TableRow
                                    key={payment.id}
                                    className={isSelected ? "bg-yellow-50 dark:bg-yellow-950/20" : ""}
                                  >
                                    <TableCell>
                                      <div className="font-medium">
                                        {payment.order.user.name}
                                      </div>
                                      <div className="text-xs text-muted-foreground">
                                        {payment.order.user.email}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <Link
                                        href={`/admin/dashboard/orders/${payment.order.id}`}
                                        className="font-mono text-xs font-medium text-blue-600 hover:underline"
                                      >
                                        {payment.order.orderCode}
                                      </Link>
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1.5 text-muted-foreground">
                                        {payment.method === "BANK_TRANSFER" ? (
                                          <CreditCard className="h-3.5 w-3.5" />
                                        ) : (
                                          <QrCode className="h-3.5 w-3.5" />
                                        )}
                                        <span className="text-xs">
                                          {payment.method === "BANK_TRANSFER"
                                            ? `Transfer${payment.bankName ? ` (${payment.bankName})` : ""}`
                                            : "QRIS"}
                                        </span>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                      Rp {payment.amount.toLocaleString("id-ID")}
                                    </TableCell>
                                    <TableCell>
                                      {cfg && (
                                        <Badge
                                          variant={cfg.variant}
                                          className={cfg.className}
                                        >
                                          {cfg.label}
                                        </Badge>
                                      )}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-xs">
                                      {format(
                                        new Date(payment.createdAt),
                                        "d MMM yyyy",
                                        { locale: localeId }
                                      )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                      <Link
                                        href={`/admin/dashboard/payments?${status ? `status=${status}&` : ""}selected=${payment.id}`}
                                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                                          isSelected
                                            ? "border-yellow-400 bg-yellow-400 text-yellow-900"
                                            : "border-gray-200 text-gray-600 hover:border-yellow-400 hover:text-yellow-700 dark:border-neutral-700 dark:text-neutral-300"
                                        }`}
                                      >
                                        {isSelected ? "Dipilih" : "Review"}
                                      </Link>
                                    </TableCell>
                                  </TableRow>
                                );
                              })
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Pagination */}
                  {pagination && pagination.totalPages > 1 && (
                    <div className="mt-4 flex justify-center gap-2">
                      {Array.from(
                        { length: pagination.totalPages },
                        (_, i) => i + 1
                      ).map((p) => (
                        <Link
                          key={p}
                          href={`/admin/dashboard/payments?${status ? `status=${status}&` : ""}page=${p}`}
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

                {/* ─── Detail Panel ─── */}
                <div>
                  {selectedPayment ? (
                    <div className="space-y-4">
                      {/* Bukti Pembayaran */}
                      {selectedPayment.proofImageUrl && (
                        <Card>
                          <CardHeader className="px-6 py-4">
                            <CardTitle className="text-sm font-semibold">Bukti Pembayaran</CardTitle>
                          </CardHeader>
                          <CardContent className="px-6 pb-5">
                            <a
                              href={selectedPayment.proofImageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <div className="relative h-56 w-full overflow-hidden rounded-lg border bg-neutral-50 hover:opacity-90 transition">
                                <Image
                                  src={selectedPayment.proofImageUrl}
                                  alt="Bukti pembayaran"
                                  fill
                                  className="object-contain"
                                />
                              </div>
                              <p className="mt-1 text-center text-xs text-blue-500 hover:underline">
                                Klik untuk lihat ukuran penuh
                              </p>
                            </a>
                          </CardContent>
                        </Card>
                      )}

                      {/* Konfirmasi */}
                      <AdminPaymentConfirm payment={selectedPayment} />
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <CreditCard className="mb-3 h-10 w-10 text-muted-foreground/30" />
                        <p className="text-sm text-muted-foreground">
                          Pilih pembayaran untuk mereview dan konfirmasi.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
