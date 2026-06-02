import React from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  PackageIcon,
  TrendingUpIcon,
  ShoppingBagIcon,
  StarIcon,
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
  searchParams: Promise<{ month?: string; year?: string; limit?: string }>;
}

async function getProductReport(
  year: number,
  month: number,
  topN: number
) {
  const start = startOfMonth(new Date(year, month - 1));
  const end = endOfMonth(new Date(year, month - 1));

  // Best sellers by quantity sold
  const topProducts = await prisma.orderItem.groupBy({
    by: ["productId", "productName"],
    where: {
      order: {
        createdAt: { gte: start, lte: end },
        status: { not: "CANCELLED" },
      },
    },
    _sum: { quantity: true, subtotal: true },
    _count: { id: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: topN,
  });

  // Enrich with product image
  const productIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, imageUrl: true, stock: true, category: { select: { name: true } } },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  // All-time best sellers (no date filter)
  const allTimeBest = await prisma.orderItem.groupBy({
    by: ["productId", "productName"],
    where: {
      order: { status: { not: "CANCELLED" } },
    },
    _sum: { quantity: true, subtotal: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  // Totals for period
  const totalItemsSold = topProducts.reduce(
    (sum, p) => sum + Number(p._sum.quantity ?? 0),
    0
  );
  const totalRevenue = topProducts.reduce(
    (sum, p) => sum + Number(p._sum.subtotal ?? 0),
    0
  );

  // Category breakdown for period
  const categoryBreakdown = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: { gte: start, lte: end },
        status: { not: "CANCELLED" },
      },
    },
    include: {
      product: { include: { category: true } },
    },
  });

  const catMap = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const item of categoryBreakdown) {
    const catName = item.product.category?.name ?? "Tanpa Kategori";
    const existing = catMap.get(catName) ?? { name: catName, qty: 0, revenue: 0 };
    existing.qty += item.quantity;
    existing.revenue += Number(item.subtotal);
    catMap.set(catName, existing);
  }
  const categoryStats = [...catMap.values()].sort((a, b) => b.qty - a.qty);

  return {
    topProducts: topProducts.map((p) => ({
      ...p,
      product: productMap.get(p.productId),
    })),
    allTimeBest,
    totalItemsSold,
    totalRevenue,
    categoryStats,
  };
}

export default async function ProductsReportPage({ searchParams }: Props) {
  const user = await getUser();
  if (!user || user.role !== "ADMIN") redirect("/admin/login");

  const params = await searchParams;
  const now = new Date();
  const year = parseInt(params.year ?? String(now.getFullYear()), 10);
  const month = parseInt(params.month ?? String(now.getMonth() + 1), 10);
  const topN = parseInt(params.limit ?? "20", 10);

  const data = await getProductReport(year, month, topN);

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
                    Produk Terlaris
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
                    basePath="/admin/dashboard/reports/products"
                  />
                  <ExportPdfButton label="Export PDF" />
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Total Item Terjual
                        </p>
                        <p className="mt-1 text-3xl font-bold">{data.totalItemsSold}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">unit</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50">
                        <ShoppingBagIcon className="h-6 w-6 text-pink-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Total Omzet
                        </p>
                        <p className="mt-1 text-xl font-bold text-green-600">
                          Rp {data.totalRevenue.toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">dari produk di atas</p>
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
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Produk Aktif Terjual
                        </p>
                        <p className="mt-1 text-3xl font-bold">{data.topProducts.length}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">jenis produk</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
                        <PackageIcon className="h-6 w-6 text-indigo-500" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                {/* Main Table */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader className="px-6 py-4">
                      <CardTitle className="text-base">
                        Peringkat Produk — {selectedLabel}
                      </CardTitle>
                      <CardDescription>
                        Diurutkan berdasarkan jumlah unit terjual (pesanan tidak dibatalkan).
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-10 text-center">#</TableHead>
                              <TableHead>Produk</TableHead>
                              <TableHead className="text-right">Qty Terjual</TableHead>
                              <TableHead className="text-right">Omzet</TableHead>
                              <TableHead className="text-right">Rata-rata / order</TableHead>
                              <TableHead>Stok Sisa</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.topProducts.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                                  Tidak ada penjualan pada periode ini.
                                </TableCell>
                              </TableRow>
                            ) : (
                              data.topProducts.map((item, idx) => {
                                const qty = Number(item._sum.quantity ?? 0);
                                const revenue = Number(item._sum.subtotal ?? 0);
                                const avgPerOrder = item._count.id > 0
                                  ? Math.round(qty / item._count.id)
                                  : 0;
                                const stock = item.product?.stock ?? null;

                                return (
                                  <TableRow key={item.productId}>
                                    <TableCell className="text-center">
                                      {idx === 0 ? (
                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 text-xs font-bold text-yellow-700">
                                          1
                                        </span>
                                      ) : idx === 1 ? (
                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                          2
                                        </span>
                                      ) : idx === 2 ? (
                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-600">
                                          3
                                        </span>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">{idx + 1}</span>
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2.5">
                                        {item.product?.imageUrl ? (
                                          <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg border bg-neutral-100">
                                            <Image
                                              src={item.product.imageUrl}
                                              alt={item.productName}
                                              fill
                                              className="object-cover"
                                            />
                                          </div>
                                        ) : (
                                          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border bg-neutral-100">
                                            <PackageIcon className="h-4 w-4 text-neutral-400" />
                                          </div>
                                        )}
                                        <div>
                                          <p className="text-sm font-medium">{item.productName}</p>
                                          {item.product?.category?.name && (
                                            <p className="text-xs text-muted-foreground">
                                              {item.product.category.name}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold">
                                      {qty} unit
                                    </TableCell>
                                    <TableCell className="text-right font-medium text-green-600">
                                      Rp {revenue.toLocaleString("id-ID")}
                                    </TableCell>
                                    <TableCell className="text-right text-sm text-muted-foreground">
                                      {avgPerOrder} unit
                                    </TableCell>
                                    <TableCell>
                                      {stock === null ? (
                                        <span className="text-xs text-muted-foreground">—</span>
                                      ) : stock === 0 ? (
                                        <Badge variant="outline" className="text-red-700 bg-red-50 border-red-200">Habis</Badge>
                                      ) : stock <= 5 ? (
                                        <Badge variant="outline" className="text-orange-700 bg-orange-50 border-orange-200">{stock} sisa</Badge>
                                      ) : (
                                        <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">{stock} sisa</Badge>
                                      )}
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
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-4">
                  {/* All Time Top 5 */}
                  <Card>
                    <CardHeader className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <StarIcon className="h-4 w-4 text-yellow-500" />
                        <CardTitle className="text-base">Top 5 Sepanjang Masa</CardTitle>
                      </div>
                      <CardDescription>Produk terlaris tanpa batasan waktu.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-5 space-y-3">
                      {data.allTimeBest.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Belum ada data.</p>
                      ) : (
                        data.allTimeBest.map((item, idx) => (
                          <div key={item.productId} className="flex items-center gap-2">
                            <span className="text-sm font-bold text-muted-foreground w-5 text-center">
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.productName}</p>
                            </div>
                            <span className="text-sm font-semibold text-pink-600">
                              {Number(item._sum.quantity ?? 0)} unit
                            </span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Category Breakdown */}
                  <Card>
                    <CardHeader className="px-6 py-4">
                      <CardTitle className="text-base">Per Kategori</CardTitle>
                      <CardDescription>Penjualan berdasarkan kategori buah — {selectedLabel}.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-5 space-y-3">
                      {data.categoryStats.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Belum ada data.</p>
                      ) : (
                        data.categoryStats.map((cat) => {
                          const pct = data.totalItemsSold > 0
                            ? Math.round((cat.qty / data.totalItemsSold) * 100)
                            : 0;
                          return (
                            <div key={cat.name}>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="font-medium">{cat.name}</span>
                                <span className="text-muted-foreground">{cat.qty} unit ({pct}%)</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-gray-100">
                                <div
                                  className="h-2 rounded-full bg-pink-400"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
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
