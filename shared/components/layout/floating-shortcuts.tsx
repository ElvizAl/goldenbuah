"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, ChevronLeft } from "lucide-react"

import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"

export function FloatingShortcuts() {
    const router = useRouter()
    const [isSearchExpanded, setIsSearchExpanded] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/produk?query=${encodeURIComponent(searchQuery)}`)
            // Jangan kembalikan setIsSearchExpanded(false) di sini agar kolom pencarian tetap tampil
        }
    }

    return (
        <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 flex flex-col items-end gap-4 pointer-events-none">
            
            {/* Tombol Kembali (Merah) */}
            <div 
                className="group relative pointer-events-auto flex justify-end"
                onClick={() => router.back()}
            >
                {/* 
                  Container ditarik sedikit keluar layar (translate-x-4).
                  Hover: menggunakan cubic-bezier elastic spring memantul ke kiri
                */}
                <div className="flex h-12 w-32 cursor-pointer items-center justify-start rounded-l-full bg-red-500 pl-3 shadow-[0_4px_20px_-4px_rgba(239,68,68,0.5)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] translate-x-20 hover:translate-x-0">
                    <ChevronLeft className="h-6 w-6 text-white mr-1" />
                    <span className="text-sm font-bold text-white tracking-wide">KEMBALI</span>
                </div>
            </div>

            {/* Tombol Cari (Biru) / Search Bar */}
            <div className="relative pointer-events-auto flex justify-end w-full">
                {isSearchExpanded ? (
                    <form 
                        onSubmit={handleSearch} 
                        // Form animasi masuk dari kanan, menggantikan tombol biru
                        className="flex h-12 items-center bg-white shadow-[0_8px_30px_-5px_rgba(37,99,235,0.3)] rounded-l-full border border-blue-100 pr-2 pl-2 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] animate-in slide-in-from-right-10 origin-right w-[260px]"
                    >
                        <Input 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari buah segar..." 
                            className="border-none focus-visible:ring-0 shadow-none h-full w-full text-sm pl-4 italic bg-transparent"
                            autoFocus
                            onBlur={(e) => {
                                // Jika blur terjadi tapi input tidak kosong, jangan tutup
                                // Jika input kosong, boleh ditutup setelah timeout singkat
                                if (!searchQuery.trim()) {
                                    setTimeout(() => setIsSearchExpanded(false), 200)
                                }
                            }}
                        />
                        <Button 
                            type="submit" 
                            size="icon"
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full h-8 w-8 shadow-sm flex-shrink-0"
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </form>
                ) : (
                    <div 
                        className="group cursor-pointer"
                        onClick={() => setIsSearchExpanded(true)}
                    >
                        <div className="flex h-12 w-28 items-center justify-start rounded-l-full bg-blue-600 pl-3 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.5)] transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] translate-x-[4.2rem] hover:translate-x-0">
                            <Search className="h-5 w-5 text-white mr-2" />
                            <span className="text-sm font-bold text-white tracking-wide">CARI</span>
                        </div>
                    </div>
                )}
            </div>

        </div>
    )
}
