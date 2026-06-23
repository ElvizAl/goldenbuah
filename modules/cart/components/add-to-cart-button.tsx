"use client";

import { useState, useTransition } from "react";
import { ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/shared/components/ui/button";
import { addToCartAction } from "@/modules/cart/service/cart.service";

interface AddToCartButtonProps {
  productId: string;
  productName: string;
  stock: number;
  /** tampilan varian: "default" tombol full, "icon" hanya ikon */
  variant?: "default" | "icon";
  className?: string;
}

export function AddToCartButton({
  productId,
  productName,
  stock,
  variant = "default",
  className,
}: AddToCartButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quantity] = useState(1);

  const isOutOfStock = stock === 0;

  function handleAdd() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("productId", productId);
      formData.set("quantity", String(quantity));

      const result = await addToCartAction(formData);

      if (result.success) {
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={handleAdd}
        disabled={isPending || isOutOfStock}
        className={`inline-flex items-center justify-center rounded-full bg-[#01BC1D] p-2 text-white transition-colors hover:bg-[#0d9622] disabled:cursor-not-allowed disabled:opacity-50 ${className ?? ""}`}
        title={isOutOfStock ? "Stok habis" : `Tambah ${productName} ke keranjang`}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShoppingCart className="h-4 w-4" />
        )}
      </button>
    );
  }

  return (
    <Button
      type="button"
      size="sm"
      disabled={isPending || isOutOfStock}
      onClick={handleAdd}
      className={`h-8 rounded-full bg-[#01BC1D] px-6 text-xs font-bold text-white hover:bg-[#0d9622] transition-colors ${className ?? ""}`}
    >
      {isPending ? (
        <span className="inline-flex items-center gap-1.5">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Menambahkan…
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5">
          <ShoppingCart className="h-3.5 w-3.5" />
          {isOutOfStock ? "Habis" : "Add"}
        </span>
      )}
    </Button>
  );
}
