import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import Image from "next/image";

import { getUser } from "@/modules/auth/auth-session";
import { getOrderDetail } from "@/modules/orders/service/order.service";
import { PrintInvoiceButton } from "@/modules/orders/components/print-invoice-button";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function InvoicePage({ params }: Props) {
  const { id } = await params;

  const user = await getUser();
  if (!user) redirect("/login");

  const { data: order } = await getOrderDetail(id);
  if (!order) notFound();

  // Only show invoice if payment is confirmed (PAID / beyond WAITING_CONFIRMATION)
  const paidStatuses = ["PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED"];
  if (!paidStatuses.includes(order.status)) redirect(`/profile/orders/${id}`);

  const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? "Golden Buah Store";
  const storeAddress = process.env.NEXT_PUBLIC_STORE_ADDRESS ?? "Jl. Kenaiban no. 54, Karawaci, Tangerang";
  const storePhone = process.env.NEXT_PUBLIC_STORE_PHONE ?? "+62 812 3456 7890";

  return (
    <>
      {/* Toolbar — hidden when printing */}
      <div className="no-print sticky top-0 z-40 border-b bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-8 py-3">
          <a
            href={`/profile/orders/${id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            ← Kembali ke Pesanan
          </a>
          <PrintInvoiceButton />
        </div>
      </div>

      {/* Invoice */}
      <div
        id="invoice-printable"
        className="min-h-screen bg-white"
      >
        <div className="mx-auto max-w-2xl px-8 py-10">

          {/* Header */}
          <div className="flex items-start justify-between border-b pb-6">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 40 40" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M28.0441 7.60927C28.8868 6.80331 30.2152 6.79965 31.0622 7.58229L31.1425 7.66005L31.4164 7.94729C34.1911 10.9318 35.2251 14.4098 34.9599 17.8065C34.6908 21.2511 33.1012 24.4994 30.8836 27.0664C28.6673 29.6316 25.7084 31.6519 22.51 32.5287C19.2714 33.4164 15.7294 33.1334 12.6547 30.9629C10.0469 29.1218 9.05406 26.1465 8.98661 23.2561C7.52323 22.5384 5.98346 21.6463 4.36789 20.5615L3.941 20.2716L3.85006 20.206C2.93285 19.5053 2.72313 18.2084 3.39161 17.2564C4.06029 16.3043 5.36233 16.046 6.34665 16.6512L6.44134 16.7126L6.83024 16.9771C7.79805 17.6269 8.72153 18.1903 9.59966 18.6767C10.1661 16.6889 11.1047 14.7802 12.3413 13.207C14.1938 10.8501 16.9713 8.96525 20.374 9.24647C23.439 9.49995 25.7036 11.081 26.8725 13.3122C28.0044 15.4728 28.0211 18.0719 27.0319 20.307C26.0234 22.5857 23.976 24.484 21.0309 25.2662C18.9114 25.8291 16.4284 25.7905 13.6267 25.0367C12.5115 24.7375 11.3427 24.323 10.1212 23.7846C9.8472 23.6638 9.60873 23.8483 10.1212 24.1686C11.5636 25.1924 13.5956 26.0505 14.1836 26.3385C14.4615 26.788 14.8061 27.1568 15.2011 27.4356C17.0188 28.7188 19.1451 28.9539 21.3396 28.3523C23.5743 27.7397 25.8141 26.2625 27.5514 24.2516C29.2873 22.2423 30.4065 19.8348 30.5909 17.4727C30.765 15.2439 30.1218 12.9543 28.1842 10.8736L27.9927 10.6731L27.9162 10.5906C27.1538 9.72748 27.2018 8.41516 28.0441 7.60927Z" fill="white"/>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-900">{storeName}</h1>
                <p className="text-xs text-neutral-500">{storeAddress}</p>
                <p className="text-xs text-neutral-500">{storePhone}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-neutral-900 tracking-tight">INVOICE</p>
              <p className="mt-1 font-mono text-sm font-bold text-green-600">{order.orderCode}</p>
              <p className="text-xs text-neutral-400">
                {format(new Date(order.createdAt), "d MMMM yyyy", { locale: localeId })}
              </p>
              <span className="mt-2 inline-block rounded-full bg-green-100 px-3 py-0.5 text-xs font-bold text-green-700">
                LUNAS
              </span>
            </div>
          </div>

          {/* Bill To & Delivery */}
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Tagihan Kepada</p>
              <p className="font-semibold text-neutral-800">{order.recipientName ?? user.name}</p>
              {order.phone && <p className="text-sm text-neutral-500">{order.phone}</p>}
              {order.fulfillmentType === "DELIVERY" && order.fullAddress && (
                <p className="mt-1 text-sm text-neutral-500 leading-relaxed">
                  {order.fullAddress}
                  {order.districtName && `, ${order.districtName}`}
                  {order.cityName && `, ${order.cityName}`}
                  {order.provinceName && `, ${order.provinceName}`}
                  {order.postalCode && ` ${order.postalCode}`}
                </p>
              )}
              {order.fulfillmentType === "PICKUP" && (
                <p className="mt-1 text-sm text-neutral-500">Ambil di Toko</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Info Pengiriman</p>
              {order.fulfillmentType === "DELIVERY" ? (
                <>
                  <p className="font-semibold text-neutral-800">
                    {order.courierName ?? "—"} — {order.courierService ?? ""}
                  </p>
                  {order.courierEtd && (
                    <p className="text-sm text-neutral-500">Estimasi {order.courierEtd} hari</p>
                  )}
                </>
              ) : (
                <>
                  <p className="font-semibold text-neutral-800">Ambil di Toko</p>
                  {order.pickupCode && (
                    <p className="text-sm text-neutral-500">
                      Kode: <span className="font-mono font-bold">{order.pickupCode}</span>
                    </p>
                  )}
                </>
              )}
              {order.payment && (
                <div className="mt-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-1">Pembayaran</p>
                  <p className="text-sm text-neutral-700">{order.payment.method ?? "Transfer"}</p>
                  {order.payment.confirmedAt && (
                    <p className="text-xs text-neutral-400">
                      Dikonfirmasi {format(new Date(order.payment.confirmedAt), "d MMM yyyy, HH:mm", { locale: localeId })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mt-8">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-neutral-900">
                  <th className="pb-2 text-left font-bold text-neutral-700">Produk</th>
                  <th className="pb-2 text-center font-bold text-neutral-700">Qty</th>
                  <th className="pb-2 text-right font-bold text-neutral-700">Harga</th>
                  <th className="pb-2 text-right font-bold text-neutral-700">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        {item.productImageUrl && (
                          <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border">
                            <Image
                              src={item.productImageUrl}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        )}
                        <span className="font-medium text-neutral-800">{item.productName}</span>
                      </div>
                    </td>
                    <td className="py-3 text-center text-neutral-600">{item.quantity} kg</td>
                    <td className="py-3 text-right text-neutral-600">
                      Rp {item.price.toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 text-right font-semibold text-neutral-800">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-4 flex justify-end">
            <div className="w-60 space-y-1.5 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>Rp {order.subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Ongkos Kirim</span>
                <span>
                  {order.shipping > 0
                    ? `Rp ${order.shipping.toLocaleString("id-ID")}`
                    : "Gratis"}
                </span>
              </div>
              <div className="flex justify-between border-t-2 border-neutral-900 pt-2 font-extrabold text-neutral-900 text-base">
                <span>Total</span>
                <span>Rp {order.total.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>

          {/* Note */}
          {order.note && (
            <div className="mt-6 rounded-lg bg-neutral-50 border px-4 py-3 text-sm text-neutral-600">
              <span className="font-semibold">Catatan: </span>{order.note}
            </div>
          )}

          {/* Footer */}
          <div className="mt-10 border-t pt-6 text-center text-xs text-neutral-400">
            <p>Terima kasih telah berbelanja di <span className="font-semibold text-neutral-600">{storeName}</span>.</p>
            <p className="mt-1">Invoice ini digenerate secara otomatis dan sah tanpa tanda tangan.</p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </>
  );
}
