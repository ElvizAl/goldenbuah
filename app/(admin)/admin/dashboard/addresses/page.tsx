import { getAllAddresses } from "@/modules/address/service/admin-address.service"
import { AppSidebar } from "@/shared/components/app-sidebar"
import { SiteHeader } from "@/shared/components/site-header"
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { AdminDeleteAddressBtn } from "@/modules/address/components/admin-delete-address-btn"
import { AdminEditAddressBtn } from "@/modules/address/components/admin-edit-address-btn"
import { MapPin, Phone } from "lucide-react"

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const addressesResult = await getAllAddresses()
  const addresses = addressesResult.success ? addressesResult.data ?? [] : []

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
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Alamat Pengiriman</h1>
                  <p className="text-muted-foreground text-sm">Validasi, kelola, atau hapus alamat pengiriman pelanggan dari sistem.</p>
                </div>
              </div>

              <Card>
                <CardHeader className="px-6 py-4">
                  <CardTitle className="text-lg">Daftar Seluruh Alamat</CardTitle>
                  <CardDescription>Menemukan {addresses.length} rekam alamat dari pengguna terdaftar.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16 text-center">No</TableHead>
                          <TableHead className="min-w-[150px]">Penerima & Kontak</TableHead>
                          <TableHead className="min-w-[150px]">Akun Pemilik</TableHead>
                          <TableHead className="min-w-[300px]">Detail Alamat</TableHead>
                          <TableHead>Label</TableHead>
                          <TableHead className="text-right w-24">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {addresses.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-neutral-500">
                              Belum ada alamat pengiriman di sistem.
                            </TableCell>
                          </TableRow>
                        ) : (
                          addresses.map((address: any, idx: number) => {
                            return (
                              <TableRow key={address.id}>
                                <TableCell className="text-center font-medium text-neutral-500">
                                  {idx + 1}
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">{address.recipientName}</span>
                                    <div className="flex items-center text-xs text-neutral-500 gap-1">
                                      <Phone className="h-3 w-3" /> {address.phone}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium">{address.user?.name || "Tanpa Nama"}</span>
                                    <span className="text-xs text-neutral-500">{address.user?.email}</span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                                    <span className="font-medium flex items-center gap-1">
                                       <MapPin className="h-3.5 w-3.5 text-neutral-400" />
                                       {address.fullAddress}
                                    </span>
                                    <span className="text-xs">
                                      {address.districtName}, {address.cityName}, {address.provinceName}
                                      {address.postalCode ? ` - ${address.postalCode}` : ""}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-2 items-start">
                                    <Badge variant="outline">{address.label}</Badge>
                                    {address.isDefault && (
                                       <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase">Default User</Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                     <AdminEditAddressBtn address={address} />
                                     <AdminDeleteAddressBtn id={address.id} recipientName={address.recipientName} />
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
