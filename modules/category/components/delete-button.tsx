"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { deleteCategoryAction } from "@/modules/category/service/category.service";

type DeleteCategoryButtonProps = {
  id: string;
  name: string;
};

export function DeleteCategoryButton({ id, name }: DeleteCategoryButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${name}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const result = await deleteCategoryAction(id);

        if (!result.success) {
          toast.error(result.message);
          return;
        }

        toast.success(result.message);
        router.refresh();
      } catch (error) {
        toast.error("Gagal menghapus kategori.");
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="text-red-600 border-red-200 bg-red-50/50 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:bg-red-950/10 dark:hover:bg-red-950/30 dark:text-red-400"
      disabled={isPending}
      onClick={handleDelete}
    >
      <Trash2 className="mr-2 h-4 w-4" />
      {isPending ? "Menghapus..." : "Hapus"}
    </Button>
  );
}
