import { z } from "zod";

export const addressTypeSchema = z.enum([
  "HOME",
  "WORK",
  "WAREHOUSE",
  "OTHER",
]);

export const addressSchema = z.object({
  label: addressTypeSchema,

  recipientName: z
    .string()
    .trim()
    .min(1, "Nama penerima wajib diisi")
    .max(100, "Nama penerima maksimal 100 karakter"),

  phone: z
    .string()
    .trim()
    .min(10, "Nomor HP minimal 10 digit")
    .max(15, "Nomor HP maksimal 15 digit")
    .regex(/^[0-9]+$/, "Nomor HP hanya boleh angka"),

  fullAddress: z
    .string()
    .trim()
    .min(5, "Alamat lengkap wajib diisi")
    .max(500, "Alamat lengkap maksimal 500 karakter"),

  provinceId: z.string().min(1, "Provinsi wajib dipilih"),
  provinceName: z.string().min(1, "Nama provinsi wajib diisi"),

  cityId: z.string().min(1, "Kota/Kabupaten wajib dipilih"),
  cityName: z.string().min(1, "Nama kota wajib diisi"),

  districtId: z.string().min(1, "Kecamatan wajib dipilih"),
  districtName: z.string().min(1, "Nama kecamatan wajib diisi"),

  subdistrictId: z.string().optional().nullable(),
  subdistrictName: z.string().optional().nullable(),

  postalCode: z.string().optional().nullable(),

  isDefault: z.boolean().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;