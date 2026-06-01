import { redirect } from "next/navigation";
import { ShoppingBag } from "lucide-react";

import { getUser } from "@/modules/auth/auth-session";
import { getMyOrders } from "@/modules/orders/service/order.service";
import { OrderCard } from "@/modules/orders/components/order-card";

export default async function OrdersPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const { data: orders } = await getMyOrders();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Pesanan Saya</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-16 text-center">
          <ShoppingBag className="mb-3 h-12 w-12 text-gray-300" />
          <p className="text-base font-medium text-gray-500">
            Belum ada pesanan
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Yuk mulai belanja buah segar kami!
          </p>
          <a
            href="/produk"
            className="mt-4 rounded-lg bg-yellow-400 px-5 py-2 text-sm font-medium text-yellow-900 transition hover:bg-yellow-500"
          >
            Lihat Produk
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
