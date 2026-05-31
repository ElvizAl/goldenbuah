import { getProducts } from "@/modules/product/service/product.service"
import { getCategories } from "@/modules/category/service/category.service"
import { ProductBanners } from "@/modules/product/components/product-banners"
import { ProductGrid } from "@/modules/product/components/product-grid"

export const metadata = {
    title: "Semua Produk | Golden Buah",
    description: "Temukan koleksi buah segar lokal, musiman, dan impor terbaik dari Golden Buah.",
}

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string; categoryId?: string; page?: string }>
}) {
    const sp = await searchParams;
    const query = sp.query ?? "";
    const categoryId = sp.categoryId ?? "";
    const page = sp.page ? parseInt(sp.page, 10) : 1;

    // Fetch products and categories on the server side
    const [productsResult, categoriesResult] = await Promise.all([
        getProducts({ query, categoryId, page }),
        getCategories(),
    ])

    const products = productsResult.success ? productsResult.data ?? [] : []
    const categories = categoriesResult.success ? categoriesResult.data ?? [] : []
    const pagination = productsResult.pagination

    return (
        <main className="min-h-screen bg-white py-12 px-4 md:px-8">
            <div className="max-w-6xl mx-auto">
                {/* 1. Big left banner & 2 smaller stacked right banners */}
                <ProductBanners />
                
                {/* 2. Headline for catalog */}
                <div className="text-center mt-16">
                    <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
                        Katalog Buah Segar
                    </h1>
                    <p className="mt-2 text-sm text-neutral-500 max-w-md mx-auto">
                        Pilih kategori, cari buah favorit Anda, dan tambahkan langsung ke keranjang belanja Anda.
                    </p>
                </div>

                {/* 3. Product grid containing: Circular Category Filters + Filtered Products Grid and Pagination */}
                <ProductGrid
                    initialProducts={products}
                    categories={categories}
                    initialQuery={query}
                    initialCategoryId={categoryId}
                    pagination={pagination}
                />
            </div>
        </main>
    )
}
