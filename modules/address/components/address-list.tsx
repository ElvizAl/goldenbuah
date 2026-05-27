"use client";

import type { Address } from "@/app/generated/prisma/client";
import { MapPin, Phone, User } from "lucide-react";

import { EditAddressDialog } from "@/modules/address/components/edit-address-dialog";
import { DeleteAddressButton } from "@/modules/address/components/delete-address-dialog";

type AddressListProps = {
  addresses: Address[];
};

const labelMap = {
  HOME: "Rumah",
  WORK: "Kantor",
  WAREHOUSE: "Gudang",
  OTHER: "Lainnya",
};

export function AddressList({ addresses }: AddressListProps) {
  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <div
          key={address.id}
          className="rounded-2xl border border-neutral-100 bg-white p-5 shadow-sm"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-600">
                {labelMap[address.label]}
              </span>

              {address.isDefault && (
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                  Default
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <EditAddressDialog address={address} />
              <DeleteAddressButton addressId={address.id} />
            </div>
          </div>

          <div className="space-y-2 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-neutral-400" />
              <span className="font-semibold text-neutral-800">
                {address.recipientName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-neutral-400" />
              <span>{address.phone}</span>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 text-neutral-400" />

              <div>
                <p>{address.fullAddress}</p>
                <p>
                  {[
                    address.subdistrictName,
                    address.districtName,
                    address.cityName,
                    address.provinceName,
                    address.postalCode,
                  ]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}