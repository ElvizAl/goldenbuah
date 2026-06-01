import { redirect } from "next/navigation";

import { getUser } from "@/modules/auth/auth-session";
import { getMyCart } from "@/modules/cart/service/cart.service";
import { CartContent } from "@/modules/cart/components/cart-content";

export const metadata = {
  title: "Keranjang Belanja | Golden Fruit",
  description: "Lihat dan kelola keranjang belanja kamu.",
};

export default async function CartPage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const result = await getMyCart();
  const items = result.data?.items ?? [];

  return (
    <main className="min-h-screen bg-neutral-50">
      <CartContent items={items} />
    </main>
  );
}
