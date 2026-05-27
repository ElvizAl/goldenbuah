"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  addressSchema,
  type AddressInput,
} from "@/modules/address/schema/address.schema";
import { createAddressAction } from "@/modules/address/service/address.service";

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

export function CreateAddressDialog() {
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

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: "HOME",
      recipientName: "",
      phone: "",
      fullAddress: "",

      provinceId: "",
      provinceName: "",

      cityId: "",
      cityName: "",

      districtId: "",
      districtName: "",

      subdistrictId: "",
      subdistrictName: "",

      postalCode: "",
      isDefault: false,
    },
  });

  const provinceId = watch("provinceId");
  const cityId = watch("cityId");
  const districtId = watch("districtId");
  const subdistrictId = watch("subdistrictId");

  useEffect(() => {
    if (!open) return;

    async function loadProvinces() {
      setIsLoadingProvince(true);

      const result = await getProvincesAction();

      if (!result.success) {
        toast.error(result.message);
      } else {
        setProvinces(result.data);
      }

      setIsLoadingProvince(false);
    }

    loadProvinces();
  }, [open]);

  useEffect(() => {
    if (!provinceId) return;

    async function loadCities() {
      setIsLoadingCity(true);

      setCities([]);
      setDistricts([]);
      setSubdistricts([]);

      setValue("cityId", "");
      setValue("cityName", "");
      setValue("districtId", "");
      setValue("districtName", "");
      setValue("subdistrictId", "");
      setValue("subdistrictName", "");
      setValue("postalCode", "");

      const selectedProvince = provinces.find(
        (item) => String(item.id) === String(provinceId)
      );

      setValue("provinceName", selectedProvince?.name ?? "");

      const result = await getCitiesAction(String(provinceId));

      if (!result.success) {
        toast.error(result.message);
      } else {
        setCities(result.data);
      }

      setIsLoadingCity(false);
    }

    loadCities();
  }, [provinceId, provinces, setValue]);

  useEffect(() => {
    if (!cityId) return;

    async function loadDistricts() {
      setIsLoadingDistrict(true);

      setDistricts([]);
      setSubdistricts([]);

      setValue("districtId", "");
      setValue("districtName", "");
      setValue("subdistrictId", "");
      setValue("subdistrictName", "");
      setValue("postalCode", "");

      const selectedCity = cities.find(
        (item) => String(item.id) === String(cityId)
      );

      setValue("cityName", selectedCity?.name ?? "");

      const result = await getDistrictsAction(String(cityId));

      if (!result.success) {
        toast.error(result.message);
      } else {
        setDistricts(result.data);
      }

      setIsLoadingDistrict(false);
    }

    loadDistricts();
  }, [cityId, cities, setValue]);

  useEffect(() => {
    if (!districtId) return;

    async function loadSubdistricts() {
      setIsLoadingSubdistrict(true);

      setSubdistricts([]);

      setValue("subdistrictId", "");
      setValue("subdistrictName", "");
      setValue("postalCode", "");

      const selectedDistrict = districts.find(
        (item) => String(item.id) === String(districtId)
      );

      setValue("districtName", selectedDistrict?.name ?? "");

      const result = await getSubdistrictsAction(String(districtId));

      if (!result.success) {
        toast.error(result.message);
      } else {
        setSubdistricts(result.data);
      }

      setIsLoadingSubdistrict(false);
    }

    loadSubdistricts();
  }, [districtId, districts, setValue]);

  useEffect(() => {
    if (!subdistrictId) return;

    const selectedSubdistrict = subdistricts.find(
      (item) => String(item.id) === String(subdistrictId)
    );

    setValue("subdistrictName", selectedSubdistrict?.name ?? "");
    setValue("postalCode", selectedSubdistrict?.zip_code ?? "");
  }, [subdistrictId, subdistricts, setValue]);

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

    const result = await createAddressAction(formData);

    if (!result.success) {
      toast.error(result.message);
      return;
    }

    toast.success(result.message);
    reset();
    setOpen(false);
    router.refresh();
  }

  function handleOpenChange(value: boolean) {
    setOpen(value);

    if (!value) {
      reset();
      setCities([]);
      setDistricts([]);
      setSubdistricts([]);
    }
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-[#01BC1D] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0d9622]"
        >
          <Plus className="h-4 w-4" />
          Tambah Alamat
        </button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Tambah Alamat</DialogTitle>
          <DialogDescription>
            Pilih wilayah secara bertingkat menggunakan RajaOngkir.
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
                  {...register("provinceId")}
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
                  {...register("cityId")}
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
                  {...register("districtId")}
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
                  {...register("subdistrictId")}
                >
                  <option value="">
                    {isLoadingSubdistrict
                      ? "Memuat kelurahan..."
                      : "Pilih kelurahan/desa"}
                  </option>

                  {subdistricts.map((subdistrict) => (
                    <option
                      key={subdistrict.id}
                      value={String(subdistrict.id)}
                    >
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