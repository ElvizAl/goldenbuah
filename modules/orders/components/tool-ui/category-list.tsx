"use client";

import Image from "next/image";

interface Category {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
}

interface Props {
  categories: Category[];
  onSelect: (slug: string) => void;
}

export function CategoryList({ categories, onSelect }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {categories.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect(c.slug)}
          className="flex flex-col items-center gap-1.5 rounded-2xl border bg-white p-2.5 text-left shadow-sm transition hover:border-green-400 hover:shadow-md active:scale-95"
        >
          <div className="relative h-16 w-full overflow-hidden rounded-xl bg-neutral-100">
            {c.imageUrl ? (
              <Image src={c.imageUrl} alt={c.name} fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl">🍎</div>
            )}
          </div>
          <p className="text-xs font-semibold text-neutral-700 text-center leading-tight">{c.name}</p>
        </button>
      ))}
    </div>
  );
}
