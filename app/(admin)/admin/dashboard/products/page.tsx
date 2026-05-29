import Image from "next/image"
import { getProducts } from "@/modules/product/service/product.service"
import { getCategories } from "@/modules/category/service/category.service"
import { ProductFormDialog } from "@/modules/product/components/product-form-dialog"
import { DeleteProductButton } from "@/modules/product/components/delete-button"

import { AppSidebar } from "@/shared/components/app-sidebar"
import { SiteHeader } from "@/shared/components/site-header"
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"

export const dynamic = "force-dynamic";

function formatRupiah(value: number | string) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(value))
}

export default async function ProductsPage() {
  const productsResult = await getProducts()
  const categoriesResult = await getCategories()

  const products = productsResult.success ? productsResult.data ?? [] : []
  const categories = categoriesResult.success ? categoriesResult.data ?? [] : []

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
              
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Katalog Buah (Produk)</h1>
                  <p className="text-muted-foreground text-sm">Kelola semua produk buah segar, parsel, dan buah kering Anda.</p>
                </div>
                <div>
                  <ProductFormDialog categories={categories} />
                </div>
              </div>

              <Card>
                <CardHeader className="px-6 py-4">
                  <CardTitle className="text-lg">Daftar Produk</CardTitle>
                  <CardDescription>Menampilkan total {products.length} produk buah terdaftar.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">Gambar</TableHead>
                          <TableHead>Nama Produk</TableHead>
                          <TableHead>Kategori</TableHead>
                          <TableHead className="text-right">Harga</TableHead>
                          <TableHead className="text-center w-25">Stok</TableHead>
                          <TableHead className="text-center w-30">Status</TableHead>
                          <TableHead className="text-right w-50">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                              Belum ada produk. Klik "Tambah Produk" untuk membuat baru.
                            </TableCell>
                          </TableRow>
                        ) : (
                          products.map((product: any) => {
                            const isOutOfStock = product.stock <= 0;
                            const isLowStock = product.stock > 0 && product.stock <= 10;
                            
                            return (
                              <TableRow key={product.id}>
                                <TableCell>
                                  <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-neutral-100 border border-neutral-200">
                                    {product.imageUrl ? (
                                      <Image
                                        src={product.imageUrl}
                                        alt={product.name}
                                        fill
                                        sizes="40px"
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-neutral-400">
                                        N/A
                                      </div>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="font-semibold text-neutral-950 dark:text-neutral-50">{product.name}</span>
                                    <span className="text-xs text-neutral-500 font-mono">{product.slug}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline">
                                    {product.category?.name ?? "Tidak ada kategori"}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right font-medium">
                                  {formatRupiah(product.price)}
                                </TableCell>
                                <TableCell className="text-center font-semibold">
                                  {product.stock}
                                </TableCell>
                                <TableCell className="text-center">
                                  {isOutOfStock ? (
                                    <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300">Habis</Badge>
                                  ) : isLowStock ? (
                                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300">Hampir Habis</Badge>
                                  ) : (
                                    <Badge className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300">Tersedia</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <ProductFormDialog product={product} categories={categories} />
                                    <DeleteProductButton id={product.id} name={product.name} />
                                  </div>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
