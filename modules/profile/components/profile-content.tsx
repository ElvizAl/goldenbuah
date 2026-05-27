"use client";

import { useRouter } from "next/navigation";
import type { Profile } from "@/app/generated/prisma/client";

import { ProfileForm } from "./profile-form";
import { CreateProfileDialog } from "@/modules/profile/components/create-profile-dialog";

type ProfileContentProps = {
  email: string;
  profile: Profile | null;
};

export function ProfileContent({ email, profile }: ProfileContentProps) {
  const router = useRouter();

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
          <div className="flex-1 rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-neutral-800">
              Profile belum dibuat
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Lengkapi profile kamu terlebih dahulu untuk melanjutkan.
            </p>

            <div className="mt-6 flex justify-center">
              <CreateProfileDialog
                onSuccess={() => router.refresh()}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ProfileForm profile={profile} email={email} />;
}