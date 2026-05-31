import { z } from "zod";

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama produk wajib diisi")
    .max(150, "Nama produk maksimal 150 karakter"),

  slug: z
    .string()
    .trim()
    .min(1, "Slug wajib diisi")
    .max(150, "Slug maksimal 150 karakter")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Format slug tidak valid"),

  categoryId: z.string().min(1, "Kategori wajib dipilih"),

  price: z.union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 1, "Harga wajib lebih dari 0"),

  stock: z.union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && Number.isInteger(val), "Stok harus angka bulat")
    .refine((val) => val >= 0, "Stok tidak boleh kurang dari 0"),

  imageUrl: z.string().optional().nullable(),

  description: z.string().optional().nullable(),
});

export type ProductInput = z.input<typeof productSchema>;
export type ProductOutput = z.infer<typeof productSchema>;
