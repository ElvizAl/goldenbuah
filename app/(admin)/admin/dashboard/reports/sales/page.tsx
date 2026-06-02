import React from "react";
import { redirect } from "next/navigation";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  TrendingUpIcon,
  ShoppingCartIcon,
  CheckCircleIcon,
  XCircleIcon,
  TruckIcon,
  StoreIcon,
} from "lucide-react";

import { getUser } from "@/modules/auth/auth-session";
import prisma from "@/shared/lib/prisma";
import { MonthPicker } from "@/app/(admin)/admin/dashboard/reports/month-picker";
import { ExportPdfButton } from "@/app/(admin)/admin/dashboard/reports/export-pdf-button";

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

interface Props {
  searchParams: Promise<{ month?: string; year?: string }>;
}

async function getSalesReport(year: number, month: number) {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));

  const [orders, revenueByMethod, fulfillmentSplit, dailySales] =
    await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: start, lte: end } },
        include: {
          user: { select: { name: true } },
          payment: { select: { status: true, method: true, amount: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.payment.groupBy({
        by: ["method"],
        where: {
          status: "PAID",
          createdAt: { gte: start, lte: end },
        },
        _sum: { amount: true },
        _count: { id: true },
      }),
      prisma.order.groupBy({
        by: ["fulfillmentType"],
        where: { createdAt: { gte: start, lte: end } },
        _count: { id: true },
      }),
      prisma.$queryRaw<{ day: string; total: bigint; count: bigint }[]>`
        SELECT
          DATE("createdAt") as day,
          SUM(total) as total,
          COUNT(*) as count
        FROM "Order"
        WHERE "createdAt" >= ${start} AND "createdAt" <= ${end}
        GROUP BY DATE("createdAt")
        ORDER BY day ASC
      `,
    ]);

  const completedOrders = orders.filter((o) => o.status === "COMPLETED");
  const cancelledOrders = orders.filter((o) => o.status === "CANCELLED");
  const totalRevenue = completedOrders.reduce(
    (sum, o) => sum + Number(o.total),
    0
  );
  const deliveryCount =
    fulfillmentSplit.find((f) => f.fulfillmentType === "DELIVERY")?._count.id ??
    0;
  const pickupCount =
    fulfillmentSplit.find((f) => f.fulfillmentType === "PICKUP")?._count.id ??
    0;

  return {
    orders,
    completedOrders,
    cancelledOrders,
    totalRevenue,
    revenueByMethod,
    deliveryCount,
    pickupCount,
    dailySales,
  };
}

export default async function SalesReportPage({ searchParams }: Props) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") redirect("/admin/login");

  const params = await searchParams;
  const now = new Date();
  const year = parseInt(params.year ?? String(now.getFullYear()), 10);
  const month = parseInt(params.month ?? String(now.getMonth() + 1), 10);

  const data = await getSalesReport(year, month);

  // Build month options: last 12 months
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const d = subMonths(now, i);
    return {
      label: format(d, "MMMM yyyy", { locale: localeId }),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
    };
  });

  const selectedLabel = format(new Date(year, month - 1), "MMMM yyyy", {
    locale: localeId,
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

              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                    Laporan Penjualan
                  </h1>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    Periode: <span className="font-medium text-foreground">{selectedLabel}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <MonthPicker
                    options={monthOptions}
                    selectedYear={year}
                    selectedMonth={month}
                    basePath="/admin/dashboard/reports/sales"
                  />
                  <ExportPdfButton label="Export PDF" />
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Pesanan</p>
                        <p className="mt-1 text-3xl font-bold">{data.orders.length}</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50">
                        <ShoppingCartIcon className="h-6 w-6 text-cyan-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Pesanan Selesai</p>
                        <p className="mt-1 text-3xl font-bold text-green-600">{data.completedOrders.length}</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                        <CheckCircleIcon className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Pendapatan</p>
                        <p className="mt-1 text-xl font-bold text-green-600">
                          Rp {data.totalRevenue.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50">
                        <TrendingUpIcon className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Dibatalkan</p>
                        <p className="mt-1 text-3xl font-bold text-red-500">{data.cancelledOrders.length}</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50">
                        <XCircleIcon className="h-6 w-6 text-red-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {/* Order Table */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="px-6 py-4">
                      <CardTitle className="text-base">Rincian Pesanan — {selectedLabel}</CardTitle>
                      <CardDescription>Semua pesanan pada periode ini.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Kode</TableHead>
                              <TableHead>Pelanggan</TableHead>
                              <TableHead>Metode Kirim</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Tanggal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.orders.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                                  Tidak ada pesanan pada periode ini.
                                </TableCell>
                              </TableRow>
                            ) : (
                              data.orders.map((order) => (
                                <TableRow key={order.id}>
                                  <TableCell className="font-mono text-xs font-medium">{order.orderCode}</TableCell>
                                  <TableCell className="text-sm">{order.user.name}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                      {order.fulfillmentType === "DELIVERY" ? (
                                        <><TruckIcon className="h-3.5 w-3.5" />Pengiriman</>
                                      ) : (
                                        <><StoreIcon className="h-3.5 w-3.5" />Pickup</>
                                      )}
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right font-medium text-sm">
                                    Rp {Number(order.total).toLocaleString("id-ID")}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant="outline"
                                      className={
                                        order.status === "COMPLETED"
                                          ? "text-green-700 bg-green-50 border-green-200"
                                          : order.status === "CANCELLED"
                                          ? "text-red-700 bg-red-50 border-red-200"
                                          : order.status === "PROCESSING"
                                          ? "text-blue-700 bg-blue-50 border-blue-200"
                                          : "text-yellow-700 bg-yellow-50 border-yellow-200"
                                      }
                                    >
                                      {order.status === "COMPLETED" ? "Selesai"
                                        : order.status === "CANCELLED" ? "Dibatalkan"
                                        : order.status === "PROCESSING" ? "Diproses"
                                        : order.status === "SHIPPED" ? "Dikirim"
                                        : order.status === "PAID" ? "Dibayar"
                                        : order.status === "WAITING_CONFIRMATION" ? "Konfirmasi"
                                        : order.status === "READY_FOR_PICKUP" ? "Siap Diambil"
                                        : "Menunggu"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-xs text-muted-foreground">
                                    {format(new Date(order.createdAt), "d MMM yyyy", { locale: localeId })}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-4">
                  {/* Revenue by Payment Method */}
                  <Card>
                    <CardHeader className="px-6 py-4">
                      <CardTitle className="text-base">Pendapatan per Metode</CardTitle>
                      <CardDescription>Dari pesanan yang sudah dikonfirmasi.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-5 space-y-3">
                      {data.revenueByMethod.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Belum ada data.</p>
                      ) : (
                        data.revenueByMethod.map((r) => (
                          <div key={r.method} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">
                                {r.method === "BANK_TRANSFER" ? "Transfer Bank" : "QRIS"}
                              </p>
                              <p className="text-xs text-muted-foreground">{r._count.id} transaksi</p>
                            </div>
                            <span className="text-sm font-semibold text-green-600">
                              Rp {Number(r._sum.amount ?? 0).toLocaleString("id-ID")}
                            </span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Fulfillment Split */}
                  <Card>
                    <CardHeader className="px-6 py-4">
                      <CardTitle className="text-base">Metode Pengambilan</CardTitle>
                      <CardDescription>Pengiriman vs ambil di toko.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <TruckIcon className="h-4 w-4 text-blue-500" />
                          <span className="text-muted-foreground">Pengiriman</span>
                        </div>
                        <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">
                          {data.deliveryCount} pesanan
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm">
                          <StoreIcon className="h-4 w-4 text-green-500" />
                          <span className="text-muted-foreground">Ambil di Toko</span>
                        </div>
                        <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                          {data.pickupCount} pesanan
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Daily Summary (top 5 days) */}
                  <Card>
                    <CardHeader className="px-6 py-4">
                      <CardTitle className="text-base">Penjualan Harian Teratas</CardTitle>
                      <CardDescription>5 hari dengan transaksi terbanyak.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-5 space-y-2">
                      {data.dailySales.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Belum ada data.</p>
                      ) : (
                        [...data.dailySales]
                          .sort((a, b) => Number(b.count) - Number(a.count))
                          .slice(0, 5)
                          .map((d) => (
                            <div key={String(d.day)} className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {format(new Date(String(d.day)), "d MMM", { locale: localeId })}
                              </span>
                              <div className="text-right">
                                <span className="font-medium">Rp {Number(d.total).toLocaleString("id-ID")}</span>
                                <span className="ml-1.5 text-xs text-muted-foreground">({Number(d.count)} pesanan)</span>
                              </div>
                            </div>
                          ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
