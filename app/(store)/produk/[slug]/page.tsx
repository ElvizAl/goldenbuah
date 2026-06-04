import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Star, ArrowLeft, Package, Award, MessageSquare } from "lucide-react";

import { getProductBySlug } from "@/modules/product/service/product.service";
import { AddToCartButton } from "@/modules/cart/components/add-to-cart-button";
import { Badge } from "@/shared/components/ui/badge";

function formatRupiah(value: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value));
}

function StarRating({ rating, max = 5, size = "md" }: { rating: number; max?: number; size?: "sm" | "md" | "lg" }) {
  const sizeClass = size === "sm" ? "h-3 w-3" : size === "lg" ? "h-6 w-6" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-neutral-200 text-neutral-200"
          }`}
        />
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-8 text-right text-neutral-500">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-neutral-100 overflow-hidden">
        <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-neutral-400">{count}</span>
    </div>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getProductBySlug(slug);
  const product = result.data;
  return {
    title: product ? `${product.name} | Golden Buah` : "Produk Tidak Ditemukan",
    description: product?.description ?? "Buah segar berkualitas tinggi dari Golden Buah.",
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await getProductBySlug(slug);

  if (!result.success || !result.data) notFound();

  const product = result.data;
  const reviews = product.reviews ?? [];

  // Build rating distribution
  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;

  return (
    <main className="min-h-screen bg-neutral-50">
      {/* ── Hero Section ───────────────────────────────────────────── */}
      <div className="relative h-72 md:h-96 w-full overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-emerald-700">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover opacity-30 blur-sm scale-110"
            sizes="100vw"
            priority
          />
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Back button */}
        <div className="absolute top-5 left-5 z-10">
          <Link
            href="/produk"
            className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-4 py-2 text-sm text-white hover:bg-white/30 transition-colors border border-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
        </div>

        {/* Category badge */}
        <div className="absolute top-5 right-5 z-10 flex gap-2">
          <Badge className="bg-white/20 backdrop-blur-sm text-white border border-white/30 text-xs hover:bg-white/20">
            {product.category?.name ?? "Lainnya"}
          </Badge>
          {isLowStock && (
            <Badge className="bg-amber-500/80 backdrop-blur-sm text-white border-none text-xs">Stok Menipis</Badge>
          )}
          {isOutOfStock && (
            <Badge className="bg-red-500/80 backdrop-blur-sm text-white border-none text-xs">Habis</Badge>
          )}
        </div>

        {/* Product name at bottom of hero */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg leading-tight">
            {product.name}
          </h1>
          {product.avgRating !== null && (
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={product.avgRating} size="sm" />
              <span className="text-amber-300 font-bold text-sm">{product.avgRating.toFixed(1)}</span>
              <span className="text-white/60 text-sm">({reviews.length} ulasan)</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 -mt-6 pb-20 relative z-10">

        {/* ── Product Info Card ───────────────────────────────────── */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">

            {/* Left: big product image */}
            <div className="relative md:w-72 h-64 md:h-auto shrink-0 bg-neutral-100">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 288px"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-neutral-300">
                  <Package className="h-16 w-16" />
                  <span className="text-xs">No Image</span>
                </div>
              )}
            </div>

            {/* Right: info */}
            <div className="flex-1 p-6 md:p-8 flex flex-col gap-6">

              {/* Price & stock */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-3xl font-extrabold text-green-700">
                    {formatRupiah(product.price)}
                    <span className="text-base font-normal text-neutral-400">/kg</span>
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`h-2 w-2 rounded-full ${isOutOfStock ? "bg-red-500" : isLowStock ? "bg-amber-500" : "bg-green-500"}`} />
                    <p className="text-sm text-neutral-500">
                      {isOutOfStock ? "Stok habis" : `${product.stock} kg tersedia`}
                    </p>
                  </div>
                </div>

                {/* Stats chips */}
                <div className="flex flex-col gap-1.5 items-end">
                  {product.avgRating !== null && (
                    <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 border border-amber-100">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-amber-600">{product.avgRating.toFixed(1)}</span>
                    </div>
                  )}
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 border border-blue-100">
                      <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                      <span className="text-sm font-bold text-blue-600">{reviews.length}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <p className="text-sm text-neutral-600 leading-relaxed border-t border-neutral-100 pt-4">
                  {product.description}
                </p>
              )}

              {/* Features pills */}
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  <Award className="h-3 w-3" /> Kualitas Premium
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  🌿 100% Segar
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 border border-green-100 px-3 py-1 text-xs font-medium text-green-700">
                  📦 Per Kilogram
                </span>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-3 pt-2 border-t border-neutral-100">
                <AddToCartButton
                  productId={product.id}
                  productName={product.name}
                  stock={product.stock}
                />
                <p className="text-xs text-neutral-400">
                  {isOutOfStock ? "Produk ini sedang tidak tersedia" : "Tambah ke keranjang belanja"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Reviews Section ─────────────────────────────────────── */}
        <div className="mt-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 rounded-full bg-green-500" />
            <h2 className="text-xl font-bold text-neutral-900">Ulasan Pembeli</h2>
            {reviews.length > 0 && (
              <span className="ml-1 rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-semibold text-neutral-500">
                {reviews.length}
              </span>
            )}
          </div>

          {reviews.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100">
                <Star className="h-8 w-8 text-neutral-300" />
              </div>
              <p className="font-semibold text-neutral-600">Belum ada ulasan</p>
              <p className="mt-1 text-sm text-neutral-400">Jadilah yang pertama memberikan ulasan untuk produk ini!</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">

              {/* Rating summary sidebar */}
              <div className="bg-white rounded-3xl p-6 shadow-sm h-fit">
                <div className="text-center mb-5">
                  <p className="text-6xl font-extrabold text-neutral-900">
                    {product.avgRating!.toFixed(1)}
                  </p>
                  <StarRating rating={product.avgRating!} size="lg" />
                  <p className="mt-1 text-sm text-neutral-400">{reviews.length} ulasan</p>
                </div>
                <div className="space-y-2">
                  {ratingDist.map(({ star, count }) => (
                    <RatingBar
                      key={star}
                      label={`${star}★`}
                      count={count}
                      total={reviews.length}
                    />
                  ))}
                </div>
              </div>

              {/* Review list */}
              <div className="md:col-span-2 space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-green-400 to-emerald-600">
                        {review.user.image ? (
                          <Image
                            src={review.user.image}
                            alt={review.user.name ?? "User"}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                            {review.user.name?.charAt(0).toUpperCase() ?? "U"}
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div>
                            <p className="font-semibold text-neutral-800 text-sm leading-tight">
                              {review.user.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <StarRating rating={review.rating} size="sm" />
                              <span className="text-[11px] font-bold text-amber-500">{review.rating}.0</span>
                            </div>
                          </div>
                          <p className="text-xs text-neutral-400 shrink-0">
                            {new Date(review.createdAt).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                        </div>

                        {review.comment && (
                          <p className="mt-2.5 text-sm text-neutral-600 leading-relaxed">
                            {review.comment}
                          </p>
                        )}

                        {review.imageUrl && (
                          <div className="mt-3 relative h-36 w-36 rounded-xl overflow-hidden ring-1 ring-neutral-100">
                            <Image
                              src={review.imageUrl}
                              alt="Foto ulasan"
                              fill
                              className="object-cover"
                              sizes="144px"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
