import Image from "next/image";
import { Star } from "lucide-react";

import { Card, CardContent } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";

const featuredProducts = [
  {
    name: "Pisang Sunrise",
    description: "Pisang segar khas lokal yang ditanam petani lokal.  khas lokal yang ditanam petani lokal p-6 pt-10 flex flex-col justify-between",
    price: "Rp15.000/kg",
    badge: "Lokal",
    rating: "5.0",
    image: "/hero.png", // fallback image that exists in public
  },
  {
    name: "Pisang Sunrise",
    description: "Pisang segar khas lokal yang ditanam petani lokal.  khas lokal yang ditanam petani lokal p-6 pt-10 flex flex-col justify-between",
    price: "Rp15.000/kg",
    badge: "Lokal",
    rating: "5.0",
    image: "/hero.png",
  },
  {
    name: "Pisang Sunrise",
    description: "Pisang segar khas lokal yang ditanam petani lokal.  khas lokal yang ditanam petani lokal p-6 pt-10 flex flex-col justify-between",
    price: "Rp15.000/kg",
    badge: "Lokal",
    rating: "5.0",
    image: "/hero.png",
  },
  {
    name: "Pisang Sunrise",
    description: "Pisang segar khas lokal yang ditanam petani lokal.  khas lokal yang ditanam petani lokal p-6 pt-10 flex flex-col justify-between",
    price: "Rp15.000/kg",
    badge: "Lokal",
    rating: "5.0",
    image: "/hero.png", // fallback image that exists in public
  },
  {
    name: "Pisang Sunrise",
    description: "Pisang segar khas lokal yang ditanam petani lokal.  khas lokal yang ditanam petani lokal p-6 pt-10 flex flex-col justify-between",
    price: "Rp15.000/kg",
    badge: "Lokal",
    rating: "5.0",
    image: "/hero.png",
  },
  {
    name: "Pisang Sunrise",
    description: "Pisang segar khas lokal yang ditanam petani lokal.  khas lokal yang ditanam petani lokal p-6 pt-10 flex flex-col justify-between",
    price: "Rp15.000/kg",
    badge: "Lokal",
    rating: "5.0",
    image: "/hero.png",
  },
];

export function FeaturedProductSection() {
  return (
    <section className="w-full bg-white px-4 py-16 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-24 text-center">
          <h2 className="text-3xl font-bold tracking-tighter text-neutral-900 sm:text-4xl md:text-5xl">
            Produk Unggulan
          </h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Pilihan produk segar terbaik untuk kamu.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-x-8 gap-y-24 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product, index) => (
            <Card
              key={index}
              className="relative h-60 flex flex-col justify-between overflow-visible rounded-[24px] border-none bg-[#d9d9d9] shadow-sm transition hover:-translate-y-1 hover:shadow-md pt-12"
            >
              {/* Product Image Circular Badge */}
              <div className="absolute -top-14 left-6 z-10 h-28 w-28 overflow-hidden rounded-full bg-black border-2 border-white shadow-md">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>

              {/* Badges container on the top right */}
              <div className="absolute right-5 top-5 flex items-center gap-3">
                <Badge className="rounded bg-blue-600 px-2.5 py-0.5 text-[10px] font-semibold text-white hover:bg-blue-600 border-none">
                  {product.badge}
                </Badge>

                <span className="inline-flex items-center gap-0.5 text-xs font-bold text-orange-400">
                  {product.rating}
                  <Star className="h-3 w-3 fill-orange-400 text-orange-400" />
                </span>
              </div>

              <CardContent className="p-6 pt-5 flex flex-col justify-between h-full w-full">
                <div className="mt-2">
                  <h3 className="text-2xl font-extrabold text-green-700">
                    {product.name}
                  </h3>

                  <p className="mt-2 text-xs font-medium leading-relaxed text-neutral-700">
                    {product.description}
                  </p>
                </div>

                <div className="mt-auto -bottom-5 pt-4 flex items-center justify-between">
                  <Button
                    size="sm"
                    className="h-8 rounded-full bg-green-600 px-6 text-xs font-bold text-white hover:bg-green-700"
                  >
                    Add
                  </Button>

                  <p className="text-sm font-extrabold text-green-700">
                    {product.price}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
