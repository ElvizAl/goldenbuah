import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi")
    .max(100, "Nama kategori maksimal 100 karakter"),

  slug: z
    .string()
    .trim()
    .min(1, "Slug wajib diisi")
    .max(120, "Slug maksimal 120 karakter")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Format slug tidak valid"),

  imageUrl: z.string().optional().nullable(),
});

export type CategoryInput = z.infer<typeof categorySchema>;