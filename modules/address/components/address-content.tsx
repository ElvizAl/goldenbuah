"use client";

import type { Address } from "@/app/generated/prisma/client";

import { AddressList } from "@/modules/address/components/address-list";
import { CreateAddressDialog } from "@/modules/address/components/create-address-dialog";

type AddressContentProps = {
  addresses: Address[];
};

export function AddressContent({ addresses }: AddressContentProps) {
  if (addresses.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 md:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
          <div className="flex-1 rounded-2xl border border-neutral-100 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-neutral-800">
              Belum ada alamat
            </h1>

            <p className="mt-2 text-sm text-neutral-500">
              Tambahkan alamat pengiriman agar proses checkout lebih mudah.
            </p>

            <div className="mt-6 flex justify-center">
              <CreateAddressDialog />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
        <div className="flex-1 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center justify-between border-b border-neutral-100 pb-5">
            <h1 className="text-2xl font-bold text-neutral-800">
              Alamat Saya
            </h1>

            <CreateAddressDialog />
          </div>

          <AddressList addresses={addresses} />
        </div>
      </div>
    </div>
  );
}