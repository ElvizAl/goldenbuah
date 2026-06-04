"use client"

import { useState, useEffect } from "react"
import { Search, Loader2, Star } from "lucide-react"
import Image from "next/image"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

import Link from "next/link"
import { Card, CardContent } from "@/shared/components/ui/card"
import { Badge } from "@/shared/components/ui/badge"
import { Input } from "@/shared/components/ui/input"
import { ProductCategories } from "@/modules/product/components/product-categories"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/shared/components/ui/pagination"
import { AddToCartButton } from "@/modules/cart/components/add-to-cart-button"
import { getCategoryBadgeClass } from "@/shared/lib/category-color"

function formatRupiah(value: number | string) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(Number(value))
}

interface Category {
    id: string
    name: string
    slug: string
    imageUrl: string | null
}

interface Product {
    id: string
    name: string
    slug: string
    description: string | null
    price: number
    stock: number
    imageUrl: string | null
    categoryId: string
    category?: Category | null
    avgRating?: number | null
    reviewCount?: number
}

interface ProductGridProps {
    initialProducts: Product[]
    categories: Category[]
    initialQuery?: string
    initialCategoryId?: string
    pagination?: {
        totalItems: number
        totalPages: number
        currentPage: number
    }
}

export const ProductGrid = ({ initialProducts, categories, initialQuery = "", initialCategoryId = "", pagination }: ProductGridProps) => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [search, setSearch] = useState(initialQuery)
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(initialCategoryId || null)
    
    // Using isPending from useTransition would be better, but we will mock a loader here
    const [isPending, setIsPending] = useState(false)

    // Debounce search update to URL
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            const params = new URLSearchParams(searchParams)
            
            if (search) {
                params.set("query", search)
            } else {
                params.delete("query")
            }

            if (selectedCategoryId) {
                params.set("categoryId", selectedCategoryId)
            } else {
                params.delete("categoryId")
            }

            // Always reset to page 1 when search or category changes
            params.set("page", "1")

            const newUrl = `${pathname}?${params.toString()}`
            
            // Only push if the URL actually changed to prevent loops
            if (newUrl !== `${pathname}?${searchParams.toString()}`) {
                setIsPending(true)
                router.push(newUrl, { scroll: false })
                
                // End loading state slightly after push
                setTimeout(() => setIsPending(false), 300)
            }
        }, 500) // 500ms delay for typing

        return () => clearTimeout(debounceTimer)
    }, [search, selectedCategoryId, pathname, router, searchParams])

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set("page", newPage.toString())
        setIsPending(true)
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
        setTimeout(() => {
            setIsPending(false)
            // Scroll back to top of grid
            window.scrollTo({ top: 300, behavior: "smooth" })
        }, 300)
    }

    // Products are already filtered by the server!
    const filteredProducts = initialProducts

    return (
        <div className="w-full">
            {/* Circular Category Buttons Section */}
            <ProductCategories
                categories={categories}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={(id) => {
                    setSelectedCategoryId(id)
                }}
            />

            {/* Search Bar + Controls */}
            <div className="mb-12 max-w-md mx-auto">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground mr-2" />
                    <Input
                        type="text"
                        placeholder="Cari buah segar..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 h-11 rounded-full border-neutral-200 focus:border-green-500 focus:ring-green-500 bg-neutral-50 shadow-xs"
                    />
                </div>
            </div>

            {/* Category Header Mapping */}
            {(() => {
                const selectedCategory = categories.find((c) => c.id === selectedCategoryId)
                
                if (!selectedCategory) {
                    return (
                        <div className="mb-8 mt-12 flex items-center border-b pb-4">
                            <h2 className="text-3xl font-extrabold text-neutral-900 border-b-2 border-black pb-1 mr-3">Produk</h2>
                            <span className="text-3xl font-extrabold text-neutral-900">Semua</span>
                        </div>
                    )
                }

                // Determine color based on common category names/slugs
                const slugLower = selectedCategory.slug.toLowerCase()
                let colorClass = "text-neutral-900" // fallback
                if (slugLower.includes("lokal")) colorClass = "text-green-600"
                else if (slugLower.includes("musiman")) colorClass = "text-blue-500"
                else if (slugLower.includes("import") || slugLower.includes("impor")) colorClass = "text-orange-600"
                else colorClass = "text-[#01BC1D]"

                return (
                    <div className="mb-8 mt-12 flex items-center border-b pb-4">
                        <h2 className="text-3xl font-extrabold text-neutral-900 border-b-2 border-black pb-1 mr-3">Produk</h2>
                        <span className={`text-3xl font-extrabold ${colorClass}`}>
                            {selectedCategory.name}
                        </span>
                    </div>
                )
            })()}

            {/* Grid Container */}
            {isPending ? (
                <div className="flex h-60 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-green-600" />
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <p className="text-lg font-medium">Buah yang kamu cari tidak ditemukan.</p>
                    <p className="text-sm mt-1">Coba gunakan kata kunci lain atau pilih kategori berbeda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-x-6 gap-y-20 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-24 lg:grid-cols-3 mt-16 md:mt-24">
                    {filteredProducts.map((product) => (
                        <Card
                            key={product.id}
                            className="relative h-60 flex flex-col justify-between overflow-visible rounded-[24px] border-none bg-[#e8e8e8] shadow-xs transition duration-300 hover:-translate-y-1 hover:shadow-md pt-12"
                        >
                            {/* Product Image Circular Badge — links to detail */}
                            <Link
                                href={`/produk/${product.slug}`}
                                className="absolute -top-14 left-6 z-10 block h-28 w-28 overflow-hidden rounded-full bg-black border-2 border-white shadow-md"
                            >
                                {product.imageUrl ? (
                                    <Image
                                        src={product.imageUrl}
                                        alt={product.name}
                                        fill
                                        sizes="112px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center text-xs font-bold text-neutral-400">
                                        N/A
                                    </div>
                                )}
                            </Link>

                            {/* Badges container on the top right */}
                            <div className="absolute right-5 top-5 flex items-center gap-2">
                                <Badge className={`rounded px-2.5 py-0.5 text-[10px] font-semibold ${getCategoryBadgeClass(product.category?.name ?? "")}`}>
                                    {product.category?.name ?? "Lainnya"}
                                </Badge>
                                {product.avgRating != null && (
                                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-500">
                                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                        {product.avgRating.toFixed(1)}
                                    </span>
                                )}
                                {product.stock <= 5 && product.stock > 0 && (
                                    <Badge className="rounded bg-amber-500 px-2.5 py-0.5 text-[10px] font-semibold text-white border-none">
                                        Menipis
                                    </Badge>
                                )}
                                {product.stock === 0 && (
                                    <Badge className="rounded bg-red-500 px-2.5 py-0.5 text-[10px] font-semibold text-white border-none">
                                        Habis
                                    </Badge>
                                )}
                            </div>

                            <CardContent className="p-6 pt-5 flex flex-col justify-between h-full w-full">
                                <div className="mt-2">
                                    <Link href={`/produk/${product.slug}`}>
                                        <h3 className="text-2xl font-extrabold text-[#01BC1D] hover:underline">
                                            {product.name}
                                        </h3>
                                    </Link>

                                    <p className="mt-2 text-xs font-medium leading-relaxed text-neutral-700 line-clamp-2">
                                        {product.description ?? "Buah segar berkualitas tinggi langsung untuk Anda."}
                                    </p>
                                </div>

                                <div className="mt-auto -bottom-5 pt-4 flex items-center justify-between">
                                    <AddToCartButton
                                        productId={product.id}
                                        productName={product.name}
                                        stock={product.stock}
                                    />

                                    <div className="text-right">
                                        <p className="text-sm font-extrabold text-green-700">
                                            {formatRupiah(product.price)}/kg
                                        </p>
                                        <p className="text-[10px] text-neutral-500 -mt-0.5">
                                            {product.reviewCount ? `${product.reviewCount} ulasan` : `Stok: ${product.stock > 0 ? `${product.stock} kg` : "Habis"}`}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination && (
                <div className="mt-16 sm:mt-24 mb-8 flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious 
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (pagination.currentPage > 1) {
                                            handlePageChange(pagination.currentPage - 1)
                                        }
                                    }}
                                    href="#"
                                    className={pagination.currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                            
                            {Array.from({ length: pagination.totalPages }).map((_, i) => {
                                const pageNumber = i + 1;
                                // Simple logic to only show nearby pages
                                if (
                                    pageNumber === 1 || 
                                    pageNumber === pagination.totalPages || 
                                    (pageNumber >= pagination.currentPage - 1 && pageNumber <= pagination.currentPage + 1)
                                ) {
                                    return (
                                        <PaginationItem key={pageNumber}>
                                            <PaginationLink 
                                                isActive={pageNumber === pagination.currentPage}
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    handlePageChange(pageNumber)
                                                }}
                                                href="#"
                                                className="cursor-pointer"
                                            >
                                                {pageNumber}
                                            </PaginationLink>
                                        </PaginationItem>
                                    );
                                }
                                
                                // Show ellipsis for skipped numbers
                                if (
                                    pageNumber === pagination.currentPage - 2 || 
                                    pageNumber === pagination.currentPage + 2
                                ) {
                                    return <PaginationItem key={pageNumber}><span className="px-2">...</span></PaginationItem>;
                                }
                                
                                return null;
                            })}

                            <PaginationItem>
                                <PaginationNext 
                                    onClick={(e) => {
                                        e.preventDefault()
                                        if (pagination.currentPage < pagination.totalPages) {
                                            handlePageChange(pagination.currentPage + 1)
                                        }
                                    }}
                                    href="#"
                                    className={pagination.currentPage >= pagination.totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    )
}
