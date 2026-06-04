import { redirect } from "next/navigation";
import Link from "next/link";
import { Star, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";

import { getUser } from "@/modules/auth/auth-session";
import { getCompletedOrdersForReview } from "@/modules/orders/service/review.service";
import { OrderReviewSection } from "@/modules/orders/components/order-review-section";

export default async function ReviewsPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const { data: orders } = await getCompletedOrdersForReview();

  if (!orders || orders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
          <div className="flex-1 rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-sm">
            <MessageSquare className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
            <h1 className="text-2xl font-bold text-neutral-800">
              Belum ada pesanan selesai
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Selesaikan pesanan kamu terlebih dahulu untuk bisa memberikan ulasan.
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/profile/orders"
                className="rounded-xl bg-yellow-400 px-6 py-2.5 text-sm font-semibold text-yellow-900 transition hover:bg-yellow-500"
              >
                Lihat Pesanan
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <div className="flex-1 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-5">
            <h1 className="text-2xl font-bold text-neutral-800">Ulasan Saya</h1>
          </div>

          <div className="space-y-6">
            {orders.map((order) => {
              const allReviewed = order.items.every((item) =>
                order.reviews.some((r) => r.productId === item.productId)
              );

              return (
                <div key={order.id} className="space-y-2">
                  {/* Order header */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-neutral-500">
                        {order.orderCode}
                      </span>
                      <span className="text-xs text-neutral-400">
                        · {format(new Date(order.createdAt), "d MMM yyyy", { locale: localeId })}
                      </span>
                    </div>
                    {allReviewed ? (
                      <span className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
                        <Star className="h-3 w-3 fill-green-500 text-green-500" />
                        Semua diulas
                      </span>
                    ) : (
                      <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-semibold text-yellow-700">
                        Belum diulas
                      </span>
                    )}
                  </div>

                  {/* Review section per order */}
                  <OrderReviewSection
                    orderId={order.id}
                    items={order.items}
                    existingReviews={order.reviews}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
