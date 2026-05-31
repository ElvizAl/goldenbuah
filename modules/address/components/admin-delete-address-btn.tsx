"use client"

import { useState } from "react"
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
import { Trash2, Loader2 } from "lucide-react"
import { adminDeleteAddress } from "@/modules/address/service/admin-address.service"
import { toast } from "sonner"

interface AdminDeleteAddressBtnProps {
  id: string
  recipientName: string
}

export function AdminDeleteAddressBtn({ id, recipientName }: AdminDeleteAddressBtnProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    try {
      setIsLoading(true)
      const res = await adminDeleteAddress(id)
      
      if (res.success) {
        toast.success(res.message)
        setOpen(false)
      } else {
        toast.error(res.message)
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Hapus Alamat</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Alamat Pengiriman?</AlertDialogTitle>
          <AlertDialogDescription>
            Tindakan ini tidak bisa dibatalkan. Alamat penerima <strong>{recipientName}</strong> akan dihapus secara permanen dari database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Batal</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Ya, Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
