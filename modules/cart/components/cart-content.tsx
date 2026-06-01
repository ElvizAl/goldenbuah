"use client";

import { useTransition } from "react";
import Link from "next/link";
import { ShoppingCart, Trash2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/components/ui/button";
import { CartItemRow } from "@/modules/cart/components/cart-item-row";
import { clearCartAction } from "@/modules/cart/service/cart.service";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    stock: number;
    imageUrl: string | null;
  };
}

interface CartContentProps {
  items: CartItem[];
}

export function CartContent({ items }: CartContentProps) {
  const router = useRouter();
  const [isPendingClear, startClearTransition] = useTransition();

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  function handleClearCart() {
    startClearTransition(async () => {
      const result = await clearCartAction();

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-24 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-neutral-100">
          <ShoppingCart className="h-12 w-12 text-neutral-300" />
        </div>
        <div>
          <p className="text-xl font-bold text-neutral-700">Keranjang kamu kosong</p>
          <p className="mt-1 text-sm text-neutral-500">
            Yuk tambahkan buah segar ke keranjang!
          </p>
        </div>
        <Button asChild className="rounded-full bg-[#01BC1D] px-8 hover:bg-[#0d9622]">
          <Link href="/produk">Lihat Produk</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-neutral-900">
          Keranjang Belanja
          <span className="ml-2 text-base font-normal text-neutral-500">
            ({totalItems} item)
          </span>
        </h1>

        <button
          type="button"
          onClick={handleClearCart}
          disabled={isPendingClear}
          className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPendingClear ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
          Kosongkan Keranjang
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Daftar Item */}
        <div className="flex flex-col gap-3 lg:col-span-2">
          {items.map((item) => (
            <CartItemRow key={item.id} item={item} />
          ))}
        </div>

        {/* Ringkasan Order */}
        <div className="h-fit rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-bold text-neutral-800">Ringkasan Pesanan</h2>

          <div className="space-y-3 text-sm text-neutral-600">
            <div className="flex justify-between">
              <span>Subtotal ({totalItems} item)</span>
              <span className="font-semibold text-neutral-900">{formatRupiah(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkos Kirim</span>
              <span className="text-neutral-400">Dihitung saat checkout</span>
            </div>
          </div>

          <div className="my-4 border-t border-neutral-100" />

          <div className="flex justify-between text-base font-bold text-neutral-900">
            <span>Total</span>
            <span className="text-green-600">{formatRupiah(subtotal)}</span>
          </div>

          <Button
            asChild
            className="mt-5 w-full rounded-full bg-[#01BC1D] font-bold text-white hover:bg-[#0d9622]"
          >
            <Link href="/checkout" className="inline-flex items-center justify-center gap-2">
              Lanjut ke Checkout
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="mt-2 w-full rounded-full"
          >
            <Link href="/produk">Lanjut Belanja</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
