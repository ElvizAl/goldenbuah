import Image from "next/image"
import { cn } from "@/shared/lib/utils"

interface CategoryCircle {
    id: string
    name: string
    imageUrl?: string | null
    slug: string
}

interface ProductCategoriesProps {
    categories: CategoryCircle[]
    selectedCategoryId: string | null
    onSelectCategory: (id: string | null) => void
}

export const ProductCategories = ({
    categories,
    selectedCategoryId,
    onSelectCategory,
}: ProductCategoriesProps) => {
    return (
        <div className="flex flex-col items-center justify-center my-12">
            {/* Horizontal Flex Container for Circular Badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14">
                {/* "Semua" / All Categories Option */}
                <button
                    onClick={() => onSelectCategory(null)}
                    className="flex flex-col items-center group transition focus:outline-hidden"
                >
                    <div
                        className={cn(
                            "h-20 w-28 md:h-24 md:w-24 rounded-full flex items-center justify-center text-4xl shadow-sm border-2 transition duration-300",
                            selectedCategoryId === null
                                ? "border-green-600 bg-green-50 scale-105"
                                : "border-neutral-200 bg-neutral-100 group-hover:border-neutral-400 group-hover:bg-neutral-50"
                        )}
                    >
                        🍎
                    </div>
                    <span
                        className={cn(
                            "mt-2 text-xs md:text-sm font-semibold tracking-wide transition duration-300",
                            selectedCategoryId === null
                                ? "text-green-700 font-bold"
                                : "text-neutral-600 group-hover:text-neutral-900"
                        )}
                    >
                        Semua
                    </span>
                </button>

                {categories.map((category) => {
                    const isSelected = selectedCategoryId === category.id
                    // Basic placeholder emoji mapping or fallback emoji
                    const emojiMap: Record<string, string> = {
                        lokal: "🍌",
                        musiman: "🥭",
                        import: "🍇",
                    }
                    const emoji = emojiMap[category.slug.toLowerCase()] || "🥝"

                    return (
                        <button
                            key={category.id}
                            onClick={() => onSelectCategory(category.id)}
                            className="flex flex-col items-center group transition focus:outline-hidden"
                        >
                            <div
                                className={cn(
                                    "h-20 w-28 md:h-24 md:w-24 rounded-full flex items-center justify-center overflow-hidden shadow-sm border-2 transition duration-300 relative",
                                    isSelected
                                        ? "border-green-600 bg-green-50 scale-105"
                                        : "border-neutral-200 bg-neutral-100 group-hover:border-neutral-400 group-hover:bg-neutral-50"
                                )}
                            >
                                {category.imageUrl ? (
                                    <Image
                                        src={category.imageUrl}
                                        alt={category.name}
                                        fill
                                        sizes="96px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <span className="text-4xl">{emoji}</span>
                                )}
                            </div>
                            <span
                                className={cn(
                                    "mt-2 text-xs md:text-sm font-semibold tracking-wide transition duration-300",
                                    isSelected
                                        ? "text-green-700 font-bold"
                                        : "text-neutral-600 group-hover:text-neutral-900"
                                )}
                            >
                                {category.name}
                            </span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
