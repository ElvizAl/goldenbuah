import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { getCartItemCount } from "@/modules/cart/service/cart.service";

export async function CartBadge() {
  const count = await getCartItemCount();

  return (
    <Link href="/cart" className="relative inline-flex items-center">
      <ShoppingBag className="h-6 w-6 text-neutral-700 hover:text-neutral-900 transition-colors" />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#01BC1D] text-[10px] font-bold text-white leading-none">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
