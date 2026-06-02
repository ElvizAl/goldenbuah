import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  ShoppingCartIcon,
  CreditCardIcon,
  PackageIcon,
  UsersIcon,
  TrendingUpIcon,
  ClockIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ArrowRightIcon,
} from "lucide-react";

import { getUser } from "@/modules/auth/auth-session";
import prisma from "@/shared/lib/prisma";

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
import { OrderStatusBadge } from "@/modules/orders/components/order-status-badge";

export const dynamic = "force-dynamic";

async function getDashboardStats() {
  const [
    totalOrders,
    pendingPayments,
    totalRevenue,
    totalProducts,
    totalUsers,
    recentOrders,
    ordersByStatus,
    lowStockProducts,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.payment.count({ where: { status: "WAITING_CONFIRMATION" } }),
    prisma.payment.aggregate({
      where: { status: "PAID" },
      _sum: { amount: true },
    }),
    prisma.product.count(),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.order.findMany({
      take: 7,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        payment: { select: { status: true } },
      },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.product.findMany({
      where: { stock: { lte: 10 } },
      orderBy: { stock: "asc" },
      take: 5,
      select: { id: true, name: true, stock: true, imageUrl: true },
    }),
  ]);

  return {
    totalOrders,
    pendingPayments,
    totalRevenue: Number(totalRevenue._sum.amount ?? 0),
    totalProducts,
    totalUsers,
    recentOrders: recentOrders.map((o) => ({
      ...o,
      total: Number(o.total),
    })),
    ordersByStatus,
    lowStockProducts,
  };
}

export default async function AdminDashboardPage() {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") redirect("/admin/login");

  const stats = await getDashboardStats();

  const completedOrders = stats.ordersByStatus.find((s) => s.status === "COMPLETED")?._count.status ?? 0;
  const processingOrders = stats.ordersByStatus.find((s) => s.status === "PROCESSING")?._count.status ?? 0;
  const cancelledOrders = stats.ordersByStatus.find((s) => s.status === "CANCELLED")?._count.status ?? 0;
  const waitingOrders = stats.ordersByStatus.find((s) => s.status === "WAITING_CONFIRMATION")?._count.status ?? 0;

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

              {/* Welcome */}
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  Selamat Datang, Admin 👋
                </h1>
                <p className="text-muted-foreground text-sm mt-0.5">
                  Berikut ringkasan aktivitas toko Golden Buah hari ini.
                </p>
              </div>

              {/* ─── Stat Cards ─── */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Total Pesanan
                        </p>
                        <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                          {stats.totalOrders}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 dark:bg-cyan-950">
                        <ShoppingCartIcon className="h-6 w-6 text-cyan-600" />
                      </div>
                    </div>
                    <Link
                      href="/admin/dashboard/orders"
                      className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-cyan-600"
                    >
                      Lihat semua <ArrowRightIcon className="h-3 w-3" />
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Menunggu Konfirmasi
                        </p>
                        <p className="mt-1 text-3xl font-bold text-yellow-600">
                          {stats.pendingPayments}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 dark:bg-yellow-950">
                        <ClockIcon className="h-6 w-6 text-yellow-500" />
                      </div>
                    </div>
                    <Link
                      href="/admin/dashboard/payments?status=WAITING_CONFIRMATION"
                      className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-yellow-600"
                    >
                      Konfirmasi sekarang <ArrowRightIcon className="h-3 w-3" />
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Total Pendapatan
                        </p>
                        <p className="mt-1 text-2xl font-bold text-green-600">
                          Rp {stats.totalRevenue.toLocaleString("id-ID")}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 dark:bg-green-950">
                        <TrendingUpIcon className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Dari {completedOrders} pesanan selesai
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Pelanggan
                        </p>
                        <p className="mt-1 text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                          {stats.totalUsers}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 dark:bg-indigo-950">
                        <UsersIcon className="h-6 w-6 text-indigo-500" />
                      </div>
                    </div>
                    <Link
                      href="/admin/dashboard/users"
                      className="mt-3 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-indigo-600"
                    >
                      Kelola pengguna <ArrowRightIcon className="h-3 w-3" />
                    </Link>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {/* ─── Recent Orders ─── */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="px-6 py-4 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Pesanan Terbaru</CardTitle>
                        <CardDescription>7 pesanan terakhir masuk.</CardDescription>
                      </div>
                      <Link
                        href="/admin/dashboard/orders"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        Lihat semua <ArrowRightIcon className="h-3 w-3" />
                      </Link>
                    </CardHeader>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Kode</TableHead>
                            <TableHead>Pelanggan</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Tanggal</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stats.recentOrders.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                                Belum ada pesanan.
                              </TableCell>
                            </TableRow>
                          ) : (
                            stats.recentOrders.map((order) => (
                              <TableRow key={order.id}>
                                <TableCell>
                                  <Link
                                    href={`/admin/dashboard/orders/${order.id}`}
                                    className="font-mono text-xs font-medium text-blue-600 hover:underline"
                                  >
                                    {order.orderCode}
                                  </Link>
                                </TableCell>
                                <TableCell>
                                  <div className="text-sm font-medium">{order.user.name}</div>
                                  <div className="text-xs text-muted-foreground">{order.user.email}</div>
                                </TableCell>
                                <TableCell className="text-right font-medium text-sm">
                                  Rp {order.total.toLocaleString("id-ID")}
                                </TableCell>
                                <TableCell>
                                  <OrderStatusBadge status={order.status as never} />
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  {format(new Date(order.createdAt), "d MMM", { locale: localeId })}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>

                {/* ─── Right Column ─── */}
                <div className="flex flex-col gap-4">
                  {/* Order Status Overview */}
                  <Card>
                    <CardHeader className="px-6 py-4">
                      <CardTitle className="text-base">Status Pesanan</CardTitle>
                      <CardDescription>Ringkasan status semua pesanan.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-5 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" />
                          <span className="text-muted-foreground">Konfirmasi Bayar</span>
                        </div>
                        <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200">
                          {waitingOrders}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                          <span className="text-muted-foreground">Diproses</span>
                        </div>
                        <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200">
                          {processingOrders}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <CheckCircleIcon className="h-2.5 w-2.5 text-green-500" />
                          <span className="text-muted-foreground">Selesai</span>
                        </div>
                        <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">
                          {completedOrders}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <AlertCircleIcon className="h-2.5 w-2.5 text-red-400" />
                          <span className="text-muted-foreground">Dibatalkan</span>
                        </div>
                        <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200">
                          {cancelledOrders}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Low Stock Products */}
                  <Card>
                    <CardHeader className="px-6 py-4 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-base">Stok Menipis</CardTitle>
                        <CardDescription>Produk dengan stok ≤ 10.</CardDescription>
                      </div>
                      <Link
                        href="/admin/dashboard/products"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        Kelola <ArrowRightIcon className="h-3 w-3" />
                      </Link>
                    </CardHeader>
                    <CardContent className="px-6 pb-5">
                      {stats.lowStockProducts.length === 0 ? (
                        <div className="flex flex-col items-center py-4 text-center">
                          <PackageIcon className="h-8 w-8 text-muted-foreground/30 mb-2" />
                          <p className="text-sm text-muted-foreground">Semua stok aman.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {stats.lowStockProducts.map((product) => (
                            <div key={product.id} className="flex items-center justify-between">
                              <span className="text-sm text-foreground truncate max-w-[160px]">
                                {product.name}
                              </span>
                              <Badge
                                variant="outline"
                                className={
                                  product.stock === 0
                                    ? "text-red-700 bg-red-50 border-red-200"
                                    : product.stock <= 5
                                    ? "text-orange-700 bg-orange-50 border-orange-200"
                                    : "text-amber-700 bg-amber-50 border-amber-200"
                                }
                              >
                                {product.stock === 0 ? "Habis" : `${product.stock} sisa`}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Quick Links */}
                  <Card>
                    <CardHeader className="px-6 py-4">
                      <CardTitle className="text-base">Akses Cepat</CardTitle>
                    </CardHeader>
                    <CardContent className="px-6 pb-5 grid grid-cols-2 gap-2">
                      <Link
                        href="/admin/dashboard/products"
                        className="flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center hover:border-emerald-300 hover:bg-emerald-50 transition"
                      >
                        <PackageIcon className="h-5 w-5 text-emerald-500" />
                        <span className="text-xs font-medium text-muted-foreground">Produk</span>
                        <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{stats.totalProducts}</span>
                      </Link>
                      <Link
                        href="/admin/dashboard/payments?status=WAITING_CONFIRMATION"
                        className="flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center hover:border-yellow-300 hover:bg-yellow-50 transition"
                      >
                        <CreditCardIcon className="h-5 w-5 text-violet-500" />
                        <span className="text-xs font-medium text-muted-foreground">Bayar Pending</span>
                        <span className="text-lg font-bold text-yellow-600">{stats.pendingPayments}</span>
                      </Link>
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
