import Image from "next/image";
import { Star, User } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

import { getAllReviews } from "@/modules/orders/service/admin-review.service";
import { AdminDeleteReviewBtn } from "@/modules/orders/components/admin-delete-review-btn";
import { AppSidebar } from "@/shared/components/app-sidebar";
import { SiteHeader } from "@/shared/components/site-header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table";
import { Badge } from "@/shared/components/ui/badge";

export const dynamic = "force-dynamic";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i < rating ? "fill-amber-400 text-amber-400" : "text-neutral-200"}`}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-amber-600">{rating}.0</span>
    </div>
  );
}

export default async function AdminReviewsPage() {
  const result = await getAllReviews();
  const reviews = result.success ? result.data ?? [] : [];

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
      : 0;

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
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                  Ulasan Produk
                </h1>
                <p className="text-muted-foreground text-sm">
                  Kelola semua ulasan yang diberikan pelanggan terhadap produk.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-1 pt-4 px-4">
                    <CardDescription className="text-xs">Total Ulasan</CardDescription>
                    <CardTitle className="text-2xl">{reviews.length}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-1 pt-4 px-4">
                    <CardDescription className="text-xs">Rata-rata Rating</CardDescription>
                    <CardTitle className="text-2xl flex items-center gap-1">
                      <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                      {avgRating.toFixed(1)}
                    </CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-1 pt-4 px-4">
                    <CardDescription className="text-xs">Rating Bintang 5</CardDescription>
                    <CardTitle className="text-2xl">
                      {reviews.filter((r) => r.rating === 5).length}
                    </CardTitle>
                  </CardHeader>
                </Card>
              </div>

              {/* Table */}
              <Card>
                <CardHeader className="px-6 py-4">
                  <CardTitle className="text-lg">Daftar Semua Ulasan</CardTitle>
                  <CardDescription>
                    {reviews.length} ulasan dari pelanggan terdaftar.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12 text-center">No</TableHead>
                          <TableHead className="min-w-[160px]">Pelanggan</TableHead>
                          <TableHead className="min-w-[160px]">Produk</TableHead>
                          <TableHead className="min-w-[100px]">Rating</TableHead>
                          <TableHead className="min-w-[260px]">Komentar</TableHead>
                          <TableHead className="min-w-[120px]">Pesanan</TableHead>
                          <TableHead className="min-w-[120px]">Tanggal</TableHead>
                          <TableHead className="text-right w-16">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reviews.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center py-10 text-neutral-400">
                              Belum ada ulasan produk.
                            </TableCell>
                          </TableRow>
                        ) : (
                          reviews.map((review, idx) => (
                            <TableRow key={review.id}>
                              <TableCell className="text-center text-neutral-400 text-sm">
                                {idx + 1}
                              </TableCell>

                              {/* Pelanggan */}
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {review.user?.image ? (
                                    <div className="relative h-8 w-8 rounded-full overflow-hidden shrink-0">
                                      <Image
                                        src={review.user.image}
                                        alt={review.user.name ?? ""}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                                      <User className="h-4 w-4 text-neutral-400" />
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{review.user?.name ?? "—"}</p>
                                    <p className="text-xs text-neutral-400 truncate">{review.user?.email}</p>
                                  </div>
                                </div>
                              </TableCell>

                              {/* Produk */}
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {review.product?.imageUrl ? (
                                    <div className="relative h-8 w-8 rounded-lg overflow-hidden shrink-0 border">
                                      <Image
                                        src={review.product.imageUrl}
                                        alt={review.product.name}
                                        fill
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : null}
                                  <p className="text-sm font-medium line-clamp-2">{review.product?.name ?? "—"}</p>
                                </div>
                              </TableCell>

                              {/* Rating */}
                              <TableCell>
                                <StarRating rating={review.rating} />
                              </TableCell>

                              {/* Komentar */}
                              <TableCell>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 max-w-xs">
                                  {review.comment ?? <span className="italic text-neutral-400">Tanpa komentar</span>}
                                </p>
                              </TableCell>

                              {/* Pesanan */}
                              <TableCell>
                                <Badge variant="outline" className="font-mono text-xs">
                                  {review.order?.orderCode ?? "—"}
                                </Badge>
                              </TableCell>

                              {/* Tanggal */}
                              <TableCell className="text-xs text-neutral-500">
                                {format(new Date(review.createdAt), "d MMM yyyy", { locale: id })}
                              </TableCell>

                              {/* Aksi */}
                              <TableCell className="text-right">
                                <AdminDeleteReviewBtn
                                  id={review.id}
                                  userName={review.user?.name ?? "pelanggan"}
                                />
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
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
