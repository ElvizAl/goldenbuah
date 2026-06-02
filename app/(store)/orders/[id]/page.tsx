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

  const paymentInfo = await getPaymentInfo();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Back */}
      <Link
        href="/orders"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Kembali ke Pesanan
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{order.orderCode}</h1>
          <p className="mt-0.5 text-sm text-gray-400">
            {format(new Date(order.createdAt), "d MMMM yyyy, HH:mm", {
              locale: localeId,
            })}
          </p>
        </div>
        <OrderStatusBadge status={order.status as never} />
      </div>

      {/* Payment Form / Status */}
      {(canPay || order.payment) && (
        <div className="mb-4">
          <PaymentForm
            orderId={order.id}
            total={order.total}
            bankAccounts={paymentInfo.bankAccounts}
            qrisImageUrl={paymentInfo.qrisImageUrl}
            existingPayment={order.payment}
          />
        </div>
      )}

      {/* Fulfillment info */}
      <div className="mb-4 rounded-xl border bg-white p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          {order.fulfillmentType === "DELIVERY" ? (
            <>
              <Truck className="h-4 w-4 text-blue-500" />
              Pengiriman
            </>
          ) : (
            <>
              <Store className="h-4 w-4 text-green-500" />
              Ambil di Toko
            </>
          )}
        </div>

        {order.fulfillmentType === "DELIVERY" && order.courierName && (
          <p className="mt-1 text-sm text-gray-500">
            {order.courierName} – {order.courierService}
            {order.courierEtd && ` (${order.courierEtd} hari)`}
          </p>
        )}

        {/* Alamat */}
        {order.fulfillmentType === "DELIVERY" && (
          <div className="mt-3 space-y-1 border-t pt-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
              <span>{order.recipientName}</span>
            </div>
            <div className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
              <span>{order.phone}</span>
            </div>
            {order.fullAddress && (
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                <span>
                  {order.fullAddress}
                  {order.districtName && `, ${order.districtName}`}
                  {order.cityName && `, ${order.cityName}`}
                  {order.provinceName && `, ${order.provinceName}`}
                  {order.postalCode && ` ${order.postalCode}`}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Pickup info */}
        {order.fulfillmentType === "PICKUP" && (
          <div className="mt-3 space-y-1 border-t pt-3 text-sm text-gray-600">
            {order.pickupCode && (
              <p>
                Kode Pickup:{" "}
                <span className="font-mono font-semibold">{order.pickupCode}</span>
              </p>
            )}
            {order.pickupStoreName && <p>Toko: {order.pickupStoreName}</p>}
            {order.pickupStoreAddress && (
              <p className="text-gray-500">{order.pickupStoreAddress}</p>
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
      <div className="mb-4 rounded-xl border bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-gray-700">
          Item Pesanan
        </h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              {item.productImageUrl ? (
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                  <Image
                    src={item.productImageUrl}
                    alt={item.productName}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border bg-gray-100">
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {item.productName}
                </p>
                <p className="text-xs text-gray-500">
                  {item.quantity} × Rp {item.price.toLocaleString("id-ID")}
                </p>
              </div>
              <span className="text-sm font-medium text-gray-800">
                Rp {item.subtotal.toLocaleString("id-ID")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ringkasan harga */}
      <div className="mb-4 rounded-xl border bg-white p-4 text-sm">
        <h2 className="mb-3 font-semibold text-gray-700">Ringkasan Harga</h2>
        <div className="space-y-2 text-gray-600">
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
          <div className="flex justify-between border-t pt-2 font-semibold text-gray-900">
            <span>Total</span>
            <span>Rp {order.total.toLocaleString("id-ID")}</span>
          </div>
        </div>
      </div>

      {/* Catatan */}
      {order.note && (
        <div className="mb-4 rounded-xl border bg-white p-4 text-sm">
          <h2 className="mb-1 font-semibold text-gray-700">Catatan</h2>
          <p className="text-gray-600">{order.note}</p>
        </div>
      )}

      {/* Cancel */}
      {canCancel && (
        <div className="mt-4 flex justify-end">
          <CancelOrderButton orderId={order.id} />
        </div>
      )}
    </div>
  );
}
