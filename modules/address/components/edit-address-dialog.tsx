"use client";

import { useEffect, useState } from "react";
import { Edit3 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Address } from "@/app/generated/prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  addressSchema,
  type AddressInput,
} from "@/modules/address/schema/address.schema";
import { updateAddressAction } from "@/modules/address/service/address.service";

import {
  getCitiesAction,
  getDistrictsAction,
  getProvincesAction,
  getSubdistrictsAction,
} from "@/modules/rajaongkir/action/rajaongkir.action";
import type { RajaOngkirLocation } from "@/modules/rajaongkir/service/rajaongkir.service";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/components/ui/dialog";

type EditAddressDialogProps = {
  address: Address;
};

export function EditAddressDialog({ address }: EditAddressDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const [provinces, setProvinces] = useState<RajaOngkirLocation[]>([]);
  const [cities, setCities] = useState<RajaOngkirLocation[]>([]);
  const [districts, setDistricts] = useState<RajaOngkirLocation[]>([]);
  const [subdistricts, setSubdistricts] = useState<RajaOngkirLocation[]>([]);

  const [isLoadingProvince, setIsLoadingProvince] = useState(false);
  const [isLoadingCity, setIsLoadingCity] = useState(false);
  const [isLoadingDistrict, setIsLoadingDistrict] = useState(false);
  const [isLoadingSubdistrict, setIsLoadingSubdistrict] = useState(false);

  const defaultValues: AddressInput = {
    label: address.label,
    recipientName: address.recipientName,
    phone: address.phone,
    fullAddress: address.fullAddress,

    provinceId: address.provinceId ?? "",
    provinceName: address.provinceName ?? "",

    cityId: address.cityId ?? "",
    cityName: address.cityName ?? "",

    districtId: address.districtId ?? "",
    districtName: address.districtName ?? "",

    subdistrictId: address.subdistrictId ?? "",
    subdistrictName: address.subdistrictName ?? "",

    postalCode: address.postalCode ?? "",
    isDefault: address.isDefault,
  };

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues,
  });

  const provinceId = watch("provinceId");
  const cityId = watch("cityId");
  const districtId = watch("districtId");

  useEffect(() => {
    if (!open) return;

    async function loadInitialLocations() {
      setIsLoadingProvince(true);

      const provinceResult = await getProvincesAction();

      if (!provinceResult.success) {
        toast.error(provinceResult.message);
        setIsLoadingProvince(false);
        return;
      }

      setProvinces(provinceResult.data);
      setIsLoadingProvince(false);

      if (address.provinceId) {
        setIsLoadingCity(true);
        const cityResult = await getCitiesAction(address.provinceId);

        if (cityResult.success) {
          setCities(cityResult.data);
        }

        setIsLoadingCity(false);
      }

      if (address.cityId) {
        setIsLoadingDistrict(true);
        const districtResult = await getDistrictsAction(address.cityId);

        if (districtResult.success) {
          setDistricts(districtResult.data);
        }

        setIsLoadingDistrict(false);
      }

      if (address.districtId) {
        setIsLoadingSubdistrict(true);
        const subdistrictResult = await getSubdistrictsAction(address.districtId);

        if (subdistrictResult.success) {
          setSubdistricts(subdistrictResult.data);
        }

        setIsLoadingSubdistrict(false);
      }
    }

    reset(defaultValues);
    loadInitialLocations();
  }, [open]);

  const provinceRegister = register("provinceId");
  const cityRegister = register("cityId");
  const districtRegister = register("districtId");
  const subdistrictRegister = register("subdistrictId");

  async function handleProvinceChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    provinceRegister.onChange(event);

    const selectedProvinceId = event.target.value;
    const selectedProvince = provinces.find(
      (item) => String(item.id) === selectedProvinceId
    );

    setValue("provinceName", selectedProvince?.name ?? "");

    setValue("cityId", "");
    setValue("cityName", "");
    setValue("districtId", "");
    setValue("districtName", "");
    setValue("subdistrictId", "");
    setValue("subdistrictName", "");
    setValue("postalCode", "");

    setCities([]);
    setDistricts([]);
    setSubdistricts([]);

    if (!selectedProvinceId) return;

    setIsLoadingCity(true);

    const result = await getCitiesAction(selectedProvinceId);

    if (!result.success) {
      toast.error(result.message);
    } else {
      setCities(result.data);
    }

    setIsLoadingCity(false);
  }

  async function handleCityChange(event: React.ChangeEvent<HTMLSelectElement>) {
    cityRegister.onChange(event);

    const selectedCityId = event.target.value;
    const selectedCity = cities.find(
      (item) => String(item.id) === selectedCityId
    );

    setValue("cityName", selectedCity?.name ?? "");

    setValue("districtId", "");
    setValue("districtName", "");
    setValue("subdistrictId", "");
    setValue("subdistrictName", "");
    setValue("postalCode", "");

    setDistricts([]);
    setSubdistricts([]);

    if (!selectedCityId) return;

    setIsLoadingDistrict(true);

    const result = await getDistrictsAction(selectedCityId);

    if (!result.success) {
      toast.error(result.message);
    } else {
      setDistricts(result.data);
    }

    setIsLoadingDistrict(false);
  }

  async function handleDistrictChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    districtRegister.onChange(event);

    const selectedDistrictId = event.target.value;
    const selectedDistrict = districts.find(
      (item) => String(item.id) === selectedDistrictId
    );

    setValue("districtName", selectedDistrict?.name ?? "");

    setValue("subdistrictId", "");
    setValue("subdistrictName", "");
    setValue("postalCode", "");

    setSubdistricts([]);

    if (!selectedDistrictId) return;

    setIsLoadingSubdistrict(true);

    const result = await getSubdistrictsAction(selectedDistrictId);

    if (!result.success) {
      toast.error(result.message);
    } else {
      setSubdistricts(result.data);
    }

    setIsLoadingSubdistrict(false);
  }

  function handleSubdistrictChange(event: React.ChangeEvent<HTMLSelectElement>) {
    subdistrictRegister.onChange(event);

    const selectedSubdistrictId = event.target.value;
    const selectedSubdistrict = subdistricts.find(
      (item) => String(item.id) === selectedSubdistrictId
    );

    setValue("subdistrictName", selectedSubdistrict?.name ?? "");
    setValue("postalCode", selectedSubdistrict?.zip_code ?? "");
  }

  async function onSubmit(values: AddressInput) {
    const formData = new FormData();

    formData.append("label", values.label);
    formData.append("recipientName", values.recipientName);
    formData.append("phone", values.phone);
    formData.append("fullAddress", values.fullAddress);

    formData.append("provinceId", values.provinceId);
    formData.append("provinceName", values.provinceName);

    formData.append("cityId", values.cityId);
    formData.append("cityName", values.cityName);

    formData.append("districtId", values.districtId);
    formData.append("districtName", values.districtName);

    formData.append("subdistrictId", values.subdistrictId ?? "");
    formData.append("subdistrictName", values.subdistrictName ?? "");
    formData.append("postalCode", values.postalCode ?? "");

    formData.append("isDefault", values.isDefault ? "true" : "false");

    const result = await updateAddressAction(address.id, formData);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    setOpen(false);
    router.refresh();
  }

  const inputClass =
    "w-full rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-800 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-neutral-50 disabled:opacity-80";

  const errorClass = "text-xs font-medium text-red-500";

  const isLoadingLocation =
    isLoadingProvince ||
    isLoadingCity ||
    isLoadingDistrict ||
    isLoadingSubdistrict;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="rounded-lg border border-cyan-100 px-3 py-1.5 text-xs font-semibold text-cyan-600 transition hover:bg-cyan-50"
        >
          <span className="inline-flex items-center gap-1.5">
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </span>
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Alamat</DialogTitle>
          <DialogDescription>
            Ubah data alamat pengiriman kamu.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Label
              </label>

              <select
                className={inputClass}
                disabled={isSubmitting}
                {...register("label")}
              >
                <option value="HOME">Rumah</option>
                <option value="WORK">Kantor</option>
                <option value="WAREHOUSE">Gudang</option>
                <option value="OTHER">Lainnya</option>
              </select>

              {errors.label?.message && (
                <p className={errorClass}>{errors.label.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                Nomor HP
              </label>

              <input
                type="text"
                placeholder="081234567890"
                className={inputClass}
                disabled={isSubmitting}
                {...register("phone")}
              />

              {errors.phone?.message && (
                <p className={errorClass}>{errors.phone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Nama Penerima
            </label>

            <input
              type="text"
              placeholder="Nama penerima"
              className={inputClass}
              disabled={isSubmitting}
              {...register("recipientName")}
            />

            {errors.recipientName?.message && (
              <p className={errorClass}>{errors.recipientName.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
              Alamat Lengkap
            </label>

            <textarea
              placeholder="Jl, nomor rumah, RT/RW, patokan"
              rows={3}
              className={inputClass}
              disabled={isSubmitting}
              {...register("fullAddress")}
            />

            {errors.fullAddress?.message && (
              <p className={errorClass}>{errors.fullAddress.message}</p>
            )}
          </div>

          <div className="rounded-xl border border-dashed border-neutral-200 p-4">
            <p className="mb-4 text-sm font-bold text-neutral-700">
              Wilayah Pengiriman
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Provinsi
                </label>

                <select
                  className={inputClass}
                  disabled={isSubmitting || isLoadingProvince}
                  name={provinceRegister.name}
                  ref={provinceRegister.ref}
                  onBlur={provinceRegister.onBlur}
                  value={provinceId}
                  onChange={handleProvinceChange}
                >
                  <option value="">
                    {isLoadingProvince ? "Memuat provinsi..." : "Pilih provinsi"}
                  </option>

                  {provinces.map((province) => (
                    <option key={province.id} value={String(province.id)}>
                      {province.name}
                    </option>
                  ))}
                </select>

                {errors.provinceId?.message && (
                  <p className={errorClass}>{errors.provinceId.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Kota/Kabupaten
                </label>

                <select
                  className={inputClass}
                  disabled={isSubmitting || !provinceId || isLoadingCity}
                  name={cityRegister.name}
                  ref={cityRegister.ref}
                  onBlur={cityRegister.onBlur}
                  value={cityId}
                  onChange={handleCityChange}
                >
                  <option value="">
                    {isLoadingCity ? "Memuat kota..." : "Pilih kota/kabupaten"}
                  </option>

                  {cities.map((city) => (
                    <option key={city.id} value={String(city.id)}>
                      {city.name}
                    </option>
                  ))}
                </select>

                {errors.cityId?.message && (
                  <p className={errorClass}>{errors.cityId.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Kecamatan
                </label>

                <select
                  className={inputClass}
                  disabled={isSubmitting || !cityId || isLoadingDistrict}
                  name={districtRegister.name}
                  ref={districtRegister.ref}
                  onBlur={districtRegister.onBlur}
                  value={districtId}
                  onChange={handleDistrictChange}
                >
                  <option value="">
                    {isLoadingDistrict ? "Memuat kecamatan..." : "Pilih kecamatan"}
                  </option>

                  {districts.map((district) => (
                    <option key={district.id} value={String(district.id)}>
                      {district.name}
                    </option>
                  ))}
                </select>

                {errors.districtId?.message && (
                  <p className={errorClass}>{errors.districtId.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Kelurahan/Desa
                </label>

                <select
                  className={inputClass}
                  disabled={isSubmitting || !districtId || isLoadingSubdistrict}
                  name={subdistrictRegister.name}
                  ref={subdistrictRegister.ref}
                  onBlur={subdistrictRegister.onBlur}
                  value={watch("subdistrictId") ?? ""}
                  onChange={handleSubdistrictChange}
                >
                  <option value="">
                    {isLoadingSubdistrict
                      ? "Memuat kelurahan..."
                      : "Pilih kelurahan/desa"}
                  </option>

                  {subdistricts.map((subdistrict) => (
                    <option key={subdistrict.id} value={String(subdistrict.id)}>
                      {subdistrict.name}
                    </option>
                  ))}
                </select>

                {errors.subdistrictId?.message && (
                  <p className={errorClass}>{errors.subdistrictId.message}</p>
                )}
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-600">
                  Kode Pos
                </label>

                <input
                  type="text"
                  placeholder="Kode pos"
                  className={inputClass}
                  disabled
                  {...register("postalCode")}
                />
              </div>
            </div>
          </div>

          <input type="hidden" {...register("provinceName")} />
          <input type="hidden" {...register("cityName")} />
          <input type="hidden" {...register("districtName")} />
          <input type="hidden" {...register("subdistrictName")} />

          <label className="flex items-center gap-2 text-sm font-medium text-neutral-700">
            <input
              type="checkbox"
              disabled={isSubmitting}
              {...register("isDefault")}
            />
            Jadikan alamat utama
          </label>

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
              disabled={isSubmitting || isLoadingLocation}
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