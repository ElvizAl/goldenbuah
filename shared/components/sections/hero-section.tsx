import { ArrowRight } from "lucide-react"
import Image from "next/image"
import { Button } from "../ui/button"
import Link from "next/link"

export const HeroSection = () => {
    return (
        <section className="relative bg-[#F8F6F0]">
            <div className="max-w-7xl mx-auto top-0 px-5 py-6 md:py-8 lg:py-10">
                <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                    <div className="space-y-4">
                        <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                            Buah Segar <span className="text-green-500">Berkualitas</span> Langsung dari Kebun
                        </h1>
                        <p className="max-w-150 text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                            Nikmati kesegaran buah pilihan terbaik dengan kualitas premium. Kami menyediakan berbagai macam buah segar
                            yang dipetik langsung dari kebun.
                        </p>
                        <div className="flex flex-col gap-2 min-[400px]:flex-row">
                            <Link href="/produk">
                                <Button size="lg" className="cursor-pointer bg-[#01BC1D] px-5 py-5">
                                    Belanja Sekarang
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <div className="relative h-75 sm:h-100 lg:h-125 rounded-xl overflow-hidden">
                        <Image
                            src="/hero.png"
                            alt="Koleksi buah segar"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}