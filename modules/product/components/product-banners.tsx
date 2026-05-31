import Image from "next/image"

export const ProductBanners = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Big Left Banner (takes 2 columns) */}
            <div className="md:col-span-2 relative h-[250px] md:h-[350px] rounded-2xl overflow-hidden bg-gradient-to-r from-green-600 to-emerald-500 shadow-sm flex items-center p-8 md:p-12 text-white">
                <div className="relative z-10 max-w-md">
                    <span className="bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                        Diskon Spesial
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold mt-3 leading-tight">
                        Buah Lokal Pilihan Segar Setiap Hari!
                    </h2>
                    <p className="mt-2 text-sm text-white/90">
                        Dapatkan penawaran terbaik untuk buah-buahan organik segar langsung dari petani lokal kami.
                    </p>
                    <button className="mt-6 bg-white text-green-700 hover:bg-neutral-100 font-bold px-6 py-2.5 rounded-full text-xs transition duration-200">
                        Belanja Sekarang
                    </button>
                </div>
                {/* Decorative Fruit Background Layer */}
                <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-30 md:opacity-50">
                    <div className="relative h-full w-full">
                        <Image
                            src="/hero.png"
                            alt="Buah Segar"
                            fill
                            className="object-contain object-right-bottom scale-110 translate-x-5 translate-y-5"
                        />
                    </div>
                </div>
            </div>

            {/* Small Stacked Right Banners (takes 1 column) */}
            <div className="flex flex-col gap-4">
                {/* Upper Small Banner */}
                <div className="relative h-[117px] md:h-[167px] rounded-2xl overflow-hidden bg-gradient-to-r from-orange-400 to-amber-500 shadow-sm flex items-center p-6 text-white">
                    <div className="relative z-10">
                        <span className="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Musiman
                        </span>
                        <h3 className="text-lg md:text-xl font-bold mt-1">
                            Mangga Harum Manis
                        </h3>
                        <p className="text-xs text-white/90 mt-0.5">Diskon s.d. 30% minggu ini!</p>
                    </div>
                </div>

                {/* Lower Small Banner */}
                <div className="relative h-[117px] md:h-[167px] rounded-2xl overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-500 shadow-sm flex items-center p-6 text-white">
                    <div className="relative z-10">
                        <span className="bg-white/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Import
                        </span>
                        <h3 className="text-lg md:text-xl font-bold mt-1">
                            Apel Fuji Premium
                        </h3>
                        <p className="text-xs text-white/90 mt-0.5">Segar & renyah dari kebun terbaik</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
