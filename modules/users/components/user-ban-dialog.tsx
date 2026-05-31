"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog"
import { Button } from "@/shared/components/ui/button"
import { Ban, ShieldAlert, Loader2, PlayCircle } from "lucide-react"
import { authClient } from "@/modules/auth/auth-client"
import { toast } from "sonner"

interface UserBanDialogProps {
  user: {
    id: string
    name: string
    banned: boolean | null
  }
}

export function UserBanDialog({ user }: UserBanDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const isBanned = user.banned === true

  const handleAction = async () => {
    try {
      setIsLoading(true)
      
      if (isBanned) {
        // UNBAN
        const { error } = await authClient.admin.unbanUser({
            userId: user.id,
        })
        if (error) throw new Error(error.message)
        toast.success(`Akun ${user.name} berhasil diaktifkan kembali.`)
      } else {
        // BAN
        const { error } = await authClient.admin.banUser({
            userId: user.id,
            banReason: "Pelanggaran aturan admin."
        })
        if (error) throw new Error(error.message)
        toast.success(`Akun ${user.name} berhasil dinonaktifkan (Banned).`)
      }

      setOpen(false)
      router.refresh()
    } catch (err: any) {
      toast.error(err.message || "Gagal mengubah status akun pengguna.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={isBanned ? "outline" : "destructive"} size="sm" className="h-8 shadow-sm">
          {isBanned ? (
            <><PlayCircle className="mr-1 h-3.5 w-3.5" /> Buka Ban</>
          ) : (
            <><Ban className="mr-1 h-3.5 w-3.5" /> Ban User</>
          )}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            {isBanned ? "Buka Blokir (Unban)" : "Ban Pengguna"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isBanned 
                ? `Apakah Anda yakin ingin memulihkan status akun ${user.name}? Mereka akan bisa login kembali.`
                : `Apakah Anda yakin ingin melakukan ban pada ${user.name}? Mereka akan ditendang keluar dan tidak bisa mengakses dashboard atau web.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleAction} 
            className={isBanned ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isBanned ? "Ya, Unban Sekarang" : "Ya, Ban Akun Ini"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
