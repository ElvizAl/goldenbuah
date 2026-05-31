import { getUsers } from "@/modules/users/service/users.service"
import { AppSidebar } from "@/shared/components/app-sidebar"
import { SiteHeader } from "@/shared/components/site-header"
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/components/ui/table"
import { Badge } from "@/shared/components/ui/badge"
import { ShieldCheck, User as UserIcon } from "lucide-react"
import { UserRoleDialog } from "@/modules/users/components/user-role-dialog"
import { UserBanDialog } from "@/modules/users/components/user-ban-dialog"

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const usersResult = await getUsers()
  const users = usersResult.success ? usersResult.data ?? [] : []

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
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Manajemen Pengguna</h1>
                  <p className="text-muted-foreground text-sm">Lihat semua akun tercatat dan atur *role* akses administrasi di sistem ini.</p>
                </div>
              </div>

              <Card>
                <CardHeader className="px-6 py-4">
                  <CardTitle className="text-lg">Daftar Pengguna</CardTitle>
                  <CardDescription>Menampilkan {users.length} pengguna atau admin terdaftar.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16 text-center">No</TableHead>
                          <TableHead>Nama Pengguna</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Verifikasi</TableHead>
                          <TableHead>Peran (Role)</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right w-64">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center py-8 text-neutral-500">
                              Tidak ada pengguna.
                            </TableCell>
                          </TableRow>
                        ) : (
                          users.map((user: any, idx: number) => {
                            const isAdmin = user.role === "ADMIN" || user.role?.toLowerCase() === "admin";
                            const isBanned = user.banned === true;
                            
                            return (
                              <TableRow key={user.id}>
                                <TableCell className="text-center font-medium text-neutral-500">
                                  {idx + 1}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2 font-semibold">
                                    {isAdmin ? <ShieldCheck className="w-4 h-4 text-primary" /> : <UserIcon className="w-4 h-4 text-neutral-400" />}
                                    {user.name}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm text-neutral-600">{user.email}</span>
                                </TableCell>
                                <TableCell>
                                  {user.emailVerified ? (
                                    <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">Terverifikasi</Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-yellow-700 bg-yellow-50 border-yellow-200">Belum Diverifikasi</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isAdmin ? (
                                    <Badge className="bg-primary hover:bg-primary text-primary-foreground">Admin</Badge>
                                  ) : (
                                    <Badge variant="secondary">User Reguler</Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isBanned ? (
                                    <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">Banned</Badge>
                                  ) : (
                                    <Badge variant="outline" className="bg-neutral-50 text-neutral-600">Aktif</Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div className="flex justify-end gap-2">
                                    <UserRoleDialog user={user} />
                                    <UserBanDialog user={user} />
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
