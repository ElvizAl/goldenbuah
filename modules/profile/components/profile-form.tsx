"use client";

import type { Profile } from "@/app/generated/prisma/client";
import { Edit3, CheckCircle2, AlertCircle } from "lucide-react";
import { EditProfileDialog } from "./edit-profile-dialog";

type ProfileFormProps = {
  email: string;
  profile: Profile;
};

export function ProfileForm({ profile, email }: ProfileFormProps) {
  const birthDate = profile.birthDate
    ? new Date(profile.birthDate).toISOString().split("T")[0]
    : "";

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <div className="flex-1 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-5">
            <h1 className="text-2xl font-bold text-neutral-800">Profile</h1>
            <EditProfileDialog profile={profile} />
          </div>

          <form className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Full Name
              </label>

              <input
                name="fullName"
                defaultValue={profile.fullName ?? ""}
                disabled
                placeholder="Masukkan nama lengkap"
                className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-800 outline-none disabled:cursor-not-allowed disabled:opacity-80"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Phone
                </label>

                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-600">
                  <AlertCircle className="h-3 w-3" />
                  Belum terifikasi
                </span>
              </div>

              <input
                name="phone"
                defaultValue={profile.phone ?? ""}
                disabled
                placeholder="Masukkan nomor telepon"
                className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-800 outline-none disabled:cursor-not-allowed disabled:opacity-80"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Email
                </label>

                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
                  <CheckCircle2 className="h-3 w-3" />
                  Sudah terverifikasi
                </span>
              </div>

              <input
                name="email"
                type="email"
                defaultValue={email}
                disabled
                placeholder="Email"
                className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-800 outline-none disabled:cursor-not-allowed disabled:opacity-80"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Gender
              </label>

              <input
                name="gender"
                defaultValue={profile.gender ?? ""}
                disabled
                placeholder="Gender"
                className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-800 outline-none disabled:cursor-not-allowed disabled:opacity-80"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Birth Date
              </label>

              <input
                name="birthDate"
                type="date"
                defaultValue={birthDate}
                disabled
                className="w-full rounded-md border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-800 outline-none disabled:cursor-not-allowed disabled:opacity-80"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}