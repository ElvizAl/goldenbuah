"use client";

import Image from "next/image";
import slugify from "slugify";
import { useState } from "react";
import type { Category } from "@/app/generated/prisma/client";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  categorySchema,
  type CategoryInput,
} from "@/modules/category/schema/category.schema";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/modules/category/service/category.service";
import { uploadImage } from "@/shared/lib/upload-image";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

type CategoryFormDialogProps = {
  category?: Category;
};

function generateSlug(value: string) {
  return slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export function CategoryFormDialog({ category }: CategoryFormDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(category?.imageUrl ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isEdit = !!category;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      imageUrl: category?.imageUrl ?? "",
    },
  });

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function onSubmit(values: CategoryInput) {
    try {
      let imageUrl = values.imageUrl ?? "";

      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile, "categories");
      }

      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("slug", values.slug);
      formData.append("imageUrl", imageUrl);

      const result = isEdit
        ? await updateCategoryAction(category.id, formData)
        : await createCategoryAction(formData);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      setOpen(false);
      setSelectedFile(null);
      setPreview("");
      reset();
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Gagal menyimpan.");
    }
  }

  function handleOpenChange(value: boolean) {
    setOpen(value);

    if (!value) {
      reset({
        name: category?.name ?? "",
        slug: category?.slug ?? "",
        imageUrl: category?.imageUrl ?? "",
      });

      setPreview(category?.imageUrl ?? "");
      setSelectedFile(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="outline" size="sm">
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
        ) : (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kategori
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Kategori" : "Tambah Kategori"}
          </DialogTitle>
          <DialogDescription>
            Isi data kategori produk.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Nama Kategori
            </label>

            <Input
              placeholder="Contoh: Buah"
              disabled={isSubmitting}
              {...register("name", {
                onChange: (event) => {
                  setValue("slug", generateSlug(event.target.value), {
                    shouldValidate: true,
                  });
                },
              })}
            />

            {errors.name?.message && (
              <p className="text-xs font-medium text-red-500">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Slug
            </label>

            <Input
              placeholder="buah"
              disabled={isSubmitting}
              {...register("slug")}
            />

            {errors.slug?.message && (
              <p className="text-xs font-medium text-red-500">
                {errors.slug.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Gambar Kategori
            </label>

            <Input
              type="file"
              accept="image/*"
              disabled={isSubmitting}
              onChange={handleImageChange}
            />

            <input type="hidden" {...register("imageUrl")} />

            {preview && (
              <div className="relative mt-3 h-32 w-32 overflow-hidden rounded-xl bg-neutral-100">
                <Image
                  src={preview}
                  alt="Preview kategori"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}