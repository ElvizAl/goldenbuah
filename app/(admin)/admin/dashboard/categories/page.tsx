import Image from "next/image"
import { getCategories } from "@/modules/category/service/category.service"
import { CategoryFormDialog } from "@/modules/category/components/create-form-dialog"
import { DeleteCategoryButton } from "@/modules/category/components/delete-button"

import { AppSidebar } from "@/shared/components/app-sidebar"
import { SiteHeader } from "@/shared/components/site-header"
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const result = await getCategories()
  const categories = result.success ? result.data ?? [] : []

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
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Kategori Buah</h1>
                  <p className="text-muted-foreground text-sm">Kelola semua kategori produk buah yang ada di toko Anda.</p>
                </div>
                <div>
                  <CategoryFormDialog />
                </div>
              </div>

              <Card>
                <CardHeader className="px-6 py-4">
                  <CardTitle className="text-lg">Daftar Kategori</CardTitle>
                  <CardDescription>Menampilkan total {categories.length} kategori buah yang aktif.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-20">Gambar</TableHead>
                          <TableHead>Nama Kategori</TableHead>
                          <TableHead>Slug</TableHead>
                          <TableHead className="text-center w-30">Jumlah Produk</TableHead>
                          <TableHead className="text-right w-50">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categories.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              Belum ada kategori. Klik "Tambah Kategori" untuk membuat baru.
                            </TableCell>
                          </TableRow>
                        ) : (
                          categories.map((category: any) => (
                            <TableRow key={category.id}>
                              <TableCell>
                                <div className="relative h-10 w-10 overflow-hidden rounded-lg bg-neutral-100 border border-neutral-200">
                                  {category.imageUrl ? (
                                    <Image
                                      src={category.imageUrl}
                                      alt={category.name}
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
                              <TableCell className="font-semibold text-neutral-950 dark:text-neutral-50 border-t border-neutral-100 dark:border-neutral-800">
                                {category.name}
                              </TableCell>
                              <TableCell className="font-mono text-xs text-neutral-500">
                                {category.slug}
                              </TableCell>
                              <TableCell className="text-center font-medium">
                                {category._count?.products ?? 0}
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <CategoryFormDialog category={category} />
                                  <DeleteCategoryButton id={category.id} name={category.name} />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
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
