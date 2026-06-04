"use client";

import { useState } from "react";
import { Star, CheckCircle2 } from "lucide-react";
import Image from "next/image";

import { ReviewForm } from "./review-form";

interface ExistingReview {
  productId: string;
  rating: number;
  comment?: string | null;
  imageUrl?: string | null;
}

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImageUrl?: string | null;
}

interface OrderReviewSectionProps {
  orderId: string;
  items: OrderItem[];
  existingReviews: ExistingReview[];
}

export function OrderReviewSection({
  orderId,
  items,
  existingReviews,
}: OrderReviewSectionProps) {
  // Track which products have been reviewed (including newly submitted)
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(
    new Set(existingReviews.map((r) => r.productId))
  );
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  const pendingItems = items.filter((item) => !reviewedIds.has(item.productId));
  const reviewedItems = items.filter((item) => reviewedIds.has(item.productId));

  function handleSuccess(productId: string) {
    setReviewedIds((prev) => new Set([...prev, productId]));
    setActiveProductId(null);
  }

  return (
    <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5">
      <h2 className="mb-4 text-sm font-bold text-neutral-700">Ulasan Produk</h2>

      {pendingItems.length === 0 && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          Semua produk sudah diulas. Terima kasih!
        </div>
      )}

      {/* Pending reviews */}
      {pendingItems.length > 0 && (
        <div className="space-y-3">
          {pendingItems.map((item) => (
            <div key={item.productId}>
              {activeProductId === item.productId ? (
                <div className="rounded-xl border border-cyan-100 bg-white p-4">
                  <ReviewForm
                    orderId={orderId}
                    productId={item.productId}
                    productName={item.productName}
                    productImageUrl={item.productImageUrl}
                    onSuccess={() => handleSuccess(item.productId)}
                  />
                  <button
                    type="button"
                    onClick={() => setActiveProductId(null)}
                    className="mt-3 w-full rounded-xl border border-neutral-200 py-2 text-xs text-neutral-500 transition hover:bg-neutral-50"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-4">
                  {item.productImageUrl ? (
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50">
                      <Image
                        src={item.productImageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50 text-base">
                      🛒
                    </div>
                  )}
                  <p className="flex-1 truncate text-sm font-medium text-neutral-700">
                    {item.productName}
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveProductId(item.productId)}
                    className="flex-shrink-0 rounded-lg bg-yellow-400 px-3 py-1.5 text-xs font-semibold text-yellow-900 transition hover:bg-yellow-500"
                  >
                    Ulas
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Already reviewed */}
      {reviewedItems.length > 0 && (
        <div className="mt-3 space-y-2">
          {reviewedItems.map((item) => {
            const review =
              existingReviews.find((r) => r.productId === item.productId) ??
              null;
            return (
              <div
                key={item.productId}
                className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-white p-4 opacity-70"
              >
                {item.productImageUrl ? (
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-neutral-100 bg-neutral-50">
                    <Image
                      src={item.productImageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-neutral-100 bg-neutral-50 text-base">
                    🛒
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-neutral-700">
                    {item.productName}
                  </p>
                  {review && (
                    <div className="mt-0.5 flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`h-3.5 w-3.5 ${
                            s <= review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-neutral-200"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <span className="flex-shrink-0 text-xs font-semibold text-green-600">
                  Sudah diulas
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
