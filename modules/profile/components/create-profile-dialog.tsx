"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  profileSchema,
  type ProfileInput,
} from "@/modules/profile/schema/profile.schema";
import { createMyProfileAction } from "@/modules/profile/service/profil.service";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

export function CreateProfileDialog({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      gender: "MALE",
      birthDate: "",
    },
  });

  async function onSubmit(values: ProfileInput) {
    const formData = new FormData();

    formData.append("fullName", values.fullName);
    formData.append("phone", values.phone);
    formData.append("gender", values.gender);
    formData.append("birthDate", values.birthDate);

    const result = await createMyProfileAction(formData);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    reset();
    setOpen(false);
    onSuccess?.();
  }

  const inputClass =
    "w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-800 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-80";

  const errorClass = "text-xs font-medium text-red-500";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-[#01BC1D] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0d9622]"
        >
          <UserPlus className="h-4 w-4" />
          Buat Profile
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Buat Profile</DialogTitle>
          <DialogDescription>
            Lengkapi data profile kamu terlebih dahulu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="fullName"
              className="text-xs font-bold uppercase tracking-wider text-neutral-600"
            >
              Full Name
            </label>

            <input
              id="fullName"
              type="text"
              placeholder="Masukkan nama lengkap"
              className={inputClass}
              disabled={isSubmitting}
              {...register("fullName")}
            />

            {errors.fullName?.message && (
              <p className={errorClass}>{errors.fullName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="phone"
              className="text-xs font-bold uppercase tracking-wider text-neutral-600"
            >
              Phone
            </label>

            <input
              id="phone"
              type="text"
              placeholder="Masukkan nomor telepon"
              className={inputClass}
              disabled={isSubmitting}
              {...register("phone")}
            />

            {errors.phone?.message && (
              <p className={errorClass}>{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="gender"
              className="text-xs font-bold uppercase tracking-wider text-neutral-600"
            >
              Gender
            </label>

            <select
              id="gender"
              className={inputClass}
              disabled={isSubmitting}
              {...register("gender")}
            >
              <option value="MALE">Laki-laki</option>
              <option value="FEMALE">Perempuan</option>
            </select>

            {errors.gender?.message && (
              <p className={errorClass}>{errors.gender.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="birthDate"
              className="text-xs font-bold uppercase tracking-wider text-neutral-600"
            >
              Birth Date
            </label>

            <input
              id="birthDate"
              type="date"
              className={inputClass}
              disabled={isSubmitting}
              {...register("birthDate")}
            />

            {errors.birthDate?.message && (
              <p className={errorClass}>{errors.birthDate.message}</p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => setOpen(false)}
              className="rounded-lg border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-[#01BC1D] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#0d9622] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}