"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteAddressAction } from "@/modules/address/service/address.service";

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
} from "@/shared/components/ui/alert-dialog";

type DeleteAddressButtonProps = {
  addressId: string;
};

export function DeleteAddressButton({ addressId }: DeleteAddressButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);

    const result = await deleteAddressAction(addressId);

    if (!result.success) {
      toast.error(result.message);
      setIsDeleting(false);
      return;
    }

    toast.success(result.message);
    setIsDeleting(false);
    router.refresh();
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50"
        >
          <span className="inline-flex items-center gap-1.5">
            <Trash2 className="h-3.5 w-3.5" />
            Hapus
          </span>
        </button>
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus alamat?</AlertDialogTitle>
          <AlertDialogDescription>
            Alamat ini akan dihapus dari akun kamu. Tindakan ini tidak bisa
            dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Batal
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={isDeleting}
            onClick={handleDelete}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            {isDeleting ? "Menghapus..." : "Hapus"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}