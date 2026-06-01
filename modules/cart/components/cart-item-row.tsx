"use client";

import { useTransition } from "react";
import Image from "next/image";
import { Minus, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { removeCartItemAction, updateCartItemAction } from "@/modules/cart/service/cart.service";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

interface CartItemRowProps {
  item: {
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
      stock: number;
      imageUrl: string | null;
    };
  };
}

export function CartItemRow({ item }: CartItemRowProps) {
  const router = useRouter();
  const [isPendingUpdate, startUpdateTransition] = useTransition();
  const [isPendingRemove, startRemoveTransition] = useTransition();

  const subtotal = item.product.price * item.quantity;

  function handleQtyChange(newQty: number) {
    if (newQty < 1) return;

    startUpdateTransition(async () => {
      const formData = new FormData();
      formData.set("quantity", String(newQty));

      const result = await updateCartItemAction(item.id, formData);

      if (result.success) {
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleRemove() {
    startRemoveTransition(async () => {
      const result = await removeCartItemAction(item.id);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  const isPending = isPendingUpdate || isPendingRemove;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm">
      {/* Gambar Produk */}
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
        {item.product.imageUrl ? (
          <Image
            src={item.product.imageUrl}
            alt={item.product.name}
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-bold text-neutral-400">
            N/A
          </div>
        )}
      </div>

      {/* Info Produk */}
      <div className="flex flex-1 flex-col gap-1">
        <p className="font-semibold text-neutral-800 line-clamp-2">{item.product.name}</p>
        <p className="text-sm font-bold text-green-600">{formatRupiah(item.product.price)}/kg</p>

        {/* Kontrol Qty */}
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleQtyChange(item.quantity - 1)}
            disabled={isPending || item.quantity <= 1}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>

          <span className="w-8 text-center text-sm font-semibold text-neutral-800">
            {isPendingUpdate ? (
              <Loader2 className="mx-auto h-4 w-4 animate-spin" />
            ) : (
              item.quantity
            )}
          </span>

          <button
            type="button"
            onClick={() => handleQtyChange(item.quantity + 1)}
            disabled={isPending || item.quantity >= item.product.stock}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-600 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Subtotal + Hapus */}
      <div className="flex flex-col items-end gap-2">
        <p className="text-sm font-extrabold text-neutral-900">{formatRupiah(subtotal)}</p>

        <button
          type="button"
          onClick={handleRemove}
          disabled={isPendingRemove}
          className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-2.5 py-1 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPendingRemove ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
          Hapus
        </button>
      </div>
    </div>
  );
}
