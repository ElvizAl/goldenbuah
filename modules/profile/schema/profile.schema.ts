import { z } from "zod";

export const genderSchema = z.enum(["MALE", "FEMALE"]);

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Nama lengkap wajib diisi")
    .max(100, "Nama lengkap maksimal 100 karakter"),

  phone: z
    .string()
    .trim()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit")
    .regex(/^[0-9]+$/, "Nomor telepon hanya boleh angka"),

  gender: genderSchema,

  birthDate: z
    .string()
    .min(1, "Tanggal lahir wajib diisi")
    .refine((value) => !Number.isNaN(Date.parse(value)), {
      message: "Tanggal lahir tidak valid",
    }),
});

export type ProfileInput = z.infer<typeof profileSchema>;