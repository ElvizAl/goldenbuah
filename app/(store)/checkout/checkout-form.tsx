"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Package, Truck, Store, MapPin } from "lucide-react";

import { createOrderAction } from "@/modules/orders/service/order.service";
import { getAllCourierCostAction } from "@/modules/rajaongkir/action/rajaongkir.action";

// ─── Types ────────────────────────────────────────────────────────────────
interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    slug: string;
    price: number;
    weight: number;
    imageUrl?: string | null;
  };
}

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  fullAddress: string;
  provinceName?: string | null;
  cityName?: string | null;
  districtName?: string | null;
  subdistrictName?: string | null;
  postalCode?: string | null;
  districtId?: string | null;
  isDefault: boolean;
}

interface Cart {
  id: string;
  items: CartItem[];
}

interface CourierService {
  name: string;
  code: string;
  service: string;
  description: string;
  cost: number;
  etd: string;
}

interface CheckoutFormProps {
  cart: Cart;
  addresses: Address[];
  subtotal: number;
  totalWeight: number;
  userName: string;
  originDistrictId: string;
}

// ─── Konstanta ────────────────────────────────────────────────────────────
const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? "Golden Buah Store";
const STORE_ADDRESS = process.env.NEXT_PUBLIC_STORE_ADDRESS ?? "";

export function CheckoutForm({
  cart,
  addresses,
  subtotal,
  totalWeight,
  userName,
  originDistrictId,
}: CheckoutFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // State
  const [fulfillmentType, setFulfillmentType] = useState<"DELIVERY" | "PICKUP">(
    "DELIVERY"
  );
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? ""
  );
  const [courierServices, setCourierServices] = useState<CourierService[]>([]);
  const [selectedService, setSelectedService] = useState<CourierService | null>(null);
  const [loadingCourier, setLoadingCourier] = useState(false);
  const [note, setNote] = useState("");

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  // Hitung semua ongkir sekaligus
  async function handleGetCost() {
    if (!selectedAddress?.districtId) {
      toast.error("Alamat tidak memiliki data kecamatan untuk menghitung ongkir.");
      return;
    }

    setLoadingCourier(true);
    setSelectedService(null);
    setCourierServices([]);

    const result = await getAllCourierCostAction({
      originDistrictId,
      destinationDistrictId: selectedAddress.districtId,
      weight: totalWeight,
    });

    setLoadingCourier(false);

    if (!result.success || !result.data) {
      toast.error(result.message);
      return;
    }

    setCourierServices(result.data.services as CourierService[]);
  }

  // Submit order
  function handleSubmit() {
    if (fulfillmentType === "DELIVERY") {
      if (!selectedAddress) {
        toast.error("Pilih alamat pengiriman.");
        return;
      }
      if (!selectedService) {
        toast.error("Pilih layanan kurir & hitung ongkir terlebih dahulu.");
        return;
      }
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.set("fulfillmentType", fulfillmentType);
      formData.set("recipientName", selectedAddress?.recipientName ?? userName);
      formData.set("phone", selectedAddress?.phone ?? "");
      formData.set("note", note);

      if (fulfillmentType === "DELIVERY" && selectedAddress && selectedService) {
        formData.set("addressId", selectedAddress.id);
        formData.set("courierCode", selectedService.code ?? "");
        formData.set("courierName", selectedService.name ?? "");
        formData.set("courierService", selectedService.service);
        formData.set("courierEtd", selectedService.etd ?? "");
        formData.set("shipping", String(selectedService.cost));
      } else {
        // PICKUP
        formData.set("recipientName", userName);
        formData.set("shipping", "0");
      }

      const result = await createOrderAction(formData);

      if (result.success && result.data?.orderId) {
        toast.success(result.message);
        router.push(`/profile/orders/${result.data.orderId}`);
      } else {
        toast.error(result.message);
      }
    });
  }

  const shipping = fulfillmentType === "PICKUP" ? 0 : (selectedService?.cost ?? 0);
  const total = subtotal + shipping;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* ─── Kiri: Form ─── */}
      <div className="space-y-4 lg:col-span-2">

        {/* Pilih Metode */}
        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Metode Penerimaan
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setFulfillmentType("DELIVERY");
                setSelectedService(null);
                setCourierServices([]);
              }}
              className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition ${
                fulfillmentType === "DELIVERY"
                  ? "border-yellow-400 bg-yellow-50 text-yellow-800"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <Truck className="h-4 w-4" />
              Pengiriman
            </button>
            <button
              type="button"
              onClick={() => {
                setFulfillmentType("PICKUP");
                setSelectedService(null);
                setCourierServices([]);
              }}
              className={`flex items-center gap-2 rounded-lg border p-3 text-sm font-medium transition ${
                fulfillmentType === "PICKUP"
                  ? "border-yellow-400 bg-yellow-50 text-yellow-800"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <Store className="h-4 w-4" />
              Ambil di Toko
            </button>
          </div>
        </div>

        {/* Pilih Alamat (DELIVERY) */}
        {fulfillmentType === "DELIVERY" && (
          <div className="rounded-xl border bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">
                Alamat Pengiriman
              </h2>
              <a
                href="/profile/address"
                className="text-xs text-yellow-600 hover:underline"
              >
                + Tambah Alamat
              </a>
            </div>

            {addresses.length === 0 ? (
              <div className="rounded-lg border border-dashed p-4 text-center text-sm text-gray-400">
                Belum ada alamat tersimpan.{" "}
                <a href="/profile/address" className="text-yellow-600 hover:underline">
                  Tambah sekarang
                </a>
              </div>
            ) : (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                      selectedAddressId === addr.id
                        ? "border-yellow-400 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="addressId"
                      value={addr.id}
                      checked={selectedAddressId === addr.id}
                      onChange={() => {
                        setSelectedAddressId(addr.id);
                        setSelectedService(null);
                        setCourierServices([]);
                      }}
                      className="mt-0.5 accent-yellow-400"
                    />
                    <div className="flex-1 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">
                          {addr.recipientName}
                        </span>
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="rounded bg-yellow-100 px-1.5 py-0.5 text-xs text-yellow-700">
                            Utama
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-gray-500">{addr.phone}</p>
                      <p className="mt-0.5 text-gray-500">
                        {addr.fullAddress}
                        {addr.districtName && `, ${addr.districtName}`}
                        {addr.cityName && `, ${addr.cityName}`}
                        {addr.provinceName && `, ${addr.provinceName}`}
                        {addr.postalCode && ` ${addr.postalCode}`}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {/* Cek Ongkir */}
            {selectedAddress && (
              <div className="mt-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700">
                      Pilih Layanan Pengiriman
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Berat: <span className="font-medium text-gray-600">{totalWeight} gram ({(totalWeight / 1000).toFixed(2)} kg)</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleGetCost}
                    disabled={loadingCourier}
                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:opacity-50"
                  >
                    {loadingCourier ? "Mencari..." : courierServices.length > 0 ? "Refresh" : "Cek Ongkir"}
                  </button>
                </div>

                        {/* Pilih Layanan */}
                        {courierServices.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {courierServices.map((svc, idx) => (
                              <label
                                key={`${svc.code}-${svc.service}-${idx}`}
                                className={`flex cursor-pointer gap-3 rounded-lg border p-3 text-sm transition ${
                                  selectedService?.service === svc.service &&
                                  selectedService?.code === svc.code
                                    ? "border-yellow-400 bg-yellow-50"
                                    : "border-gray-200 hover:border-gray-300"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="courierService"
                                  checked={
                                    selectedService?.service === svc.service &&
                                    selectedService?.code === svc.code
                                  }
                                  onChange={() => setSelectedService(svc)}
                                  className="accent-yellow-400 mt-0.5 shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-1">
                                    <span className="font-medium text-gray-900">
                                      {svc.name}
                                    </span>
                                    <span className="text-gray-500">
                                      {svc.service}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-400 truncate">{svc.description}{svc.etd && ` · ${svc.etd}`}</p>
                                  <p className="mt-0.5 font-semibold text-gray-900 text-xs sm:text-sm">
                                    Rp {svc.cost.toLocaleString("id-ID")}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        )}
              </div>
            )}
          </div>
        )}

        {/* Info Ambil di Toko */}
        {fulfillmentType === "PICKUP" && (
          <div className="rounded-xl border bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-green-100">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{STORE_NAME}</p>
                {STORE_ADDRESS && (
                  <p className="mt-0.5 text-sm text-gray-500">{STORE_ADDRESS}</p>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Kode pickup akan diberikan setelah pesanan dikonfirmasi.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Catatan */}
        <div className="rounded-xl border bg-white p-4">
          <label
            htmlFor="note"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            Catatan (opsional)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            placeholder="Contoh: tolong dibungkus rapi..."
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
        </div>
      </div>

      {/* ─── Kanan: Ringkasan ─── */}
      <div className="space-y-4">
        {/* Item */}
        <div className="rounded-xl border bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">
            Ringkasan Pesanan
          </h2>
          <div className="space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                {item.product.imageUrl ? (
                  <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border bg-gray-100">
                    <Package className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-gray-900">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-400">×{item.quantity}</p>
                </div>
                <span className="text-xs font-medium text-gray-700">
                  Rp{" "}
                  {(item.product.price * item.quantity).toLocaleString("id-ID")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Harga */}
        <div className="rounded-xl border bg-white p-4 text-sm">
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>Rp {subtotal.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkos Kirim</span>
              <span>
                {fulfillmentType === "PICKUP"
                  ? "Gratis"
                  : selectedService
                  ? `Rp ${selectedService.cost.toLocaleString("id-ID")}`
                  : "—"}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold text-gray-900">
              <span>Total</span>
              <span>Rp {total.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              isPending ||
              (fulfillmentType === "DELIVERY" &&
                (!selectedAddress || !selectedService))
            }
            className="mt-4 w-full rounded-xl bg-yellow-400 py-3 text-sm font-semibold text-yellow-900 transition hover:bg-yellow-500 disabled:opacity-50"
          >
            {isPending ? "Memproses..." : "Buat Pesanan"}
          </button>

          {fulfillmentType === "DELIVERY" && !selectedService && (
            <p className="mt-2 text-center text-xs text-gray-400">
              Pilih alamat &amp; cek ongkir untuk melanjutkan
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
