"use client";

import Image from "next/image";
import slugify from "slugify";
import { useState } from "react";
import type { Category, Product } from "@/app/generated/prisma/client";
import { Pencil, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  productSchema,
  type ProductInput,
} from "@/modules/product/schema/product.schema";
import {
  createProductAction,
  updateProductAction,
} from "@/modules/product/service/product.service";
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

type ProductFormDialogProps = {
  product?: Product;
  categories: Category[];
};

function generateSlug(value: string) {
  return slugify(value, {
    lower: true,
    strict: true,
    trim: true,
  });
}

export function ProductFormDialog({
  product,
  categories,
}: ProductFormDialogProps) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(product?.imageUrl ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      categoryId: product?.categoryId ?? "",
      price: product ? Number(product.price) : 0,
      stock: product?.stock ?? 0,
      imageUrl: product?.imageUrl ?? "",
      description: product?.description ?? "",
    },
  });

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function onSubmit(values: ProductInput) {
    try {
      let imageUrl = values.imageUrl ?? "";

      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile, "products");
      }

      const formData = new FormData();

      formData.append("name", values.name);
      formData.append("slug", values.slug);
      formData.append("categoryId", values.categoryId);
      formData.append("price", String(values.price));
      formData.append("stock", String(values.stock));
      formData.append("imageUrl", imageUrl);
      formData.append("description", values.description ?? "");

      const result = isEdit
        ? await updateProductAction(product.id, formData)
        : await createProductAction(formData);

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
        name: product?.name ?? "",
        slug: product?.slug ?? "",
        categoryId: product?.categoryId ?? "",
        price: product ? Number(product.price) : 0,
        stock: product?.stock ?? 0,
        imageUrl: product?.imageUrl ?? "",
        description: product?.description ?? "",
      });

      setPreview(product?.imageUrl ?? "");
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
            Tambah Produk
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Produk" : "Tambah Produk"}
          </DialogTitle>
          <DialogDescription>
            Isi detail produk yang akan ditampilkan di toko.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Nama Produk
              </label>

              <Input
                placeholder="Pisang Sunrise"
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
                placeholder="pisang-sunrise"
                disabled={isSubmitting}
                {...register("slug")}
              />

              {errors.slug?.message && (
                <p className="text-xs font-medium text-red-500">
                  {errors.slug.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Kategori
            </label>

            <select
              disabled={isSubmitting}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              {...register("categoryId")}
            >
              <option value="">Pilih kategori</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {errors.categoryId?.message && (
              <p className="text-xs font-medium text-red-500">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Harga
              </label>

              <Input
                type="number"
                placeholder="15000"
                disabled={isSubmitting}
                {...register("price")}
              />

              {errors.price?.message && (
                <p className="text-xs font-medium text-red-500">
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Stok
              </label>

              <Input
                type="number"
                placeholder="100"
                disabled={isSubmitting}
                {...register("stock")}
              />

              {errors.stock?.message && (
                <p className="text-xs font-medium text-red-500">
                  {errors.stock.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Gambar Produk
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
                  alt="Preview produk"
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Deskripsi
            </label>

            <textarea
              rows={3}
              placeholder="Deskripsi produk"
              disabled={isSubmitting}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              {...register("description")}
            />
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