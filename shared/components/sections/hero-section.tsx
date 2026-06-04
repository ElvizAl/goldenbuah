import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";

export const HeroSection = () => {
  return (
    <section className="relative bg-[#F8F6F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">

          {/* Text content */}
          <div className="space-y-5 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl leading-tight">
              Buah Segar{" "}
              <span className="text-green-500">Berkualitas</span>{" "}
              Langsung dari Kebun
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0">
              Nikmati kesegaran buah pilihan terbaik dengan kualitas premium. Kami menyediakan berbagai macam buah segar
              yang dipetik langsung dari kebun.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href="/produk">
                <Button size="lg" className="w-full sm:w-auto cursor-pointer bg-[#01BC1D] hover:bg-[#00a519] px-6 py-5 text-base">
                  Belanja Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/#testimoni">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-6 py-5 text-base">
                  Lihat Testimoni
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative h-56 sm:h-80 md:h-96 lg:h-[480px] rounded-2xl overflow-hidden shadow-lg order-first lg:order-last">
            <Image
              src="/hero.png"
              alt="Koleksi buah segar"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
