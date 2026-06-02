import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import React from "react";
import {
  ArrowLeft,
  Package,
  Truck,
  Store,
  MapPin,
  Phone,
  User,
  Mail,
} from "lucide-react";

import { getUser } from "@/modules/auth/auth-session";
import { adminGetOrderDetail } from "@/modules/orders/service/order.service";
import { OrderStatusBadge } from "@/modules/orders/components/order-status-badge";
import { AdminUpdateStatusForm } from "@/modules/orders/components/admin-update-status-form";
import { AdminPaymentConfirm } from "@/modules/orders/components/admin-payment-confirm";

import { AppSidebar } from "@/shared/components/app-sidebar";
import { SiteHeader } from "@/shared/components/site-header";
import { SidebarInset, SidebarProvider } from "@/shared/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;

  const user = await getUser();
  if (!user || user.role !== "ADMIN") redirect("/admin/login");

  const { data: order } = await adminGetOrderDetail(id);
  if (!order) notFound();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">

              {/* Back */}
              <Link
                href="/admin/dashboard/orders"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground w-fit"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke Daftar Pesanan
              </Link>

              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                    {order.orderCode}
                  </h1>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {format(new Date(order.createdAt), "d MMMM yyyy, HH:mm", {
                      locale: localeId,
                    })}
                  </p>
                </div>
                <OrderStatusBadge status={order.status as never} />
              </div>

              {/* Update Status */}
              <Card>
                <CardHeader className="px-6 py-4">
                  <CardTitle className="text-sm font-semibold">Perbarui Status Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-5">
                  <AdminUpdateStatusForm orderId={order.id} currentStatus={order.status} />
                </CardContent>
              </Card>

              <div className="grid gap-4 lg:grid-cols-2">
                {/* Info Pelanggan */}
                <Card>
                  <CardHeader className="px-6 py-4">
                    <CardTitle className="text-sm font-semibold">Info Pelanggan</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-5">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground/60" />
                        <span className="text-foreground font-medium">{order.user.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground/60" />
                        <span>{order.user.email}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Info Pengiriman */}
                <Card>
                  <CardHeader className="px-6 py-4">
                    <CardTitle className="text-sm font-semibold">Info Pengiriman</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-5">
                    <div className="flex items-center gap-2 text-sm font-medium">
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
                      <p className="mt-1 text-sm text-muted-foreground">
                        {order.courierName} – {order.courierService}
                        {order.courierEtd && ` (${order.courierEtd} hari)`}
                        {order.totalWeight && ` · ${order.totalWeight}g`}
                      </p>
                    )}

                    {/* Pickup Code */}
                    {order.fulfillmentType === "PICKUP" && order.pickupCode && (
                      <div className="mt-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                        <p className="text-xs text-green-600 font-medium">Kode Pickup</p>
                        <p className="font-mono text-lg font-bold tracking-widest text-green-800">
                          {order.pickupCode}
                        </p>
                        {order.pickupStoreName && (
                          <p className="mt-0.5 text-xs text-green-600">{order.pickupStoreName}</p>
                        )}
                        {order.pickupStoreAddress && (
                          <p className="text-xs text-green-500">{order.pickupStoreAddress}</p>
                        )}
                      </div>
                    )}

                    <div className="mt-3 space-y-1 border-t pt-3 text-sm text-muted-foreground">
                      <div className="flex items-start gap-2">
                        <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/60" />
                        <span className="text-foreground">{order.recipientName}</span>
                      </div>
                      {order.phone && (
                        <div className="flex items-start gap-2">
                          <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/60" />
                          <span>{order.phone}</span>
                        </div>
                      )}
                      {order.fullAddress && (
                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/60" />
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
                  </CardContent>
                </Card>
              </div>

              {/* Items */}
              <Card>
                <CardHeader className="px-6 py-4">
                  <CardTitle className="text-sm font-semibold">Item Pesanan</CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-5">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        {item.productImageUrl ? (
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border bg-neutral-100">
                            <Image
                              src={item.productImageUrl}
                              alt={item.productName}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg border bg-neutral-100">
                            <Package className="h-5 w-5 text-neutral-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × Rp {item.price.toLocaleString("id-ID")}
                          </p>
                        </div>
                        <span className="text-sm font-medium">
                          Rp {item.subtotal.toLocaleString("id-ID")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Ringkasan */}
                  <div className="mt-4 space-y-2 border-t pt-4 text-sm text-muted-foreground">
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
                    <div className="flex justify-between font-semibold text-foreground">
                      <span>Total</span>
                      <span>Rp {order.total.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pembayaran */}
              {order.payment && (
                <AdminPaymentConfirm payment={order.payment} />
              )}

              {/* Catatan */}
              {order.note && (
                <Card>
                  <CardHeader className="px-6 py-4">
                    <CardTitle className="text-sm font-semibold">Catatan</CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-5">
                    <p className="text-sm text-muted-foreground">{order.note}</p>
                  </CardContent>
                </Card>
              )}

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
