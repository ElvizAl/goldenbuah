import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { getUser } from "@/modules/auth/auth-session";
import { getMyOrders } from "@/modules/orders/service/order.service";
import { OrderCard } from "@/modules/orders/components/order-card";

export default async function OrdersPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const { data: orders } = await getMyOrders();

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
          <div className="flex-1 rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-sm">
            <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
            <h1 className="text-2xl font-bold text-neutral-800">
              Belum ada pesanan
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Yuk mulai belanja buah segar kami!
            </p>
            <div className="mt-6 flex justify-center">
              <Link
                href="/produk"
                className="rounded-xl bg-yellow-400 px-6 py-2.5 text-sm font-semibold text-yellow-900 transition hover:bg-yellow-500"
              >
                Lihat Produk
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
            <h1 className="text-2xl font-bold text-neutral-800">
              Pesanan Saya
            </h1>
          </div>

          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
