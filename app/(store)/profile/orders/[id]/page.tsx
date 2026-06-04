import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  ArrowLeft,
  Package,
  Truck,
  Store,
  MapPin,
  Phone,
  User,
  Clock,
  Star,
  FileText,
} from "lucide-react";

import { getUser } from "@/modules/auth/auth-session";
import { getOrderDetail } from "@/modules/orders/service/order.service";
import { getPaymentInfo } from "@/modules/orders/service/payment.service";
import { OrderStatusBadge } from "@/modules/orders/components/order-status-badge";
import { CancelOrderButton } from "@/modules/orders/components/cancel-order-button";
import { PaymentForm } from "@/modules/orders/components/payment-form";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await getUser();
  if (!user) redirect("/login");

  const { data: order } = await getOrderDetail(id);
  if (!order) notFound();

  const canCancel = ["PENDING", "WAITING_CONFIRMATION"].includes(order.status);
  const canPay = order.status === "PENDING";
  const isCompleted = order.status === "COMPLETED";
  const isPaid = ["PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED"].includes(order.status);

  const paymentInfo = await getPaymentInfo();

  return (
    <div className="min-h-screen bg-slate-50 px-4 md:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Back */}
        <div className="mb-4 pt-2">
          <Link
            href="/profile/orders"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Pesanan
          </Link>
        </div>

        <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm md:p-8">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b border-neutral-100 pb-5">
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">
                {order.orderCode}
              </h1>
              <p className="mt-1 text-sm text-neutral-400">
                {format(new Date(order.createdAt), "d MMMM yyyy, HH:mm", {
                  locale: localeId,
                })}
              </p>
            </div>
            <OrderStatusBadge status={order.status as never} />
          </div>

          <div className="space-y-4">
            {/* Payment Form / Status */}
            {(canPay || order.payment) && (
              <PaymentForm
                orderId={order.id}
                total={order.total}
                bankAccounts={paymentInfo.bankAccounts}
                qrisImageUrl={paymentInfo.qrisImageUrl}
                existingPayment={order.payment}
              />
            )}

            {/* Fulfillment info */}
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                {order.fulfillmentType === "DELIVERY" ? (
                  <>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <Truck className="h-4 w-4 text-blue-500" />
                    </span>
                    Pengiriman
                  </>
                ) : (
                  <>
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                      <Store className="h-4 w-4 text-green-600" />
                    </span>
                    Ambil di Toko
                  </>
                )}
              </div>

              {order.fulfillmentType === "DELIVERY" && order.courierName && (
                <p className="mt-2 text-sm text-neutral-500">
                  {order.courierName} – {order.courierService}
                  {order.courierEtd && ` (${order.courierEtd} hari)`}
                </p>
              )}

              {/* Alamat */}
              {order.fulfillmentType === "DELIVERY" && (
                <div className="mt-3 space-y-2 border-t border-neutral-200 pt-3 text-sm text-neutral-600">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-neutral-400" />
                    <span className="font-semibold text-neutral-800">
                      {order.recipientName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-neutral-400" />
                    <span>{order.phone}</span>
                  </div>
                  {order.fullAddress && (
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-neutral-400" />
                      <div>
                        <p>{order.fullAddress}</p>
                        <p>
                          {[
                            order.districtName,
                            order.cityName,
                            order.provinceName,
                            order.postalCode,
                          ]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pickup info */}
              {order.fulfillmentType === "PICKUP" && (
                <div className="mt-3 space-y-2 border-t border-neutral-200 pt-3 text-sm text-neutral-600">
                  {order.pickupCode && (
                    <p>
                      Kode Pickup:{" "}
                      <span className="font-mono font-bold text-neutral-800">
                        {order.pickupCode}
                      </span>
                    </p>
                  )}
                  {order.pickupStoreName && (
                    <p>Toko: {order.pickupStoreName}</p>
                  )}
                  {order.pickupStoreAddress && (
                    <p className="text-neutral-400">{order.pickupStoreAddress}</p>
                  )}
                  {order.pickupReadyAt && (
                    <div className="flex items-center gap-2 text-green-600">
                      <Clock className="h-4 w-4" />
                      Siap diambil sejak{" "}
                      {format(new Date(order.pickupReadyAt), "d MMM HH:mm", {
                        locale: localeId,
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Items */}
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5">
              <h2 className="mb-4 text-sm font-bold text-neutral-700">
                Item Pesanan
              </h2>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    {item.productImageUrl ? (
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-neutral-100 bg-white">
                        <Image
                          src={item.productImageUrl}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-neutral-100 bg-white">
                        <Package className="h-5 w-5 text-neutral-300" />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-neutral-800">
                        {item.productName}
                      </p>
                      <p className="text-xs text-neutral-400">
                        {item.quantity} × Rp {item.price.toLocaleString("id-ID")}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-neutral-800">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Ringkasan harga */}
            <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5 text-sm">
              <h2 className="mb-4 font-bold text-neutral-700">
                Ringkasan Harga
              </h2>
              <div className="space-y-2 text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>Rp {order.subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ongkos Kirim</span>
                  <span>
                    {order.shipping > 0
                      ? `Rp ${order.shipping.toLocaleString("id-ID")}`
                      : "Gratis"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-neutral-200 pt-2 font-bold text-neutral-800">
                  <span>Total</span>
                  <span>Rp {order.total.toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            {/* Catatan */}
            {order.note && (
              <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5 text-sm">
                <h2 className="mb-2 font-bold text-neutral-700">Catatan</h2>
                <p className="text-neutral-500">{order.note}</p>
              </div>
            )}

            {/* Invoice & Ulasan */}
            {(isPaid || isCompleted) && (
              <div className="flex flex-wrap items-center justify-end gap-3">
                <Link
                  href={`/profile/orders/${order.id}/invoice`}
                  className="inline-flex items-center gap-2 rounded-xl bg-neutral-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-neutral-700"
                >
                  <FileText className="h-4 w-4" />
                  Lihat Invoice
                </Link>
                {isCompleted && (
                  <Link
                    href="/profile/reviews"
                    className="inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-5 py-2.5 text-sm font-semibold text-yellow-900 transition hover:bg-yellow-500"
                  >
                    <Star className="h-4 w-4" />
                    Beri Ulasan
                  </Link>
                )}
              </div>
            )}

            {/* Cancel */}
            {canCancel && (
              <div className="flex justify-end">
                <CancelOrderButton orderId={order.id} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
