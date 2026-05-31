"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select"
import { authClient } from "@/modules/auth/auth-client"
import { toast } from "sonner"
import { Settings2, Loader2 } from "lucide-react"

interface UserRoleDialogProps {
  user: {
    id: string
    name: string
    role: string
  }
}

export function UserRoleDialog({ user }: UserRoleDialogProps) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<string>(user.role)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    try {
      setIsLoading(true)
      
      const { data, error } = await authClient.admin.setRole({
        userId: user.id,
        role: role.toLowerCase() as "admin" | "user",
      })

      if (error) {
        toast.error("Gagal mengubah role", { description: error.message || "Pastikan Anda berstatus Admin." })
        return
      }

      toast.success("Berhasil mengubah role", { description: `Role untuk ${user.name} sekarang adalah ${role}` })
      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 shadow-sm">
          <Settings2 className="mr-1 h-3.5 w-3.5" />
          Ubah Role
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Ubah Peran Pengguna</DialogTitle>
          <DialogDescription>
            Ganti peran/role untuk <strong>{user.name}</strong>. Admin memiliki akses penuh ke sistem dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">User Reguler</SelectItem>
                <SelectItem value="ADMIN">Admin Sistem</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isLoading || role === user.role}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Simpan Perubahan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
