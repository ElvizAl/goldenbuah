import { z } from "zod";

export const createOrderSchema = z.object({
  fulfillmentType: z.enum(["DELIVERY", "PICKUP"]),

  // Wajib kalau DELIVERY
  addressId: z.string().optional().nullable(),

  // Ongkir & kurir (wajib kalau DELIVERY)
  courierCode: z.string().optional().nullable(),
  courierName: z.string().optional().nullable(),
  courierService: z.string().optional().nullable(),
  courierEtd: z.string().optional().nullable(),
  shipping: z.union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0, "Ongkir tidak valid")
    .optional()
    .default(0),

  // Info penerima / pengambil
  recipientName: z.string().min(1, "Nama penerima wajib diisi"),
  phone: z.string().optional().nullable().default(""),

  note: z.string().optional().nullable(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "WAITING_CONFIRMATION",
    "PAID",
    "PROCESSING",
    "READY_FOR_PICKUP",
    "SHIPPED",
    "COMPLETED",
    "CANCELLED",
  ]),
  note: z.string().optional().nullable(),
});

export type CreateOrderInput = z.input<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
