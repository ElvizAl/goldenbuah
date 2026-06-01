import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().min(1, "Produk wajib dipilih"),
  quantity: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && Number.isInteger(val), "Jumlah harus angka bulat")
    .refine((val) => val >= 1, "Jumlah minimal 1"),
});

export const updateCartItemSchema = z.object({
  quantity: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && Number.isInteger(val), "Jumlah harus angka bulat")
    .refine((val) => val >= 1, "Jumlah minimal 1"),
});

export type AddToCartInput = z.input<typeof addToCartSchema>;
export type UpdateCartItemInput = z.input<typeof updateCartItemSchema>;
