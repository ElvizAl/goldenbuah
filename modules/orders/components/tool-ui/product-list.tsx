"use client";

import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/modules/cart/components/add-to-cart-button";

interface Product {
  id: string;
  name: string;
  slug: string;
  url?: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  description: string | null;
}

interface Props {
  products: Product[];
}

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export function ProductList({ products }: Props) {
  if (products.length === 0) {
    return (
      <p className="rounded-xl bg-neutral-100 px-4 py-3 text-sm text-neutral-500">
        Tidak ada produk ditemukan.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {products.map((product) => (
        <div
          key={product.id}
          className="flex items-center gap-3 rounded-2xl border bg-white p-2.5 shadow-sm transition hover:border-green-400 hover:shadow-md"
        >
          <Link
            href={product.url ?? `/produk/${product.slug}`}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-neutral-50">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-neutral-400">
                  GB
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-neutral-800">
                {product.name}
              </p>
              <p className="text-xs font-bold text-green-600">
                {formatRupiah(product.price)}/kg
              </p>
              {product.stock === 0 && (
                <p className="text-[10px] text-red-500">Habis</p>
              )}
            </div>
          </Link>

          <AddToCartButton
            productId={product.id}
            productName={product.name}
            stock={product.stock}
            variant="icon"
            className="h-9 w-9 shrink-0"
          />
        </div>
      ))}
    </div>
  );
}
